import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Slider } from '@mui/material';
import { BASE_SOUND, soundCategories } from '../data/sounds';
import { CloseIcon } from './icons';
import './SoundMixer.scss';

const SoundTile = ({ name, label = name, active, volume, onToggle, onVolumeChange }) => (
  <div className={`sound-tile ${active ? 'active' : ''}`}>
    <button className="sound-toggle" onClick={() => onToggle(name)} aria-pressed={active}>
      <span className="sound-name">{label}</span>
    </button>
    {active && (
      <Slider
        className="sound-volume"
        size="small"
        aria-label={`${label} volume`}
        value={volume * 100}
        min={0}
        max={100}
        onChange={(e, value) => onVolumeChange(name, value / 100)}
      />
    )}
  </div>
);

SoundTile.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  active: PropTypes.bool.isRequired,
  volume: PropTypes.number,
  isAvailable: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
};

// Pick ambient sounds and balance their volumes in one place
const SoundMixer = ({ sounds, isAvailable, onToggle, onVolumeChange, onClear, onClose }) => {
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const byName = Object.fromEntries(sounds.map((s) => [s.sound, s]));
  const playingCount = sounds.filter((s) => s.sound !== BASE_SOUND).length;
  const query = filter.trim().toLowerCase();

  const tile = (name, label) => (
    <SoundTile
      key={name}
      name={name}
      label={label}
      active={name in byName}
      volume={byName[name]?.volume}
      onToggle={onToggle}
      onVolumeChange={onVolumeChange}
    />
  );

  return (
    <>
      <div className="sound-mixer-backdrop" onClick={onClose} />
      <div className="sound-mixer" role="dialog" aria-label="Ambient sounds">
        <div className="sound-mixer-header">
          <div>
            <h3>Ambient Sounds</h3>
            <p>{playingCount ? `${playingCount} layered on your scene` : 'Tap to layer sounds on your scene'}</p>
          </div>
          <input
            className="sound-search"
            type="text"
            placeholder="Search sounds"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {playingCount > 0 && <button className="sound-clear" onClick={onClear}>Clear all</button>}
          <button className="sound-mixer-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>

        <div className="sound-mixer-body">
          {!query && (
            <section>
              <h4>Scene</h4>
              <div className="sound-grid">{tile(BASE_SOUND, 'Scene audio')}</div>
            </section>
          )}
          {soundCategories.map(({ name, sounds: names }) => {
            const visible = names.filter((n) => isAvailable(`sound:${n}`) && n.toLowerCase().includes(query));
            if (!visible.length) return null;
            return (
              <section key={name}>
                <h4>{name}</h4>
                <div className="sound-grid">{visible.map((n) => tile(n))}</div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
};

SoundMixer.propTypes = {
  sounds: PropTypes.arrayOf(PropTypes.shape({
    sound: PropTypes.string.isRequired,
    volume: PropTypes.number.isRequired,
  })).isRequired,
  isAvailable: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SoundMixer;
