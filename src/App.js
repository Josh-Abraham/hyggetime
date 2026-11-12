import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import BottomControls from './components/BottomControls';
import SceneGallery from './components/SceneGallery';
import SoundPlayer from './components/SoundPlayer';
import TopBar from './components/TopBar';
import Notice from './components/Notice';
import PlaybackFlash from './components/PlaybackFlash';
import SoundMixer from './components/SoundMixer';
import EffectPicker from './components/EffectPicker';
import EffectLayer from './effects/EffectLayer';
import GradeLayer from './effects/GradeLayer';
import LightningLayer from './effects/LightningLayer';
import AuthorView from './effects/AuthorView';
import { effectLabel } from './effects/presets';
import { gradeFilter, resolveEffect, validateSceneEffects } from './effects/resolveEffect';
import { getSceneEffects, sceneEffects } from './effects/sceneEffects';
import useFadedEffect from './effects/useFadedEffect';
import useVideoRect from './effects/useVideoRect';
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

// Dev only: ?author opens the authoring view for weather configs (see effects/AuthorView.js).
// &t=<seconds> starts the video there; &guides=0 starts with the grid and outlines hidden.
const authorParams = new URLSearchParams(window.location.search);
const AUTHOR = import.meta.env.DEV && authorParams.has('author');
const AUTHOR_START = Number(authorParams.get('t')) || 0;
if (import.meta.env.DEV) validateSceneEffects(sceneEffects, sceneUrls);

// How long to wait for a scene to begin playing before assuming the browser blocked autoplay
const AUTOPLAY_TIMEOUT_MS = 10000;

const App = () => {
  const [scene, setScene] = useState(sharedMix ? { name: sharedMix.name, url: sharedMix.url } : { name: '', url: '' });
  // URL of the scene whose player has reported ready; the video fades in once it matches the current scene
  const [readyUrl, setReadyUrl] = useState('');
  // URL of the scene that has actually begun playing
  const [startedUrl, setStartedUrl] = useState('');
  // Authoring plays straight away: it is muted, so the browser allows it
  const [playing, setPlaying] = useState(!sharedMix || AUTHOR);
  // The base sound is the scene video's own audio; every other entry is an ambient sound
  const [sounds, setSounds] = useState(sharedMix ? sharedMix.sounds : [{ sound: BASE_SOUND, volume: 1 }]);
  const [showGallery, setShowGallery] = useState(!sharedMix && !AUTHOR);
  const [showSounds, setShowSounds] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  // Weather preset id (see effects/presets.js), or '' for none
  const [effect, setEffect] = useState(sharedMix ? sharedMix.effect : '');
  const [showGuides, setShowGuides] = useState(authorParams.get('guides') !== '0');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [notice, setNotice] = useState(sharedMix ? 'Shared mix loaded. Press play to start.' : '');
  const player = useRef(null);
  // Where to seek once the player is ready (authoring only)
  const pendingSeek = useRef(AUTHOR ? AUTHOR_START : 0);
  const videoContainer = useRef(null);
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
    // Authoring keeps the hash so a reload comes back to the same scene
    if (sharedMix && !AUTHOR) window.history.replaceState(null, '', window.location.pathname + window.location.search);
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

  // Weather is per scene: only scenes with an entry in sceneEffects.js offer it, and custom
  // videos never do
  const catalogScene = !!scene.url && sceneUrls[scene.name] === scene.url;
  const sceneConfig = catalogScene ? getSceneEffects(scene.name) : null;
  const resolvedEffect = useMemo(() => resolveEffect(sceneConfig, effect), [sceneConfig, effect]);
  // Hold the weather back until the video is showing, so it doesn't fall over a black screen
  const liveEffect = resolvedEffect && readyUrl === scene.url ? resolvedEffect : null;
  const { current: shownEffect, visible: effectVisible } = useFadedEffect(liveEffect);
  const videoRect = useVideoRect(videoContainer, shownEffect?.aspect);
  const wholeFrameGrade = shownEffect?.grade && shownEffect.gradeScope !== 'regions' && effectVisible;

  const chooseScene = useCallback((name) => {
    setScene({ name, url: sceneUrls[name] });
    setEffect('');
    setShowGallery(false);
  }, []);

  useEffect(() => {
    if (!AUTHOR) return undefined;
    window.__author = {
      seek: (seconds) => player.current?.seekTo(seconds, 'seconds'),
      time: () => player.current?.getCurrentTime(),
      duration: () => player.current?.getDuration(),
      show: (name, effectId = '', seconds = 0) => {
        if (!sceneUrls[name]) return `Unknown scene "${name}"`;
        if (name === scene.name) {
          player.current?.seekTo(seconds, 'seconds');
        } else {
          pendingSeek.current = seconds;
          chooseScene(name);
        }
        setEffect(effectId);
        return 'ok';
      },
      guides: (on = true) => setShowGuides(on),
      rect: () => videoRect,
    };
    return () => { delete window.__author; };
  }, [chooseScene, scene.name, videoRect]);

  const playCustomUrl = useCallback(async (url) => {
    const title = await fetchVideoTitle(url);
    setScene({ name: title || 'Custom video', url });
    setEffect('');
    setShowGallery(false);
  }, []);

  const applyMix = useCallback((mix) => {
    setScene({ name: mix.scene, url: mix.url });
    setEffect(mix.effect || '');
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
      saveMix({
        name: name.trim(), scene: scene.name, url: scene.url, sounds, effect: resolvedEffect ? effect : '',
      });
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
    const link = encodeSharedMix(scene, sounds, resolvedEffect ? effect : '');
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
      if (e.code !== 'Space' || e.repeat || showGallery || showSounds || showEffects) return;
      // Let buttons, inputs and sliders keep their own space-bar behavior
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, textarea, select, button, [role="slider"], [contenteditable="true"]')) return;
      e.preventDefault();
      togglePlay();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [togglePlay, showGallery, showSounds, showEffects]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };

  return (
    <div className={AUTHOR ? 'app authoring' : 'app'}>
      <div className="video-container" ref={videoContainer}>
        <div
          className={`scene-player ${scene.url && readyUrl === scene.url ? 'ready' : ''}`}
          style={wholeFrameGrade ? { filter: gradeFilter(shownEffect.grade) } : undefined}
        >
          <ReactPlayer
            ref={player}
            url={scene.url}
            width="100%"
            height="100%"
            loop
            controls={false}
            muted={!base || AUTHOR}
            volume={sceneAudio.volume}
            playing={sceneAudio.playing}
            config={PLAYER_CONFIG}
            onEnded={() => restartPlayer(player.current, scene.url)}
            onReady={() => {
              setReadyUrl(scene.url);
              if (pendingSeek.current) {
                player.current?.seekTo(pendingSeek.current, 'seconds');
                pendingSeek.current = 0;
              }
            }}
            onStart={() => setStartedUrl(scene.url)}
            onError={handleSceneError}
          />
        </div>
        <GradeLayer effect={shownEffect} rect={videoRect} visible={effectVisible} />
        <EffectLayer
          effect={shownEffect}
          rect={videoRect}
          visible={effectVisible}
          playing={sceneAudio.playing}
        />
        <LightningLayer
          effect={shownEffect}
          rect={videoRect}
          playing={sceneAudio.playing}
          visible={effectVisible}
        />
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
      {AUTHOR && scene.url && <AuthorView rect={videoRect} config={sceneConfig} showGuides={showGuides} />}
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
        effectsAvailable={!!sceneConfig}
        effectLabel={resolvedEffect ? effectLabel(effect) : ''}
        onOpenGallery={() => setShowGallery(true)}
        onOpenSounds={() => setShowSounds(true)}
        onOpenEffects={() => setShowEffects(true)}
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

      {showEffects && sceneConfig && (
        <EffectPicker
          offer={sceneConfig.offer}
          current={resolvedEffect ? effect : ''}
          onSelect={setEffect}
          onClose={() => setShowEffects(false)}
        />
      )}

      {notice && <Notice message={notice} onDismiss={() => setNotice('')} />}

      <div className="gradient-overlay top" />
      <div className="gradient-overlay bottom" />
    </div>
  );
};

export default App;
