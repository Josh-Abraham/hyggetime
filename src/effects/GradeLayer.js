import React from 'react';
import PropTypes from 'prop-types';
import { gradeFilter } from './resolveEffect';
import { maskStyle, regionBox } from './useVideoRect';
import './effects.scss';

const hexToRgba = (hex, alpha) => {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return `rgba(${channels.join(',')},${alpha})`;
};

// Tint plus a darker "sky" that fades out toward the bottom, which is what makes a scene read as
// overcast rather than just washed out. It is multiplied, not laid on top: a normal overlay lifts
// the blacks into a grey film, which is most obvious at night.
const washFor = (grade) => `linear-gradient(180deg, rgba(20,28,40,${grade.skyDarken || 0}) 0%, rgba(20,28,40,0) 65%), ${hexToRgba(grade.tint || '#000000', grade.tintOpacity || 0)}`;

// Warm light from the sun's side. Soft-light lifts and warms what is already bright and barely
// touches the shadows, which is the difference between low sunlight and a flat orange tint; the
// screen-blended bloom is the haze right around the sun. Positions are in frame coordinates
// (sun.radius is a fraction of the frame height).
const SunGlow = ({ grade, sun, rect, visible }) => {
  const { frame } = rect;
  const { color, strength } = grade.glow;
  const x = frame.x + sun.at[0] * frame.w;
  const y = frame.y + sun.at[1] * frame.h;
  const reach = (sun.radius ?? 0.35) * frame.h;
  const style = { opacity: visible ? 1 : 0 };
  return (
    <>
      <div
        className="grade-frame grade-slow"
        style={{
          ...style,
          mixBlendMode: 'soft-light',
          background: `radial-gradient(circle ${reach * 4}px at ${x}px ${y}px, ${hexToRgba(color, strength)} 0%, ${hexToRgba(color, strength * 0.55)} 45%, ${hexToRgba(color, strength * 0.25)} 100%)`,
        }}
      />
      <div
        className="grade-frame grade-slow"
        style={{
          ...style,
          mixBlendMode: 'screen',
          background: `radial-gradient(circle ${reach}px at ${x}px ${y}px, ${hexToRgba(color, strength * 0.45)} 0%, ${hexToRgba(color, strength * 0.12)} 50%, ${hexToRgba(color, 0)} 100%)`,
        }}
      />
    </>
  );
};

SunGlow.propTypes = {
  grade: PropTypes.object.isRequired,
  sun: PropTypes.object.isRequired,
  rect: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
};

// The part of the grade that is an overlay. The CSS filter for whole-frame grading is applied to
// the player itself by the app; region grading uses backdrop-filter on a clipped element, which is
// the only way to filter part of a cross-origin iframe.
const GradeLayer = ({ effect, rect, visible }) => {
  if (!effect?.grade || !rect) return null;
  const { grade, gradeScope, presetId } = effect;

  if (gradeScope !== 'regions') {
    return (
      <React.Fragment key={presetId}>
        <div
          className="grade-frame"
          style={{ background: washFor(grade), mixBlendMode: 'multiply', opacity: visible ? 1 : 0 }}
        />
        {grade.glow && effect.sun && <SunGlow grade={grade} sun={effect.sun} rect={rect} visible={visible} />}
      </React.Fragment>
    );
  }

  // A room lit from inside stays ungraded, but a storm outside can still dim it a little overall
  const room = grade.room ? (
    <div
      key={`${presetId}:room`}
      className="grade-frame grade-slow"
      style={{ background: grade.roomColor || 'rgb(14,18,28)', mixBlendMode: 'multiply', opacity: visible ? grade.room : 0 }}
    />
  ) : null;

  // Beads on still glass sit on the same panes as the rain, so they mustn't grade them twice
  const panes = effect.regions.filter((region) => region.kind !== 'glass');
  const areas = effect.gradeAreas
    ? effect.gradeAreas.map((mask, i) => ({ id: `area${i}`, mask, feather: 1.5 }))
    : panes;
  // The wet-glass blur stays on the panes themselves: blurring the whole-window areas would
  // soften the glazing bars and frame too, which is what keeps the window looking real
  const { blur, ...unblurred } = grade;
  const wet = blur && effect.gradeAreas ? panes.map((region) => {
    const box = regionBox(region.mask, rect, region.feather);
    if (!box) return null;
    const filter = `blur(${blur}px)`;
    return (
      <div
        key={`${presetId}:wet:${region.id}`}
        className="grade-region"
        style={{
          left: box.x, top: box.y, width: box.w, height: box.h, ...maskStyle(box), opacity: visible ? 1 : 0,
          backdropFilter: filter, WebkitBackdropFilter: filter,
        }}
      />
    );
  }) : [];
  return [room, ...areas.map((region) => {
    const box = regionBox(region.mask, rect, region.feather);
    if (!box) return null;
    const filter = gradeFilter(effect.gradeAreas ? unblurred : grade);
    const placement = {
      left: box.x,
      top: box.y,
      width: box.w,
      height: box.h,
      ...maskStyle(box),
      opacity: visible ? 1 : 0,
    };
    // Filter and wash are separate elements: blending the filtered element itself would blend the
    // filtered picture with the original
    return (
      <React.Fragment key={`${presetId}:${region.id}`}>
        <div className="grade-region" style={{ ...placement, backdropFilter: filter, WebkitBackdropFilter: filter }} />
        <div className="grade-region" style={{ ...placement, background: washFor(grade), mixBlendMode: 'multiply' }} />
      </React.Fragment>
    );
  }), ...wet];
};

GradeLayer.propTypes = {
  effect: PropTypes.object,
  rect: PropTypes.object,
  visible: PropTypes.bool.isRequired,
};

export default GradeLayer;
