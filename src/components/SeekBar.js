import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Slider } from '@mui/material';
import './SeekBar.scss';

const formatTime = (seconds) => {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};

// Scrubber for the scene video. Polls the player itself so playback ticks don't re-render the app.
const SeekBar = ({ player }) => {
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    const tick = () => {
      const p = player.current;
      if (!p) return;
      setTime({ current: p.getCurrentTime() || 0, duration: p.getDuration() || 0 });
    };
    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [player]);

  // Live streams report an infinite duration and have nothing to seek within
  if (!Number.isFinite(time.duration) || time.duration <= 0) return null;

  const value = dragging ?? time.current;

  return (
    <div className="seek-bar">
      <span className="seek-time">{formatTime(value)}</span>
      <Slider
        className="seek-slider"
        size="small"
        aria-label="Seek"
        value={value}
        min={0}
        max={time.duration}
        onChange={(e, v) => setDragging(v)}
        onChangeCommitted={(e, v) => {
          player.current.seekTo(v, 'seconds');
          setTime((t) => ({ ...t, current: v }));
          setDragging(null);
        }}
      />
      <span className="seek-time">{formatTime(time.duration)}</span>
    </div>
  );
};

SeekBar.propTypes = {
  player: PropTypes.shape({ current: PropTypes.object }).isRequired,
};

export default SeekBar;
