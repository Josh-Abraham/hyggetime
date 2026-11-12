import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { BASE_SOUND } from '../data/sounds';
import { getSceneEffects } from '../effects/sceneEffects';
import { effectPresets } from '../effects/presets';
import { getThumbnailUrl } from '../utils/youtube';
import './SceneGallery.scss';

const MIXES_TAB = 'Mixes';

const describeMix = (mix) => {
  const names = mix.sounds.filter((s) => s.sound !== BASE_SOUND).map((s) => s.sound);
  return names.length ? `${mix.scene} · ${names.join(', ')}` : mix.scene;
};

const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Every word typed has to appear somewhere in the item's searchable text, in any order
const matches = (haystack, words) => words.every((word) => haystack.includes(word));

// A scene is found by its name, the tabs it sits in, and the weather it offers, so "winter" or
// "rain" work as well as a title
const sceneKeywords = (name, groups) => {
  const tabs = groups.filter((g) => g.children.includes(name)).map((g) => g.value);
  const weather = (getSceneEffects(name)?.offer || []).map((id) => effectPresets[id]?.label || '');
  return normalize([name, ...tabs, ...weather].join(' '));
};

// Typing a query is easy with a mouse and keyboard; on touch screens wait for a tap so the
// on-screen keyboard doesn't cover the gallery as it opens
const prefersKeyboard = () => window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

const SceneGallery = ({ groups, urls, mixes, current, onSelect, onSelectMix, onDeleteMix, onClose }) => {
  const [season, setSeason] = useState(MIXES_TAB);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const searching = words.length > 0;

  useEffect(() => {
    if (prefersKeyboard()) searchRef.current?.focus();
  }, []);

  useEffect(() => {
    // Escape clears the search first, then closes the gallery
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (query) setQuery('');
      else onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, query]);

  const index = useMemo(() => {
    const names = [...new Set(groups.flatMap((g) => g.children))].sort((a, b) => a.localeCompare(b));
    return names.map((name) => ({ name, keywords: sceneKeywords(name, groups) }));
  }, [groups]);

  const results = searching ? {
    mixes: mixes.filter((mix) => matches(normalize(`${mix.name} ${describeMix(mix)}`), words)),
    scenes: index.filter((entry) => matches(entry.keywords, words)).map((entry) => entry.name),
  } : null;

  const group = groups.find((g) => g.value === season);
  const tabs = [MIXES_TAB, ...groups.map((g) => g.value)];

  const shownMixes = results ? results.mixes : (season === MIXES_TAB ? mixes : []);
  const shownScenes = results ? results.scenes : (season === MIXES_TAB ? [] : group.children);

  const onSearchKey = (e) => {
    if (e.key !== 'Enter' || !results) return;
    if (results.mixes.length) onSelectMix(results.mixes[0]);
    else if (results.scenes.length) onSelect(results.scenes[0]);
  };

  const chooseTab = (tab) => {
    setQuery('');
    setSeason(tab);
  };

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

      <div className="scene-toolbar">
        <div className="scene-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`scene-tab ${!searching && tab === season ? 'active' : ''}`}
              onClick={() => chooseTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="scene-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKey}
            placeholder="Search scenes"
            aria-label="Search scenes and mixes"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="scene-search-clear" onClick={() => setQuery('')} aria-label="Clear search">×</button>
          )}
        </div>
      </div>

      {searching && !results.mixes.length && !results.scenes.length && (
        <p className="scene-empty">No scenes match “{query.trim()}”.</p>
      )}

      {!searching && season === MIXES_TAB && (
        <p className="mixes-note">Save your own with the bookmark button. Saved mixes stay in this browser only.</p>
      )}

      <div className="scene-grid">
        {shownMixes.map((mix) => {
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
        })}
        {shownScenes.map((name) => {
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
