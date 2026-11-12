import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  canCombine, effectPresets, isLightPreset, joinEffect, splitEffect,
} from '../effects/presets';
import { CloseIcon } from './icons';
import './SoundMixer.scss';
import './EffectPicker.scss';

// Choose the weather and light for the current scene. Which options appear (and where they render)
// is decided per scene in effects/sceneEffects.js; the numbers behind each option live in presets.js.
// Reuses the sound mixer's panel styling so the two feel like siblings.
//
// Scenes that offer both weather and light options show them as two rows, one pick per row, so
// golden hour can sit under falling leaves. A pick that can't layer with the other row's (golden
// hour with rain) replaces it instead.
const EffectPicker = ({ offer, current, onSelect, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const weatherOffer = offer.filter((id) => !isLightPreset(id));
  const lightOffer = offer.filter(isLightPreset);
  const twoRows = weatherOffer.length > 0 && lightOffer.length > 0;

  const parts = splitEffect(current);
  const weather = parts.find((id) => !isLightPreset(id)) || '';
  const light = parts.find(isLightPreset) || '';

  const chooseWeather = (id) => {
    onSelect(light && (!id || canCombine(light, id)) ? joinEffect(id, light) : id);
  };
  const chooseLight = (id) => {
    onSelect(weather && (!id || canCombine(id, weather)) ? joinEffect(weather, id) : id);
  };

  // With a single row, picking is the whole job, so the panel closes
  const chooseOnly = (id) => {
    onSelect(id);
    onClose();
  };

  const tiles = (ids, selected, choose) => (
    <div className="sound-grid">
      <div className={`sound-tile ${selected ? '' : 'active'}`}>
        <button className="sound-toggle" onClick={() => choose('')} aria-pressed={!selected}>
          <span className="sound-name">None</span>
        </button>
      </div>
      {ids.map((id) => (
        <div key={id} className={`sound-tile ${selected === id ? 'active' : ''}`}>
          <button className="sound-toggle" onClick={() => choose(id)} aria-pressed={selected === id}>
            <span className="sound-name">{effectPresets[id].label}</span>
          </button>
        </div>
      ))}
    </div>
  );

  const title = lightOffer.length && !weatherOffer.length ? 'Light' : 'Weather';
  const subtitle = twoRows ? 'Add weather and light to this scene' : `Add ${title.toLowerCase()} to this scene`;

  return (
    <>
      <div className="sound-mixer-backdrop" onClick={onClose} />
      <div className="sound-mixer effect-picker" role="dialog" aria-label={twoRows ? 'Weather and light' : title}>
        <div className="sound-mixer-header">
          <div>
            <h3>{twoRows ? 'Weather & light' : title}</h3>
            <p>{subtitle}</p>
          </div>
          <button className="sound-mixer-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>
        <div className="sound-mixer-body">
          {twoRows ? (
            <>
              <h4 className="effect-group-title">Weather</h4>
              {tiles(weatherOffer, weather, chooseWeather)}
              <h4 className="effect-group-title">Light</h4>
              {tiles(lightOffer, light, chooseLight)}
            </>
          ) : tiles(offer, current, chooseOnly)}
        </div>
      </div>
    </>
  );
};

EffectPicker.propTypes = {
  offer: PropTypes.arrayOf(PropTypes.string).isRequired,
  current: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EffectPicker;
