import React from 'react';
import PropTypes from 'prop-types';
import './AuthorView.scss';

// Dev-only authoring view for weather configs: `npm start`, then open
//   /hyggetime/?author&t=<seconds>#scene=<Scene+Name>&effect=<presetId>
// The UI is hidden so screenshots show only the video, and a 0-1 grid is drawn over the video
// frame so positions for sceneEffects.js can be read straight off a screenshot at any window size.
// The scene's current config is outlined on top: region masks (cyan), lights (yellow) and ground
// lines (orange = far, dim = near). `&guides=0` starts with the guides off.
//
// From the browser console (or an automation script):
//   __author.seek(seconds)                jump within the video, e.g. to check the framing holds
//   __author.time()                       current position in seconds
//   __author.duration()                   length of the video in seconds
//   __author.show(scene, effect, seconds) switch scene and weather without reloading
//   __author.guides(bool)                 toggle grid and outlines
//   __author.rect()                       where the video frame sits on screen, in px

const TICKS = Array.from({ length: 21 }, (_, i) => i / 20);
const pct = (n) => `${(n * 100).toFixed(2)}%`;

const AuthorView = ({ rect, config, showGuides }) => {
  if (!rect || !showGuides) return null;
  const { frame, visible } = rect;
  const aspect = frame.w / frame.h;
  const regions = config?.regions || [];

  return (
    <div
      className="author-frame"
      style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h }}
    >
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
        {TICKS.map((t) => (
          <g key={t} className={Math.round(t * 20) % 2 === 0 ? 'major' : 'minor'}>
            <line x1={t} y1={0} x2={t} y2={1} />
            <line x1={0} y1={t} x2={1} y2={t} />
          </g>
        ))}
        {regions.map((region) => {
          const ground = region.ground || config.ground;
          return (
            <g key={region.id}>
              {region.mask && (
                <polygon className="mask" points={region.mask.map(([x, y]) => `${x},${y}`).join(' ')} />
              )}
              {(region.lights || []).map((light) => (
                <ellipse
                  key={light.at.join(',')}
                  className="light"
                  cx={light.at[0]}
                  cy={light.at[1]}
                  // Light radius is a fraction of the frame height
                  rx={(light.radius ?? 0.12) / aspect}
                  ry={light.radius ?? 0.12}
                />
              ))}
              {ground && <line className="ground far" x1={0} x2={1} y1={ground.far} y2={ground.far} />}
              {ground && <line className="ground near" x1={0} x2={1} y1={ground.near ?? 1.05} y2={ground.near ?? 1.05} />}
            </g>
          );
        })}
      </svg>

      {/* Labels sit on the visible part of the frame, which can be cropped at the top and bottom */}
      {TICKS.filter((_, i) => i % 2 === 0).map((t) => (
        <React.Fragment key={t}>
          <span className="tick x" style={{ left: pct(t), top: visible.y - frame.y }}>{t.toFixed(1)}</span>
          <span className="tick y" style={{ top: pct(t) }}>{t.toFixed(1)}</span>
        </React.Fragment>
      ))}
      {regions.filter((r) => r.mask).map((region) => {
        // Label each shape at its top point, where neighbouring shapes are least likely to collide
        const [x, y] = region.mask.reduce((top, p) => (p[1] < top[1] ? p : top));
        return (
          <span key={region.id} className="region-label" style={{ left: pct(x), top: pct(y) }}>
            {region.id}
          </span>
        );
      })}
    </div>
  );
};

AuthorView.propTypes = {
  rect: PropTypes.object,
  config: PropTypes.object,
  showGuides: PropTypes.bool.isRequired,
};

export default AuthorView;
