import React from 'react';
import PropTypes from 'prop-types';
import { PauseIcon, PlayIcon } from './icons';
import './PlaybackFlash.scss';

// Brief center-screen confirmation each time playback is toggled
const PlaybackFlash = ({ trigger, playing }) => {
  if (!trigger) return null;
  const Icon = playing ? PlayIcon : PauseIcon;

  return (
    <div className="playback-flash" key={trigger} aria-hidden="true">
      <Icon width={40} height={40} />
    </div>
  );
};

PlaybackFlash.propTypes = {
  trigger: PropTypes.number.isRequired,
  playing: PropTypes.bool.isRequired,
};

export default PlaybackFlash;
