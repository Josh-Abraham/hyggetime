import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { BASE_SOUND } from '../data/sounds';
import { getThumbnailUrl } from '../utils/youtube';
import './SceneGallery.scss';

const MIXES_TAB = 'Mixes';

const describeMix = (mix) => {
  const names = mix.sounds.filter((s) => s.sound !== BASE_SOUND).map((s) => s.sound);
  return names.length ? `${mix.scene} · ${names.join(', ')}` : mix.scene;
};

const SceneGallery = ({ groups, urls, mixes, current, onSelect, onSelectMix, onDeleteMix, onClose }) => {
  const [season, setSeason] = useState(MIXES_TAB);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const group = groups.find((g) => g.value === season);
  const tabs = [MIXES_TAB, ...groups.map((g) => g.value)];

  return (
    <div className="scene-gallery" role="dialog" aria-label="Choose a scene">
      <div className="scene-gallery-header">
        <div>
          <div className="scene-brand">Hygge Time</div>
          <h2>Where would you like to be?</h2>
          <p>Pick a scene, then layer ambient sounds on top.</p>
        </div>
        <button className="scene-close" onClick={onClose} aria-label="Close">×</button>
      </div>

      <div className="scene-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`scene-tab ${tab === season ? 'active' : ''}`}
            onClick={() => setSeason(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {season === MIXES_TAB && (
        <p className="mixes-note">Save your own with the bookmark button. Saved mixes stay in this browser only.</p>
      )}

      <div className="scene-grid">
        {season === MIXES_TAB
          ? mixes.map((mix) => {
            const thumbnail = getThumbnailUrl(mix.url);
            return (
              <div key={mix.id} className="scene-card mix-card">
                <button className="mix-select" onClick={() => onSelectMix(mix)}>
                  {thumbnail && <img src={thumbnail} alt="" loading="lazy" />}
                  <span className="scene-card-title">
                    {mix.name}
                    <small>{describeMix(mix)}</small>
                  </span>
                </button>
                {!mix.starter && (
                  <button
                    className="mix-delete"
                    onClick={() => onDeleteMix(mix.id)}
                    aria-label={`Delete ${mix.name}`}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })
          : group.children.map((name) => {
            const thumbnail = getThumbnailUrl(urls[name]);
            return (
              <button
                key={name}
                className={`scene-card ${name === current ? 'selected' : ''}`}
                onClick={() => onSelect(name)}
              >
                {thumbnail && <img src={thumbnail} alt="" loading="lazy" />}
                <span className="scene-card-title">{name}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
};

SceneGallery.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  urls: PropTypes.object.isRequired,
  mixes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    scene: PropTypes.string.isRequired,
    url: PropTypes.string,
    starter: PropTypes.bool,
    sounds: PropTypes.array.isRequired,
  })).isRequired,
  current: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onSelectMix: PropTypes.func.isRequired,
  onDeleteMix: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SceneGallery;
