import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import BottomControls from './components/BottomControls';
import SceneGallery from './components/SceneGallery';
import SoundPlayer from './components/SoundPlayer';
import TopBar from './components/TopBar';
import Notice from './components/Notice';
import PlaybackFlash from './components/PlaybackFlash';
import SoundMixer from './components/SoundMixer';
import { starterMixes } from './data/mixes';
import { sceneGroups, sceneUrls } from './data/scenes';
import { BASE_SOUND } from './data/sounds';
import useAutoHideControls from './hooks/useAutoHideControls';
import useFadedVolume from './hooks/useFadedVolume';
import useSavedMixes from './hooks/useSavedMixes';
import useUnavailable from './hooks/useUnavailable';
import { decodeSharedMix, encodeSharedMix } from './utils/share';
import { fetchVideoTitle, restartPlayer } from './utils/youtube';
import './App.scss';

// Our own controls drive playback, so keep YouTube's keyboard shortcuts and suggestions out of the way
const PLAYER_CONFIG = {
  youtube: { playerVars: { disablekb: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, playsinline: 1 } },
};

// YouTube error codes for a video that was removed, is private, or can't be embedded
const UNAVAILABLE_CODES = [100, 101, 150];

// A shared link restores its scene and sounds. Browsers won't autoplay with sound until the
// visitor interacts, so that visit starts paused and asks them to press play.
const sharedMix = decodeSharedMix(window.location.hash);

// How long to wait for a scene to begin playing before assuming the browser blocked autoplay
const AUTOPLAY_TIMEOUT_MS = 10000;

const App = () => {
  const [scene, setScene] = useState(sharedMix ? { name: sharedMix.name, url: sharedMix.url } : { name: '', url: '' });
  // URL of the scene whose player has reported ready; the video fades in once it matches the current scene
  const [readyUrl, setReadyUrl] = useState('');
  // URL of the scene that has actually begun playing
  const [startedUrl, setStartedUrl] = useState('');
  const [playing, setPlaying] = useState(!sharedMix);
  // The base sound is the scene video's own audio; every other entry is an ambient sound
  const [sounds, setSounds] = useState(sharedMix ? sharedMix.sounds : [{ sound: BASE_SOUND, volume: 1 }]);
  const [showGallery, setShowGallery] = useState(!sharedMix);
  const [showSounds, setShowSounds] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [notice, setNotice] = useState(sharedMix ? 'Shared mix loaded. Press play to start.' : '');
  const player = useRef(null);
  const { mixes: savedMixes, saveMix, deleteMix } = useSavedMixes();
  const controlsVisible = useAutoHideControls(isFullscreen);
  const { isAvailable, markUnavailable } = useUnavailable();

  // Hide anything whose video failed to load
  const visibleGroups = useMemo(() => sceneGroups
    .map((group) => ({ ...group, children: group.children.filter((name) => isAvailable(`scene:${name}`)) }))
    .filter((group) => group.children.length), [isAvailable]);
  const visibleMixes = useMemo(
    () => [...savedMixes, ...starterMixes].filter((mix) => isAvailable(`scene:${mix.scene}`)),
    [savedMixes, isAvailable],
  );

  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    if (sharedMix) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);

  // Some browsers (Safari, iPhones, strict Firefox) refuse to autoplay. Rather than showing a pause
  // button over a silent screen, fall back to the play button and say what happened.
  useEffect(() => {
    if (!scene.url || !playing || startedUrl === scene.url) return undefined;
    const timer = setTimeout(() => {
      if (document.visibilityState !== 'visible') return;
      setPlaying(false);
      setNotice('Your browser blocked autoplay. Press play to start.');
    }, AUTOPLAY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [scene.url, playing, startedUrl]);

  const base = sounds.find((s) => s.sound === BASE_SOUND);
  const sceneAudio = useFadedVolume(base ? base.volume : 1, playing);
  const ambientSounds = sounds.filter((s) => s.sound !== BASE_SOUND);

  const chooseScene = useCallback((name) => {
    setScene({ name, url: sceneUrls[name] });
    setShowGallery(false);
  }, []);

  const playCustomUrl = useCallback(async (url) => {
    const title = await fetchVideoTitle(url);
    setScene({ name: title || 'Custom video', url });
    setShowGallery(false);
  }, []);

  const applyMix = useCallback((mix) => {
    setScene({ name: mix.scene, url: mix.url });
    setSounds(mix.sounds.filter((s) => s.sound === BASE_SOUND || isAvailable(`sound:${s.sound}`)));
    setShowGallery(false);
  }, [isAvailable]);

  const saveCurrentMix = () => {
    if (!scene.url) {
      alert('Choose a scene first, then save it as a mix.');
      return;
    }
    const name = window.prompt('Name this mix', scene.name);
    if (name && name.trim()) {
      saveMix({ name: name.trim(), scene: scene.name, url: scene.url, sounds });
    }
  };

  const toggleSound = useCallback((name) => {
    setSounds((current) => (
      current.some((s) => s.sound === name)
        ? current.filter((s) => s.sound !== name)
        : [...current, { sound: name, volume: 1 }]
    ));
  }, []);

  const clearAmbientSounds = useCallback(() => {
    setSounds((current) => current.filter((s) => s.sound === BASE_SOUND));
  }, []);

  const changeVolume = useCallback((sound, volume) => {
    setSounds((current) => current.map((s) => (s.sound === sound ? { ...s, volume } : s)));
  }, []);

  const shareMix = async () => {
    if (!scene.url) {
      setNotice('Choose a scene first, then share it.');
      return;
    }
    const link = encodeSharedMix(scene, sounds);
    try {
      await navigator.clipboard.writeText(link);
      setNotice('Link copied. Anyone who opens it gets this scene and these sounds.');
    } catch {
      window.prompt('Copy this link to share your mix', link);
    }
  };

  const handleSceneError = useCallback((code) => {
    if (!UNAVAILABLE_CODES.includes(code)) return;
    const fromCatalog = sceneUrls[scene.name] === scene.url;
    if (fromCatalog) markUnavailable(`scene:${scene.name}`);
    setNotice(fromCatalog
      ? `“${scene.name}” isn't available anymore, so it was removed. Pick another scene.`
      : "That video can't be played here. Try another link.");
    setScene({ name: '', url: '' });
    setShowGallery(true);
  }, [scene, markUnavailable]);

  const handleSoundError = useCallback((sound, code) => {
    if (!UNAVAILABLE_CODES.includes(code)) return;
    markUnavailable(`sound:${sound}`);
    setSounds((current) => current.filter((s) => s.sound !== sound));
    setNotice(`The “${sound}” sound isn't available anymore, so it was removed.`);
  }, [markUnavailable]);

  // One entry point for every way of pausing: button, click on the video, space bar
  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
    setFlashKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.repeat || showGallery || showSounds) return;
      // Let buttons, inputs and sliders keep their own space-bar behavior
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, textarea, select, button, [role="slider"], [contenteditable="true"]')) return;
      e.preventDefault();
      togglePlay();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [togglePlay, showGallery, showSounds]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };

  return (
    <div className="app">
      <div className="video-container">
        <div className={`scene-player ${scene.url && readyUrl === scene.url ? 'ready' : ''}`}>
          <ReactPlayer
            ref={player}
            url={scene.url}
            width="100%"
            height="100%"
            loop
            controls={false}
            muted={!base}
            volume={sceneAudio.volume}
            playing={sceneAudio.playing}
            config={PLAYER_CONFIG}
            onEnded={() => restartPlayer(player.current, scene.url)}
            onReady={() => setReadyUrl(scene.url)}
            onStart={() => setStartedUrl(scene.url)}
            onError={handleSceneError}
          />
        </div>
        {ambientSounds.map(({ sound, volume }) => (
          <SoundPlayer
            key={sound}
            sound={sound}
            volume={volume}
            playing={playing}
            onError={handleSoundError}
          />
        ))}
      </div>

      <div className="video-click-layer" onClick={togglePlay} />
      <PlaybackFlash trigger={flashKey} playing={playing} />

      {showGallery && (
        <SceneGallery
          groups={visibleGroups}
          urls={sceneUrls}
          mixes={visibleMixes}
          current={scene.name}
          onSelect={chooseScene}
          onSelectMix={applyMix}
          onDeleteMix={deleteMix}
          onClose={() => setShowGallery(false)}
        />
      )}

      <TopBar
        visible={controlsVisible}
        onSubmitUrl={playCustomUrl}
        onOpenGallery={() => setShowGallery(true)}
        onShare={shareMix}
        onToggleFullscreen={toggleFullscreen}
      />
      <BottomControls
        visible={controlsVisible}
        player={player}
        sceneName={scene.name}
        sceneUrl={scene.url}
        ambientSounds={ambientSounds.map((s) => s.sound)}
        playing={playing}
        onOpenGallery={() => setShowGallery(true)}
        onOpenSounds={() => setShowSounds(true)}
        onSaveMix={saveCurrentMix}
        onTogglePlay={togglePlay}
      />
      {showSounds && (
        <SoundMixer
          sounds={sounds}
          isAvailable={isAvailable}
          onToggle={toggleSound}
          onVolumeChange={changeVolume}
          onClear={clearAmbientSounds}
          onClose={() => setShowSounds(false)}
        />
      )}

      {notice && <Notice message={notice} onDismiss={() => setNotice('')} />}

      <div className="gradient-overlay top" />
      <div className="gradient-overlay bottom" />
    </div>
  );
};

export default App;
