import React from 'react';
import PropTypes from 'prop-types';
import IconButton from './IconButton';
import SeekBar from './SeekBar';
import { BookmarkIcon, PauseIcon, PlayIcon, WaveIcon } from './icons';
import { getThumbnailUrl } from '../utils/youtube';
import './BottomControls.scss';

const summarize = (names) => {
  if (!names.length) return 'Add sounds';
  return `${names.length} ${names.length === 1 ? 'sound' : 'sounds'}`;
};

const BottomControls = ({
  visible, player, sceneName, sceneUrl, ambientSounds, playing,
  onOpenGallery, onOpenSounds, onSaveMix, onTogglePlay,
}) => {
  const thumbnail = getThumbnailUrl(sceneUrl);

  return (
    <div className={`bottom-controls ${visible ? 'visible' : 'hidden'}`}>
      <div className="dock">
        <SeekBar player={player} />

        <div className="dock-row">
          <button className="dock-card" onClick={onOpenGallery} title="Change scene">
            <span className="dock-thumb">{thumbnail && <img src={thumbnail} alt="" />}</span>
            <span className="dock-text">
              <small>Scene</small>
              <strong>{sceneName || 'Choose a scene'}</strong>
            </span>
          </button>

          <button className="dock-card" onClick={onOpenSounds} title="Ambient sounds">
            <span className={`dock-thumb dock-icon ${ambientSounds.length ? 'active' : ''}`}>
              <WaveIcon width={20} height={20} />
            </span>
            <span className="dock-text">
              <small>Ambient sounds</small>
              <strong>{summarize(ambientSounds)}</strong>
            </span>
          </button>

          <IconButton title="Save this mix" onClick={onSaveMix}><BookmarkIcon /></IconButton>

          <button
            className="play-button"
            onClick={onTogglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

BottomControls.propTypes = {
  visible: PropTypes.bool.isRequired,
  player: PropTypes.shape({ current: PropTypes.object }).isRequired,
  sceneName: PropTypes.string,
  sceneUrl: PropTypes.string,
  ambientSounds: PropTypes.arrayOf(PropTypes.string).isRequired,
  playing: PropTypes.bool.isRequired,
  onOpenGallery: PropTypes.func.isRequired,
  onOpenSounds: PropTypes.func.isRequired,
  onSaveMix: PropTypes.func.isRequired,
  onTogglePlay: PropTypes.func.isRequired,
};

export default BottomControls;
