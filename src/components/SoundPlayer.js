import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import { soundUrls } from '../data/sounds';
import useFadedVolume from '../hooks/useFadedVolume';
import { restartPlayer } from '../utils/youtube';

// Hidden player for one ambient sound
const SoundPlayer = ({ sound, volume, playing, onError }) => {
  const player = useRef(null);
  const url = soundUrls[sound];
  const faded = useFadedVolume(volume, playing);

  return (
    <ReactPlayer
      ref={player}
      url={url}
      width="0px"
      height="0px"
      loop
      controls={false}
      volume={faded.volume}
      playing={faded.playing}
      onEnded={() => restartPlayer(player.current, url)}
      onError={(code) => onError(sound, code)}
    />
  );
};

SoundPlayer.propTypes = {
  sound: PropTypes.string.isRequired,
  volume: PropTypes.number.isRequired,
  playing: PropTypes.bool.isRequired,
  onError: PropTypes.func.isRequired,
};

export default SoundPlayer;
