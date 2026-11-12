import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { blendFor, createRenderer } from './renderers/registry';
import { maskStyle, regionBox } from './useVideoRect';
import usePrefersReducedMotion from './usePrefersReducedMotion';
import './effects.scss';

// One canvas per region. Masking is done by a CSS mask on the canvas itself, so renderers never
// need to know about masks. Scene features (lights, water) are handed over in canvas pixels.
const RegionCanvas = ({ region, box, unit, visible, playing }) => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  // Remounted (keyed) when the preset changes, so the kind never changes for a given renderer
  useEffect(() => {
    const renderer = createRenderer(canvasRef.current, region.kind);
    rendererRef.current = renderer;
    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rendererRef.current?.resize(box.w, box.h, Math.min(window.devicePixelRatio || 1, 2));
  }, [box.w, box.h]);

  const { toLocal } = box;
  useEffect(() => {
    rendererRef.current?.setParams({
      kind: region.kind,
      density: region.density,
      speed: region.speed,
      wind: region.wind,
      drift: region.drift,
      particleScale: region.particleScale,
      sheet: region.sheet,
      opacity: region.opacity,
      frost: region.frost,
      unit,
      lights: region.lights?.map((light) => {
        const [x, y] = toLocal(light.at);
        return { x, y, radius: (light.radius ?? 0.12) * unit * 720, color: light.color || '#ffc27a' };
      }) || null,
      lightFloor: region.lightFloor,
      ground: region.ground ? {
        far: toLocal([0, region.ground.far])[1],
        near: toLocal([0, region.ground.near ?? 1.05])[1],
      } : null,
    });
  }, [region, unit, toLocal]);

  useEffect(() => {
    rendererRef.current?.setPlaying(playing);
  }, [playing]);

  return (
    <canvas
      ref={canvasRef}
      className="effect-canvas"
      style={{
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        ...maskStyle(box),
        mixBlendMode: blendFor(region.kind),
        filter: region.blur ? `blur(${region.blur}px)` : undefined,
        opacity: visible ? 1 : 0,
      }}
    />
  );
};

RegionCanvas.propTypes = {
  region: PropTypes.object.isRequired,
  box: PropTypes.object.isRequired,
  unit: PropTypes.number.isRequired,
  visible: PropTypes.bool.isRequired,
  playing: PropTypes.bool.isRequired,
};

// Weather particles drawn over the video, one canvas per region of the scene's config
const EffectLayer = ({ effect, rect, visible, playing }) => {
  const reducedMotion = usePrefersReducedMotion();

  const boxes = useMemo(() => {
    if (!effect || !rect) return [];
    return effect.regions
      .map((region) => ({ region, box: regionBox(region.mask, rect, region.feather) }))
      .filter((entry) => entry.box);
  }, [effect, rect]);

  // Frozen streaks look wrong, so rain simply isn't drawn for people who asked for less motion
  // Lightning-only presets have no particles at all
  if (!effect?.kind || !rect || (reducedMotion && (effect.kind === 'rain' || effect.kind === 'glass'))) return null;

  const unit = rect.frame.h / 720;
  return (
    <>
      {boxes.map(({ region, box }) => (
        <RegionCanvas
          key={`${effect.presetId}:${region.id}`}
          region={region}
          box={box}
          unit={unit}
          visible={visible}
          playing={playing && !reducedMotion}
        />
      ))}
    </>
  );
};

EffectLayer.propTypes = {
  effect: PropTypes.object,
  rect: PropTypes.object,
  visible: PropTypes.bool.isRequired,
  playing: PropTypes.bool.isRequired,
};

export default EffectLayer;
