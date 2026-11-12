import { useLayoutEffect, useState } from 'react';

// Matches --crop in App.scss: the player is made taller than the screen and shifted up to hide
// YouTube's title strip, and YouTube letterboxes the video inside it.
const cropFor = (viewportHeight) => Math.min(140, Math.max(72, viewportHeight * 0.12));

// Where the video frame actually lands inside the container, in pixels. Masks are authored in
// 0-1 coordinates of the video frame, so every layer maps through this rect.
//   frame:   the whole video frame (may extend past the container when the screen is very wide)
//   visible: the part of the frame that is on screen
export default function useVideoRect(containerRef, aspect = 16 / 9) {
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const update = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      const playerHeight = height + 2 * cropFor(window.innerHeight);
      const frameWidth = Math.min(width, playerHeight * aspect);
      const frameHeight = frameWidth / aspect;
      const frame = {
        x: (width - frameWidth) / 2,
        y: (height - frameHeight) / 2,
        w: frameWidth,
        h: frameHeight,
      };
      const top = Math.max(0, frame.y);
      const bottom = Math.min(height, frame.y + frame.h);
      const next = {
        frame,
        visible: { x: frame.x, y: top, w: frame.w, h: Math.max(0, bottom - top) },
      };
      setRect((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [containerRef, aspect]);

  return rect;
}

// Soft-edged polygon as a CSS mask image. clip-path can only cut hard edges, which reads as a
// sticker on the picture; a blurred SVG polygon lets the effect fade into the window frame.
// It also masks backdrop-filter, so the region grade gets the same soft edge.
const featheredMask = (points, w, h, feather) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w.toFixed(1)}' height='${h.toFixed(1)}' viewBox='0 0 ${w.toFixed(1)} ${h.toFixed(1)}' preserveAspectRatio='none'>`
    + `<filter id='f' x='-50%' y='-50%' width='200%' height='200%'><feGaussianBlur stdDeviation='${(feather / 2).toFixed(2)}'/></filter>`
    + `<polygon fill='white' filter='url(#f)' points='${points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ')}'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

// Pixel box for a region, given the video rect, plus:
//   mask   CSS mask-image for the polygon (null for full-frame regions)
//   toLocal([x, y]) maps 0-1 video-frame coordinates to pixels inside the box, so renderers can
//          place scene features (lights, water) without knowing where the box is
// A masked region covers its polygon's bounding box (padded by the feather so the soft edge isn't
// cut off), so particles are only simulated where they can be seen.
export const regionBox = (mask, rect, feather = 8) => {
  if (!rect) return null;
  const { frame } = rect;
  const local = (x, y) => ([fx, fy]) => [frame.x + fx * frame.w - x, frame.y + fy * frame.h - y];
  if (!mask) return { ...rect.visible, mask: null, toLocal: local(rect.visible.x, rect.visible.y) };

  const pad = feather * (frame.h / 720);
  const points = mask.map(([px, py]) => [frame.x + px * frame.w, frame.y + py * frame.h]);
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  const w = Math.max(...xs) + pad - x;
  const h = Math.max(...ys) + pad - y;
  if (w < 2 + 2 * pad || h < 2 + 2 * pad) return null;

  const relative = points.map(([px, py]) => [px - x, py - y]);
  return { x, y, w, h, mask: featheredMask(relative, w, h, pad), toLocal: local(x, y) };
};

// Style for an element masked to a region
export const maskStyle = (box) => (box.mask ? {
  maskImage: box.mask,
  WebkitMaskImage: box.mask,
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
} : {});
