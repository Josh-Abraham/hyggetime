import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CastButton from './CastButton';
import IconButton from './IconButton';
import { FullscreenIcon, SearchIcon, ShareIcon } from './icons';
import { isValidYouTubeUrl } from '../utils/youtube';
import './TopBar.scss';

const TopBar = ({ visible, onSubmitUrl, onOpenGallery, onShare, onToggleFullscreen }) => {
  const [query, setQuery] = useState('');

  const submit = () => {
    const url = query.trim();
    if (!isValidYouTubeUrl(url)) {
      alert('Please enter a valid YouTube URL');
      return;
    }
    onSubmitUrl(url);
    setQuery('');
  };

  return (
    <div className={`top-bar ${visible ? 'visible' : 'hidden'}`}>
      <button className="app-title" onClick={onOpenGallery} title="Browse scenes">Hygge Time</button>

      <div className="search">
        <input
          type="text"
          placeholder="Paste a YouTube link to play it"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className="search-button" onClick={submit} aria-label="Play this URL">
          <SearchIcon />
        </button>
      </div>

      <div className="top-bar-actions">
        <IconButton title="Copy a link to this mix" onClick={onShare}><ShareIcon /></IconButton>
        <CastButton />
        <IconButton title="Fullscreen" onClick={onToggleFullscreen}><FullscreenIcon /></IconButton>
      </div>
    </div>
  );
};

TopBar.propTypes = {
  visible: PropTypes.bool.isRequired,
  onSubmitUrl: PropTypes.func.isRequired,
  onOpenGallery: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onToggleFullscreen: PropTypes.func.isRequired,
};

export default TopBar;
