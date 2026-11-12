// Canvas 2D particle renderer for rain, snow, falling leaves and dust motes in sunlight.
//
// What makes rain read as real rather than as lines over a video:
//   - Depth. Every drop gets a depth z (0 far, 1 near), weighted heavily toward far. Far drops are
//     thin, short and slow on screen; near drops are rare, wide, soft and faint, like out-of-focus
//     drops close to a lens. Beyond the individual drops, a scrolling "sheet" of tiny streaks stands
//     in for the rain too far away to resolve, which is what gives heavy rain its veil.
//   - Exposure. A camera sees a drop as a streak as long as the distance it falls while the shutter
//     is open, so streak length follows speed rather than being a fixed size, with a bright head
//     and a fading tail.
//   - Light. Rain is only visible where something lights it. We can't read the cross-origin video,
//     so scenes author their light sources (lamps, windows); drops are faint away from them and
//     bright and warm near them.
//   - Landing. A drop stops where the ground at its own distance is, so far rain ends around the
//     horizon and only the nearest drops reach the bottom of the picture. Without this, every drop
//     falls through the foreground floor, which flattens the whole scene.
//   - Depth of field. Far, mid and near drops are drawn as separate layers: the far layer slightly
//     soft, the mid layer sharp (the focus plane), the near layer strongly out of focus.
// A gentle gust modulates the wind so the fall never looks mechanical.
//
// Renderer interface (shared with any future WebGL renderer):
//   setParams({ kind, density, speed, wind, drift, particleScale, sheet, opacity, unit, lights, lightFloor, ground })
//   drift is a steady sideways lean with no gust, the rain streaming past a moving train's window
//     lights    [{ x, y, radius, color }] in canvas px, or null for evenly lit
//     ground    { far, near } canvas y where the farthest and nearest particles land, or null
//   resize(cssWidth, cssHeight, dpr)
//   setPlaying(bool)   frozen frames stay on the canvas while paused
//   destroy()

const REFERENCE_AREA = 1280 * 720;
const MAX_PARTICLES = 1800;
const BASE_COUNT = { rain: 900, snow: 700, leaves: 150, motes: 160 };
// Longer than a real shutter: cozy-video rain reads as long fine threads, not dashes
const SHUTTER = 1 / 22;
// Off-screen depth layers are drawn at this fraction of CSS resolution: they get blurred anyway
const LAYER_SCALE = 0.5;
const FAR_DEPTH = 0.35;
const NEAR_DEPTH = 0.75;
// Default landing lines (fractions of the canvas height) for scenes that don't author a ground
const DEFAULT_GROUND = { far: 0.8, near: 1.08 };
// Muted, natural autumn tones; saturated oranges read as cartoon confetti over real footage
const LEAF_COLORS = ['#a0461c', '#b85a1f', '#c97a2a', '#8a3418', '#d19a3a', '#7d4a1e', '#9b6a2a', '#b8862d'];
const LEAF_SHAPES = ['maple', 'oval', 'narrow'];
// Depth weighting per kind: higher exponents push more particles into the distance
const DEPTH_BIAS = { rain: 2.2, snow: 1.8, leaves: 1.6, motes: 1.4 };

// Particles that mix with the picture's light (rain, snow) use CSS screen blending; leaves are opaque,
// and beads on glass draw their own dark rims, which screen blending would erase
export const blendFor = (kind) => (kind === 'leaves' || kind === 'glass' ? 'normal' : 'screen');

const spriteCache = {};
const makeSprite = (key, width, height, draw) => {
  if (!spriteCache[key]) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext('2d'), width, height);
    spriteCache[key] = canvas;
  }
  return spriteCache[key];
};

// A rain streak: a drop smeared evenly over the exposure, so even along its length with soft ends,
// and soft across its width.
// The soft variant is for near, out-of-focus drops.
const streakSprite = (soft) => makeSprite(soft ? 'streak-soft' : 'streak', 16, 128, (ctx, w, h) => {
  const along = ctx.createLinearGradient(0, 0, 0, h);
  along.addColorStop(0, 'rgba(200,208,220,0)');
  along.addColorStop(0.2, 'rgba(200,208,220,0.75)');
  along.addColorStop(0.75, 'rgba(200,208,220,1)');
  along.addColorStop(1, 'rgba(200,208,220,0)');
  ctx.fillStyle = along;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'destination-in';
  const across = ctx.createLinearGradient(0, 0, w, 0);
  across.addColorStop(0, 'rgba(0,0,0,0)');
  across.addColorStop(soft ? 0.5 : 0.25, 'rgba(0,0,0,1)');
  across.addColorStop(soft ? 0.5 : 0.75, 'rgba(0,0,0,1)');
  across.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = across;
  ctx.fillRect(0, 0, w, h);
});

// Tile of tiny faint streaks, scrolled to suggest rain too far away to see as drops
const sheetSprite = () => makeSprite('sheet', 256, 256, (ctx, w, h) => {
  ctx.strokeStyle = 'rgba(225,232,242,1)';
  ctx.lineCap = 'round';
  for (let i = 0; i < 260; i += 1) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const length = 6 + Math.random() * 10;
    ctx.globalAlpha = 0.25 + Math.random() * 0.5;
    ctx.lineWidth = 0.6 + Math.random() * 0.5;
    // Drawn three times so streaks crossing the tile edge wrap seamlessly
    [-h, 0, h].forEach((offset) => {
      ctx.beginPath();
      ctx.moveTo(x, y + offset);
      ctx.lineTo(x, y + offset + length);
      ctx.stroke();
    });
  }
});

const disc = (key, inner) => makeSprite(key, 64, 64, (ctx, size) => {
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(inner, 'rgba(255,255,255,0.85)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
});

// A small crisp core with a soft falloff; a wide solid core reads as a cotton ball
const hardFlake = () => disc('flake-hard', 0.25);
const softFlake = () => disc('flake-soft', 0.05);

// Outline of each leaf shape, tip up, about 56px long in a 64px sprite
const leafPath = (ctx, shape) => {
  ctx.beginPath();
  if (shape === 'maple') {
    // Five pointed lobes from a polar curve, largest at the top and smallest by the stem, with a
    // fine serrated edge. Rounder lobes read as a flower, not a leaf.
    for (let i = 0; i <= 240; i += 1) {
      const theta = (i / 240) * Math.PI * 2;
      const fromTop = Math.abs(((theta + Math.PI) % (Math.PI * 2)) - Math.PI) / Math.PI;
      const lobes = Math.abs(Math.cos(2.5 * theta)) ** 2;
      const r = 26 * (0.5 + 0.5 * lobes) * (1 - 0.45 * fromTop) + 0.8 * Math.sin(theta * 30);
      const x = Math.sin(theta) * r;
      const y = -Math.cos(theta) * r + 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  } else if (shape === 'oval') {
    ctx.moveTo(0, -27);
    ctx.bezierCurveTo(17, -16, 16, 12, 0, 24);
    ctx.bezierCurveTo(-16, 12, -17, -16, 0, -27);
  } else {
    ctx.moveTo(0, -28);
    ctx.bezierCurveTo(10, -14, 9, 14, 0, 25);
    ctx.bezierCurveTo(-9, 14, -10, -14, 0, -28);
  }
  ctx.closePath();
};

// A shaded leaf: base colour lit from one side, darker rim, pale veins, a few brown blemishes,
// and a stem. The back face is paler and duller, so a tumbling leaf visibly turns over.
const leafSprite = (shape, color, back) => makeSprite(`leaf-${shape}-${color}-${back ? 'b' : 'f'}`, 64, 64, (ctx, size) => {
  ctx.translate(size / 2, size / 2);
  ctx.strokeStyle = 'rgba(70,40,15,0.9)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.lineTo(1, 31);
  ctx.stroke();

  leafPath(ctx, shape);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const light = ctx.createLinearGradient(-22, -24, 22, 24);
  light.addColorStop(0, 'rgba(255,235,190,0.22)');
  light.addColorStop(0.5, 'rgba(0,0,0,0)');
  light.addColorStop(1, 'rgba(30,10,0,0.32)');
  ctx.fillStyle = light;
  ctx.fillRect(-32, -32, 64, 64);
  for (let i = 0; i < 4; i += 1) {
    const x = (Math.random() - 0.5) * 24;
    const y = (Math.random() - 0.5) * 36;
    const r = 2 + Math.random() * 5;
    const spot = ctx.createRadialGradient(x, y, 0, x, y, r);
    spot.addColorStop(0, 'rgba(60,25,8,0.4)');
    spot.addColorStop(1, 'rgba(60,25,8,0)');
    ctx.fillStyle = spot;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  if (back) {
    ctx.fillStyle = 'rgba(225,205,165,0.3)';
    ctx.fillRect(-32, -32, 64, 64);
  }
  ctx.strokeStyle = `rgba(255,228,180,${back ? 0.45 : 0.28})`;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  if (shape === 'maple') {
    [0, 1.26, -1.26, 2.4, -2.4].forEach((angle) => {
      ctx.moveTo(0, 10);
      ctx.lineTo(Math.sin(angle) * 24, 10 - Math.cos(angle) * 24);
    });
  } else {
    ctx.moveTo(0, 22);
    ctx.lineTo(0, -24);
    for (let i = 0; i < 5; i += 1) {
      const y = 14 - i * 8;
      ctx.moveTo(0, y);
      ctx.lineTo(10, y - 7);
      ctx.moveTo(0, y);
      ctx.lineTo(-10, y - 7);
    }
  }
  ctx.stroke();
  ctx.restore();

  leafPath(ctx, shape);
  ctx.strokeStyle = 'rgba(55,22,6,0.45)';
  ctx.lineWidth = 1;
  ctx.stroke();
});

const hexToRgb = (hex) => {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
};

export function createCanvasRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let params = {
    kind: 'rain', density: 0.5, speed: 1, wind: 0, drift: 0, particleScale: 1, sheet: 0, opacity: 1, unit: 1,
    lights: null, lightFloor: 0.35, ground: null,
  };
  const supportsFilter = 'filter' in ctx;
  const layer = () => {
    const element = document.createElement('canvas');
    return { element, ctx: element.getContext('2d') };
  };
  const layers = { sheet: layer(), far: layer(), near: layer() };
  let particles = [];
  let lightMask = null;
  let lightTint = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let playing = false;
  let raf = 0;
  let last = 0;
  let clock = 0;

  const targetCount = () => {
    const area = (width * height) / (REFERENCE_AREA * params.unit * params.unit);
    return Math.min(MAX_PARTICLES, Math.round(BASE_COUNT[params.kind] * params.density * area));
  };

  const gust = () => 1 + 0.35 * Math.sin(clock * 0.35) + 0.15 * Math.sin(clock * 0.9 + 1);

  const groundLines = () => params.ground || {
    far: height * DEFAULT_GROUND.far,
    near: height * DEFAULT_GROUND.near,
  };

  // Where this particle lands: further away is higher up the picture. A little jitter per drop
  // keeps the landing line from showing as a hard edge.
  const groundFor = (p, lines = groundLines()) => (
    lines.far + (lines.near - lines.far) * p.z ** 0.8 + p.groundJitter * 0.035 * height
  );

  const spawn = (p, anywhere) => {
    const wind = params.wind * gust();
    const lean = height * (wind * 0.55 + params.drift);
    const spread = width + Math.abs(lean);
    p.x = (lean > 0 ? -lean : 0) + Math.random() * spread;
    p.y = anywhere
      ? Math.random() * Math.min(height, groundFor(p))
      : -60 * params.unit - Math.random() * height * 0.15;
    return p;
  };

  const create = () => {
    // Rain is weighted hard toward far drops so near ones stay rare, as they are in footage
    const z = Math.random() ** DEPTH_BIAS[params.kind];
    return spawn({
      z,
      jitter: 0.55 + Math.random() * 0.8,
      // Rain: each drop's own fall speed and slant, so the streaks are never ruled parallel lines
      speedJitter: 0.85 + Math.random() * 0.3,
      slant: (Math.random() - 0.5) * 0.09,
      lean: 0,
      groundJitter: Math.random() * 2 - 1,
      alpha: 0.6 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      freq: 0.6 + Math.random() * 1.2,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.8,
      flip: Math.random() * Math.PI * 2,
      // Most leaves rock gently; a few tumble end over end
      flipSpeed: Math.random() < 0.2 ? 4 + Math.random() * 3 : 0.5 + Math.random() * 1.5,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      shape: LEAF_SHAPES[Math.floor(Math.random() * LEAF_SHAPES.length)],
    }, true);
  };

  const syncCount = () => {
    const count = targetCount();
    while (particles.length < count) particles.push(create());
    if (particles.length > count) particles.length = count;
  };

  // Light falls off around each authored source; everything else keeps a dim floor, since
  // daylight and spill still catch some drops. Built once per resize at quarter resolution.
  const buildLightMaps = () => {
    lightMask = null;
    lightTint = null;
    const { lights, lightFloor } = params;
    if (!lights?.length || !width || !height) return;
    const scale = 0.25;
    const make = () => {
      const map = document.createElement('canvas');
      map.width = Math.max(1, Math.round(width * scale));
      map.height = Math.max(1, Math.round(height * scale));
      const mapCtx = map.getContext('2d');
      mapCtx.scale(scale, scale);
      return [map, mapCtx];
    };

    const [mask, maskCtx] = make();
    maskCtx.fillStyle = `rgba(0,0,0,${lightFloor})`;
    maskCtx.fillRect(0, 0, width, height);
    maskCtx.globalCompositeOperation = 'lighter';
    const [tint, tintCtx] = make();
    lights.forEach(({ x, y, radius, color }) => {
      const glow = maskCtx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, `rgba(0,0,0,${1 - lightFloor})`);
      glow.addColorStop(0.35, `rgba(0,0,0,${(1 - lightFloor) * 0.5})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      maskCtx.fillStyle = glow;
      maskCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

      const [r, g, b] = hexToRgb(color);
      const warm = tintCtx.createRadialGradient(x, y, 0, x, y, radius);
      warm.addColorStop(0, `rgba(${r},${g},${b},0.75)`);
      warm.addColorStop(1, `rgba(${r},${g},${b},0)`);
      tintCtx.fillStyle = warm;
      tintCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
    lightMask = mask;
    lightTint = tint;
  };

  const rainSpeed = (p) => 1300 * params.unit * (0.45 + 1.0 * p.z) * params.speed * (p.speedJitter ?? 1);
  // The streak spans the whole path the drop covers in the exposure, which is longer when it slants
  const rainLength = (p) => rainSpeed(p) * Math.hypot(1, p.lean) * SHUTTER * p.jitter * params.particleScale;

  const step = (dt) => {
    clock += dt;
    const { kind, unit, speed } = params;
    const wind = params.wind * gust();
    const margin = 60 * unit;
    const lines = groundLines();

    particles.forEach((p) => {
      if (kind === 'rain') {
        const vy = rainSpeed(p);
        // Wind isn't uniform: slow eddies drift across the frame, bending neighbouring drops by
        // different amounts, and each drop has a little slant of its own
        const eddy = 1 + 0.45 * Math.sin(clock * 0.6 + (p.x / unit) * 0.006 + p.phase * 0.25)
          + 0.2 * Math.sin(clock * 1.7 + (p.y / unit) * 0.01);
        p.lean = wind * 0.55 * eddy + p.slant + params.drift;
        p.x += vy * p.lean * dt;
        p.y += vy * dt;
      } else if (kind === 'motes') {
        // Dust hangs in the air: a slow wander in every direction with the faintest drift
        p.x += (wind * 25 * unit + Math.sin(clock * p.freq * 0.4 + p.phase) * (4 + 10 * p.z) * unit) * dt;
        p.y += (Math.cos(clock * p.freq * 0.3 + p.phase * 1.7) * (3 + 7 * p.z) * unit - 1.5 * unit) * speed * dt;
        if (p.y < -margin || p.y > height + margin) spawn(p, true);
        if (p.x > width + margin) p.x = -margin;
        else if (p.x < -margin) p.x = width + margin;
        return;
      } else if (kind === 'snow') {
        // A slow drift plus a faster small flutter, so flakes wander instead of swinging
        const sway = Math.sin(clock * p.freq + p.phase) * (6 + 16 * p.z) * unit
          + Math.sin(clock * p.freq * 3.1 + p.phase * 2) * 3 * unit;
        const fall = 42 * unit * (0.35 + 1.0 * p.z) * speed;
        p.x += (wind * 70 * unit * (0.4 + p.z) + sway + fall * params.drift * 3) * dt;
        p.y += fall * dt;
      } else {
        // A falling leaf swings like a pendulum: fastest through the middle of each swing, slowing
        // and tilting at the ends
        const swing = Math.sin(clock * p.freq + p.phase);
        p.swing = swing;
        p.x += (wind * 120 * unit * (0.4 + p.z) + swing * 45 * unit * (0.5 + p.z)) * dt;
        p.y += 55 * unit * (0.5 + 0.9 * p.z) * speed * (0.5 + 0.7 * (1 - swing * swing)) * dt;
        p.rot += p.spin * dt;
        p.flip += p.flipSpeed * dt;
      }

      // Rain is gone once its tail has reached the ground; flakes and leaves once they touch it
      const landed = p.y - (kind === 'rain' ? rainLength(p) : 0) > groundFor(p, lines);
      if (landed || p.y > height + margin) spawn(p, false);
      if (p.x > width + margin) p.x = -margin;
      else if (p.x < -margin) p.x = width + margin;
    });
  };

  const clearLayer = ({ element, ctx: layerCtx }) => {
    layerCtx.setTransform(1, 0, 0, 1, 0, 0);
    layerCtx.clearRect(0, 0, element.width, element.height);
  };

  // Composite an off-screen layer onto the main canvas, blurred by `blur` CSS px
  const composite = ({ element }, blur, alpha = 1) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = alpha;
    if (supportsFilter && blur > 0) ctx.filter = `blur(${(blur * dpr).toFixed(2)}px)`;
    ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
    if (supportsFilter) ctx.filter = 'none';
    ctx.globalAlpha = 1;
  };

  // The rain too far away to resolve: three scrolling layers at different scales and speeds so the
  // veil has parallax of its own, fading out at the far ground line where that rain lands
  const drawSheet = (angle, lines) => {
    const { sheet, density, unit, speed } = params;
    if (!sheet) return;
    const target = layers.sheet.ctx;
    const tile = sheetSprite();
    const pattern = target.createPattern(tile, 'repeat');
    clearLayer(layers.sheet);
    [[0.5, 360, 0.4], [0.75, 540, 0.45], [1.1, 780, 0.3]].forEach(([scale, velocity, weight]) => {
      const sc = scale * unit;
      const offset = ((clock * velocity * speed * unit) / sc) % tile.height;
      target.setTransform(LAYER_SCALE, 0, 0, LAYER_SCALE, 0, 0);
      target.translate(width / 2, height / 2);
      target.rotate(angle);
      target.scale(sc, sc);
      target.translate(0, offset);
      target.globalAlpha = Math.min(0.5, sheet * Math.min(1, density) * weight * params.opacity);
      target.fillStyle = pattern;
      const reach = (Math.hypot(width, height) / sc) / 2 + tile.height;
      target.fillRect(-reach, -reach - offset, reach * 2, reach * 2);
    });
    target.globalAlpha = 1;
    target.setTransform(LAYER_SCALE, 0, 0, LAYER_SCALE, 0, 0);
    target.globalCompositeOperation = 'destination-in';
    const fade = target.createLinearGradient(0, lines.far - 0.08 * height, 0, lines.far + 0.03 * height);
    fade.addColorStop(0, 'rgba(0,0,0,1)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    target.fillStyle = fade;
    target.fillRect(0, 0, width, height);
    target.globalCompositeOperation = 'source-over';
    composite(layers.sheet, 0.5 * unit);
  };

  // One streak, cut off where it meets the ground: only the part of the tail still above it shows
  const drawDrop = (target, scale, p, sprite, ground) => {
    const { unit, particleScale } = params;
    // Each streak lines up with its own direction of travel
    const angle = -Math.atan(p.lean);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const length = rainLength(p);
    const visible = Math.min(length, ground - (p.y - length));
    if (visible <= 0) return;
    // Width grows quickly up close, where drops are both bigger and out of focus
    const width = (0.8 + 3.2 * p.z * p.z) * particleScale * unit;
    // Near drops spread their light over a wider blur, so they are fainter, not brighter
    // Real rain is mostly faint: it only stands out where it catches light, so keep it low-contrast
    target.globalAlpha = Math.min(1, (0.4 + 0.4 * p.z) * (p.z > NEAR_DEPTH ? 0.55 : 1) * p.alpha * params.opacity
      // Drops catch the light unevenly as they fall, so they shimmer rather than glow steadily
      * (0.7 + 0.3 * Math.sin(clock * p.freq * 7 + p.phase)));
    target.setTransform(scale * cos, scale * sin, -scale * sin, scale * cos, scale * p.x, scale * p.y);
    const fraction = visible / length;
    target.drawImage(sprite, 0, 0, sprite.width, sprite.height * fraction, -width / 2, -length, width, visible);
  };

  // Every kind is drawn in three depth layers like a camera focused at middle distance: far
  // particles slightly soft, mid ones sharp at full resolution, near ones well out of focus
  const drawByDepth = (drawOne, blur) => {
    clearLayer(layers.far);
    clearLayer(layers.near);
    particles.forEach((p) => { if (p.z < FAR_DEPTH) drawOne(layers.far.ctx, LAYER_SCALE, p); });
    layers.far.ctx.globalAlpha = 1;
    composite(layers.far, blur.far, blur.farAlpha ?? 1);
    particles.forEach((p) => { if (p.z >= FAR_DEPTH && p.z <= NEAR_DEPTH) drawOne(ctx, dpr, p); });
    ctx.globalAlpha = 1;
    particles.forEach((p) => { if (p.z > NEAR_DEPTH) drawOne(layers.near.ctx, LAYER_SCALE, p); });
    layers.near.ctx.globalAlpha = 1;
    composite(layers.near, blur.near);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawRain = () => {
    const { unit } = params;
    const wind = params.wind * gust();
    const lines = groundLines();
    // The distant veil slants with the average wind; each drop slants its own way (see step)
    const angle = -Math.atan(wind * 0.55 + params.drift);

    drawSheet(angle, lines);

    const sharp = streakSprite(false);
    const soft = streakSprite(true);
    drawByDepth(
      (target, scale, p) => drawDrop(target, scale, p, p.z > NEAR_DEPTH ? soft : sharp, groundFor(p, lines)),
      { far: 0.7 * unit, near: 2.4 * unit, farAlpha: 0.9 },
    );
  };

  // Brightness and colour from the authored lights, applied to everything drawn so far
  const applyLights = () => {
    if (!lightMask) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.drawImage(lightTint, 0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(lightMask, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  };

  // Mostly tiny flakes; only the few close to the lens are large, and those are out of focus
  // rather than bright white balls
  const drawSnow = () => {
    const { unit, particleScale } = params;
    const hard = hardFlake();
    const soft = softFlake();
    drawByDepth((target, scale, p) => {
      const radius = (0.9 + 4.2 * p.z ** 2.2) * particleScale * unit;
      const near = p.z > NEAR_DEPTH;
      target.globalAlpha = (0.5 + 0.4 * p.z) * (near ? 0.7 : 1) * p.alpha;
      target.setTransform(scale, 0, 0, scale, 0, 0);
      target.drawImage(near ? soft : hard, p.x - radius, p.y - radius, radius * 2, radius * 2);
    }, { far: 0.5 * unit, near: 1.8 * unit, farAlpha: 0.85 });
  };

  // Tiny soft specks that twinkle as they turn in the light; the light map (from the scene's sun)
  // keeps them to the sunlit side and tints them warm
  const drawMotes = () => {
    const { unit, particleScale } = params;
    const soft = softFlake();
    drawByDepth((target, scale, p) => {
      const radius = (0.6 + 2.6 * p.z ** 2) * particleScale * unit;
      target.globalAlpha = (0.35 + 0.45 * p.z) * p.alpha * (0.45 + 0.55 * Math.sin(clock * p.freq * 1.5 + p.phase) ** 2);
      target.setTransform(scale, 0, 0, scale, 0, 0);
      target.drawImage(soft, p.x - radius, p.y - radius, radius * 2, radius * 2);
    }, { far: 0.4 * unit, near: 2.2 * unit, farAlpha: 0.9 });
  };

  const drawLeaves = () => {
    const { unit, particleScale } = params;
    drawByDepth((target, scale, p) => {
      const size = (9 + 20 * p.z ** 1.3) * particleScale * unit;
      // Squashing one axis fakes the leaf turning in 3D; past edge-on we see its back
      const turn = Math.cos(p.flip);
      target.globalAlpha = 0.8 + 0.2 * p.z;
      target.setTransform(scale, 0, 0, scale, 0, 0);
      target.translate(p.x, p.y);
      // Tilts into each swing, like a real leaf rocking on the air
      target.rotate(p.rot + 0.6 * (p.swing || 0));
      target.scale(1, Math.max(0.12, Math.abs(turn)));
      target.drawImage(leafSprite(p.shape, p.color, turn < 0), -size / 2, -size / 2, size, size);
    // Far leaves stay sharp: blurring something that small turns it into a speck
    }, { far: 0, near: 1.4 * unit, farAlpha: 0.9 });
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (params.kind === 'rain') drawRain();
    else if (params.kind === 'snow') drawSnow();
    else if (params.kind === 'motes') drawMotes();
    else drawLeaves();
    if (params.kind !== 'leaves') applyLights();
  };

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    // A long gap means the tab was hidden; don't let particles teleport
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    draw();
  };

  const start = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  return {
    setParams(next) {
      const kindChanged = next.kind !== params.kind;
      params = { ...params, ...next };
      if (kindChanged) particles = [];
      syncCount();
      buildLightMaps();
      if (!playing) draw();
    },
    resize(cssWidth, cssHeight, ratio) {
      width = cssWidth;
      height = cssHeight;
      dpr = ratio;
      canvas.width = Math.max(1, Math.round(cssWidth * ratio));
      canvas.height = Math.max(1, Math.round(cssHeight * ratio));
      Object.values(layers).forEach(({ element }) => {
        element.width = Math.max(1, Math.round(cssWidth * LAYER_SCALE));
        element.height = Math.max(1, Math.round(cssHeight * LAYER_SCALE));
      });
      syncCount();
      buildLightMaps();
      draw();
    },
    setPlaying(value) {
      playing = value;
      if (value) start();
      else stop();
    },
    destroy() {
      stop();
      particles = [];
    },
  };
}
