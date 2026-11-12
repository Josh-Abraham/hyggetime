// Rain on the outside of a moving train's window. From a moving carriage you barely see rain
// falling; you see water on the glass:
//   - Beads. Drops land all over the pane as small beads, each a tiny lens: a bright glint on top,
//     a dark rim underneath.
//   - Runners. The air streaming past pushes beads along the glass, mostly sideways, in jerks: a
//     bead holds, lurches, holds again, changing course a little each time. Bigger beads move
//     more and pause less.
//   - Trails. A runner leaves a wake of tiny beads that soon dry off, and swallows the beads it
//     runs into, growing as it goes.
//   - Frost (optional, params.frost { start, full } in seconds). Ice creeps in from the edges of
//     the pane along a ragged front, as feathery crystals over a pale haze, and covers the beads.
// Same interface as canvasParticles.js; drift (the scene's travel lean) sets which way and how
// hard the air pushes. With no drift the glass is still (a window at home) and gravity takes over:
// beads sit longer, grow as new drops land on them, and only the heavy ones slide, downward. The canvas is masked to the window, so beads only ever sit on the glass.

const REFERENCE_AREA = 1280 * 720;
// Landed beads per second at density 1 over a 1280x720 area
const LAND_RATE = 1200;
const MAX = { beads: 1400, wake: 1400, runners: 90 };

const sprite = (() => {
  let canvas = null;
  return () => {
    if (canvas) return canvas;
    const size = 64;
    const r = size / 2;
    canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // Body: a faint lift, lighter toward the bottom where the lens gathers the sky's light
    const body = ctx.createRadialGradient(r, r * 1.25, 0, r, r, r);
    body.addColorStop(0, 'rgba(255,255,255,0.22)');
    body.addColorStop(0.7, 'rgba(255,255,255,0.07)');
    body.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(r, r, r * 0.92, 0, Math.PI * 2);
    ctx.fill();
    // Dark rim, heaviest along the top edge, where a lens shows the darker ground below
    ctx.lineWidth = r * 0.16;
    ctx.strokeStyle = 'rgba(10,14,18,0.22)';
    ctx.beginPath();
    ctx.arc(r, r, r * 0.8, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.lineWidth = r * 0.08;
    ctx.strokeStyle = 'rgba(10,14,18,0.1)';
    ctx.beginPath();
    ctx.arc(r, r, r * 0.84, 0, Math.PI * 2);
    ctx.stroke();
    // Glint
    const glint = ctx.createRadialGradient(r * 0.68, r * 0.62, 0, r * 0.68, r * 0.62, r * 0.22);
    glint.addColorStop(0, 'rgba(255,255,255,0.6)');
    glint.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glint;
    ctx.fillRect(0, 0, size, size);
    return canvas;
  };
})();

// Feathery frost crystals over a pale haze, drawn once per size. Crystals start near the edges,
// where frost forms first, and branch inward
const frostTexture = (width, height, unit) => {
  const tex = document.createElement('canvas');
  tex.width = Math.max(1, Math.round(width));
  tex.height = Math.max(1, Math.round(height));
  const ctx = tex.getContext('2d');
  ctx.fillStyle = 'rgba(214,228,242,0.24)';
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = 'round';
  const branch = (x, y, angle, length, depth) => {
    const ex = x + Math.cos(angle) * length;
    const ey = y + Math.sin(angle) * length;
    ctx.globalAlpha = 0.12 + 0.08 * depth;
    ctx.lineWidth = (0.3 + 0.2 * depth) * unit;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    if (depth <= 0) return;
    // Side shoots all along the stem, like a fern
    for (let t = 0.25; t < 1; t += 0.25) {
      const bx = x + (ex - x) * t;
      const by = y + (ey - y) * t;
      [-1, 1].forEach((side) => branch(bx, by, angle + side * (0.7 + Math.random() * 0.3), length * 0.38, depth - 1));
    }
  };
  ctx.strokeStyle = 'rgb(240,247,255)';
  const crystals = Math.round((width * height) / (unit * unit * 160));
  for (let i = 0; i < crystals; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const edge = Math.min(x, width - x, y, height - y) / (Math.min(width, height) / 2);
    if (Math.random() > (1 - edge) ** 1.5 + 0.08) continue;
    // Grow away from the nearest edge
    const toward = [[x, 0], [width - x, Math.PI], [y, Math.PI / 2], [height - y, -Math.PI / 2]]
      .sort((a, b) => a[0] - b[0])[0][1];
    branch(x, y, toward + (Math.random() - 0.5) * 1.6, (3 + Math.random() * 8) * unit, Math.random() < 0.3 ? 2 : 1);
  }
  // Fine sparkle
  ctx.fillStyle = 'rgb(255,255,255)';
  for (let i = 0; i < crystals * 2; i += 1) {
    ctx.globalAlpha = 0.1 + Math.random() * 0.25;
    ctx.fillRect(Math.random() * width, Math.random() * height, 0.8 * unit, 0.8 * unit);
  }
  ctx.globalAlpha = 1;
  return tex;
};

export function createGlassRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let params = { density: 0.5, speed: 1, drift: 1, opacity: 1, unit: 1 };
  let beads = [];
  let wake = [];
  let runners = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let playing = false;
  let raf = 0;
  let last = 0;
  let owed = 0;
  // Frost: elapsed time, the crystal texture, and a coarse map of when each spot freezes
  let frostClock = 0;
  let frost = null;

  const area = () => (width * height) / (REFERENCE_AREA * params.unit * params.unit);
  // Mostly tiny beads, a few big ones. On still glass they're bigger: they've had time to gather
  const beadRadius = () => (still()
    ? 1.15 + 2 * Math.random() ** 2.5
    : 0.7 + 2.3 * Math.random() ** 3) * params.unit * (params.particleScale ?? 1);

  const still = () => !params.drift;

  const land = (anywhere) => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = beadRadius();
    // On still glass a drop landing on a bead joins it, so beads grow until they're heavy enough
    // to slide. Cheap enough: one scan per landing
    if (still() && !anywhere) {
      const hit = beads.find((bead) => Math.abs(bead.x - x) < bead.r + r && Math.abs(bead.y - y) < bead.r + r);
      if (hit) {
        hit.r = Math.min(4.6 * params.unit * (params.particleScale ?? 1), Math.hypot(hit.r, r));
        return;
      }
    }
    if (beads.length >= MAX.beads) beads.splice(0, 1);
    const life = still() ? 10 + Math.random() * 20 : 3 + Math.random() * 6;
    beads.push({ x, y, r, age: anywhere ? Math.random() * life * 0.8 : 0, life });
  };

  // Which way a runner goes: with the air along the travel, a little downhill; on still glass,
  // down, wandering a little
  const heading = () => {
    if (still()) return Math.PI / 2 + (Math.random() - 0.5) * 0.35;
    const sign = Math.sign(params.drift);
    return Math.atan2(0.32, sign) + (Math.random() - 0.5) * 0.5;
  };

  const loosen = (bead) => {
    if (runners.length >= MAX.runners) return false;
    runners.push({
      x: bead.x, y: bead.y, r: bead.r, angle: heading(), moving: true, timer: 0.05 + Math.random() * 0.2, gap: 0,
    });
    return true;
  };

  const FROST_CELL = 4;
  const buildFrost = () => {
    frost = null;
    if (!params.frost || !width || !height) return;
    const { unit } = params;
    const cols = Math.ceil(width / FROST_CELL);
    const rows = Math.ceil(height / FROST_CELL);
    // When each cell freezes (0 = first): distance from the nearest edge, roughened by a few
    // overlapping waves so the front advances in tongues rather than as a neat inset rectangle
    const waves = Array.from({ length: 4 }, () => ({
      fx: (0.01 + Math.random() * 0.04) / unit, fy: (0.01 + Math.random() * 0.04) / unit, phase: Math.random() * 6.3,
    }));
    const arrival = new Float32Array(cols * rows);
    const half = Math.min(width, height) / 2;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = (c + 0.5) * FROST_CELL;
        const y = (r + 0.5) * FROST_CELL;
        const edge = Math.min(x, width - x, y, height - y) / half;
        const rough = waves.reduce((sum, w) => sum + Math.sin(x * w.fx + w.phase) * Math.sin(y * w.fy - w.phase), 0) / 4;
        arrival[r * cols + c] = edge + rough * 0.22;
      }
    }
    const mask = document.createElement('canvas');
    mask.width = cols;
    mask.height = rows;
    const layer = document.createElement('canvas');
    layer.width = canvas.width;
    layer.height = canvas.height;
    frost = {
      cols, rows, arrival, mask, maskCtx: mask.getContext('2d'), image: mask.getContext('2d').createImageData(cols, rows),
      layer, layerCtx: layer.getContext('2d'), texture: frostTexture(width, height, unit), shown: -1,
    };
  };

  // How far the front has come, 0-1 across the pane; it slows as it nears the middle
  const frostReach = () => {
    const { start = 4, full = 50 } = params.frost || {};
    const t = Math.min(1, Math.max(0, (frostClock - start) / (full - start)));
    return 0.85 * t ** 0.8;
  };

  const drawFrost = () => {
    if (!frost) return;
    const reach = frostReach();
    if (reach <= 0) return;
    // The coarse mask only needs redrawing when the front has visibly moved
    if (Math.abs(reach - frost.shown) > 0.004) {
      frost.shown = reach;
      const { data } = frost.image;
      for (let i = 0; i < frost.arrival.length; i += 1) {
        data[i * 4 + 3] = Math.max(0, Math.min(255, ((reach - frost.arrival[i]) / 0.3) ** 1.4 * 255));
      }
      frost.maskCtx.putImageData(frost.image, 0, 0);
    }
    const { layerCtx, layer } = frost;
    layerCtx.setTransform(1, 0, 0, 1, 0, 0);
    layerCtx.globalCompositeOperation = 'source-over';
    layerCtx.clearRect(0, 0, layer.width, layer.height);
    layerCtx.drawImage(frost.texture, 0, 0, layer.width, layer.height);
    layerCtx.globalCompositeOperation = 'destination-in';
    layerCtx.imageSmoothingEnabled = true;
    layerCtx.drawImage(frost.mask, 0, 0, layer.width, layer.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(layer, 0, 0);
  };

  const reset = () => {
    beads = [];
    wake = [];
    runners = [];
    const count = Math.min(MAX.beads, Math.round(LAND_RATE * params.density * area() * 1.6));
    for (let i = 0; i < count; i += 1) land(true);
  };

  const step = (dt) => {
    frostClock += dt;
    const { unit, density, speed, drift } = params;
    const push = Math.min(2, Math.abs(drift)) || 1;

    owed += LAND_RATE * density * area() * dt;
    while (owed >= 1) { land(false); owed -= 1; }

    // Beads age; bigger ones are more likely to be torn loose by the air
    beads = beads.filter((bead) => {
      bead.age += dt;
      if (bead.age > bead.life) return false;
      // Still glass: only heavy beads give way to gravity
      const chance = still()
        ? 0.6 * Math.max(0, bead.r / (unit * (params.particleScale ?? 1)) - 2.9) * dt
        : (0.05 + 0.5 * Math.max(0, bead.r / unit - 1.5)) * push * dt;
      return !(Math.random() < chance && loosen(bead));
    });
    wake = wake.filter((drop) => { drop.age += dt; return drop.age < drop.life; });

    runners = runners.filter((runner) => {
      runner.timer -= dt;
      const size = runner.r / unit;
      if (runner.timer <= 0) {
        runner.moving = !runner.moving;
        if (runner.moving) {
          runner.timer = 0.08 + Math.random() * 0.25 + size * 0.05;
          runner.angle = runner.angle * 0.5 + heading() * 0.5;
        } else {
          // Big runners barely stop
          runner.timer = (0.04 + Math.random() * 0.3) / (1 + size * 0.6);
        }
      }
      if (runner.moving) {
        const velocity = still()
          ? (20 + 12 * size) * unit
          : (80 + 60 * size) * unit * push * (0.6 + 0.4 * speed);
        const dx = Math.cos(runner.angle) * velocity * dt;
        const dy = Math.sin(runner.angle) * velocity * dt;
        runner.x += dx;
        runner.y += dy;
        runner.gap += Math.hypot(dx, dy);
        // A wake of tiny beads, paid for out of the runner's own water
        while (runner.gap > 2.5 * unit) {
          runner.gap -= 2.5 * unit;
          if (Math.random() < 0.6 && wake.length < MAX.wake) {
            wake.push({
              x: runner.x + (Math.random() - 0.5) * runner.r * 0.6,
              y: runner.y + (Math.random() - 0.5) * runner.r * 0.6,
              r: runner.r * (0.22 + Math.random() * 0.2),
              age: 0,
              life: 0.8 + Math.random() * 2.2,
            });
          }
          runner.r *= 0.992;
        }
        // Swallow beads in its path
        beads = beads.filter((bead) => {
          const reach = runner.r + bead.r;
          if (Math.abs(bead.x - runner.x) > reach || Math.abs(bead.y - runner.y) > reach) return true;
          if (Math.hypot(bead.x - runner.x, bead.y - runner.y) > reach) return true;
          runner.r = Math.min((still() ? 4.6 * (params.particleScale ?? 1) : 4) * unit, Math.hypot(runner.r, bead.r));
          return false;
        });
      }
      const margin = 10 * unit;
      return runner.r > 0.6 * unit && runner.x > -margin && runner.x < width + margin
        && runner.y > -margin && runner.y < height + margin;
    });
  };

  const drawBead = (image, x, y, r, alpha, angle = 0, stretch = 1) => {
    ctx.globalAlpha = alpha;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(x, y);
    if (angle) ctx.rotate(angle);
    ctx.drawImage(image, -r * stretch, -r, r * 2 * stretch, r * 2);
  };

  const draw = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const image = sprite();
    const { opacity } = params;
    const strength = still() ? 1.6 : 1;
    // Wake drops dry off; beads fade in as they land and out as they're blown away
    // Alpha above 1 is drawn as a second pass
    const bead = (x, y, r, alpha, angle, stretch) => {
      drawBead(image, x, y, r, Math.min(1, alpha), angle, stretch);
      if (alpha > 1) drawBead(image, x, y, r, alpha - 1, angle, stretch);
    };
    wake.forEach((drop) => bead(drop.x, drop.y, drop.r, 0.7 * strength * opacity * (1 - drop.age / drop.life)));
    beads.forEach((b) => {
      const fade = Math.min(1, b.age / 0.15, (b.life - b.age) / 0.6);
      bead(b.x, b.y, b.r, 0.85 * strength * opacity * fade);
    });
    // Moving runners smear out along their path; on still glass, downward
    runners.forEach((runner) => bead(runner.x, runner.y, runner.r, strength * opacity, runner.angle, runner.moving ? 1.5 : 1.1));
    ctx.globalAlpha = 1;
    drawFrost();
  };

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
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
      const refill = next.density !== params.density || next.unit !== params.unit;
      const refreeze = Boolean(next.frost) !== Boolean(params.frost) || next.unit !== params.unit;
      params = { ...params, ...next };
      if (refill) reset();
      if (refreeze) buildFrost();
      if (!playing) draw();
    },
    resize(cssWidth, cssHeight, ratio) {
      width = cssWidth;
      height = cssHeight;
      dpr = ratio;
      canvas.width = Math.max(1, Math.round(cssWidth * ratio));
      canvas.height = Math.max(1, Math.round(cssHeight * ratio));
      reset();
      buildFrost();
      draw();
    },
    setPlaying(value) {
      playing = value;
      if (value) start();
      else stop();
    },
    destroy() {
      stop();
      beads = [];
      wake = [];
      runners = [];
    },
  };
}
