import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { maskStyle, regionBox } from './useVideoRect';
import usePrefersReducedMotion from './usePrefersReducedMotion';
import './effects.scss';

// Lightning as light, not bolts: now and then the picture flares in one of a few flicker patterns.
// The flash brightens what is behind it (backdrop-filter, so video detail and the rain stay
// visible, and the rain catches the light) plus a faint cool glow from the side the strike is on.
// A white overlay instead just washes the picture into grey fog.
// No pattern flashes more than three times in a second (the photosensitive seizure guideline),
// and nobody who asked for reduced motion gets flashes at all.
// Each pattern is opacity keyframes over its duration, scaled by the preset's strength.
const PATTERNS = [
  { duration: 700, frames: [[0, 0], [0.07, 1], [0.3, 0.12], [1, 0]] },
  { duration: 1100, frames: [[0, 0], [0.05, 0.85], [0.17, 0.08], [0.34, 1], [0.55, 0.15], [1, 0]] },
  { duration: 1500, frames: [[0, 0], [0.04, 0.5], [0.14, 0.05], [0.3, 0.8], [0.42, 0.08], [0.6, 1], [0.78, 0.2], [1, 0]] },
];

// What a full-strength flash does to the picture behind it; the flash's opacity scales it
const FLASH_FILTER = 'brightness(2.6) contrast(1.08) saturate(0.7)';

// Light that spills from a lit window into the room, as a share of the window's flash
const SPILL = 0.18;

const between = (min, max) => min + Math.random() * (max - min);

const LightningLayer = ({ effect, rect, playing, visible }) => {
  const reducedMotion = usePrefersReducedMotion();
  const flashes = useRef([]);
  const lightning = effect?.lightning;
  const active = !!lightning && playing && visible && !reducedMotion;

  useEffect(() => {
    if (!active) return undefined;
    let timer;
    const flash = () => {
      const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
      // The strike is somewhere off to one side, so the glow comes from a different place each time
      const origin = `${Math.round(between(10, 90))}% 0%`;
      flashes.current.forEach((element) => {
        if (!element) return;
        const peak = lightning.strength * Number(element.dataset.share);
        element.style.background = `radial-gradient(ellipse 120% 90% at ${origin}, rgba(225,232,255,0.22) 0%, rgba(200,212,240,0.08) 55%, rgba(200,212,240,0) 100%)`;
        element.animate(
          pattern.frames.map(([offset, value]) => ({ offset, opacity: value * peak })),
          { duration: pattern.duration, easing: 'linear' },
        );
      });
      timer = setTimeout(flash, between(lightning.minGap, lightning.maxGap) * 1000);
    };
    // The first strike comes fairly soon, so it's clear the option is doing something
    timer = setTimeout(flash, between(6, 14) * 1000);
    return () => clearTimeout(timer);
  }, [active, lightning]);

  if (!lightning || !rect || reducedMotion) return null;

  // Flash inside the openings when the scene has any, so the room only catches the spill
  const masked = effect.regions.some((region) => region.mask);
  const layers = masked
    ? [
      ...effect.regions.filter((region) => region.mask).map((region) => ({ key: region.id, box: regionBox(region.mask, rect, region.feather), share: 1 })),
      { key: 'spill', box: { ...rect.visible, mask: null }, share: SPILL },
    ]
    : [{ key: 'frame', box: { ...rect.visible, mask: null }, share: 1 }];

  return layers.filter((layer) => layer.box).map(({ key, box, share }, index) => (
    <div
      key={`${effect.presetId}:${key}`}
      ref={(element) => { flashes.current[index] = element; }}
      className="lightning-flash"
      data-share={share}
      style={{
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        ...maskStyle(box),
        backdropFilter: FLASH_FILTER,
        WebkitBackdropFilter: FLASH_FILTER,
      }}
    />
  ));
};

LightningLayer.propTypes = {
  effect: PropTypes.object,
  rect: PropTypes.object,
  playing: PropTypes.bool.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default LightningLayer;
