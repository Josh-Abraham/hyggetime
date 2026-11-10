import { sceneUrls } from '../data/scenes';
import { BASE_SOUND, soundUrls } from '../data/sounds';
import { isValidYouTubeUrl } from './youtube';

const toPercent = (volume) => Math.round(Math.max(0, Math.min(1, volume)) * 100);

// Link that reopens the current scene and sounds:
// #scene=Rainy+Castle&base=40&sounds=Light+Rain:80|Fireplace:60   (or video=<youtube url> for custom videos)
export const encodeSharedMix = (scene, sounds) => {
  const params = new URLSearchParams();
  if (sceneUrls[scene.name] === scene.url) params.set('scene', scene.name);
  else params.set('video', scene.url);

  const base = sounds.find((s) => s.sound === BASE_SOUND);
  if (base) params.set('base', toPercent(base.volume));

  const ambient = sounds
    .filter((s) => s.sound !== BASE_SOUND)
    .map((s) => `${s.sound}:${toPercent(s.volume)}`);
  if (ambient.length) params.set('sounds', ambient.join('|'));

  return `${window.location.origin}${window.location.pathname}#${params}`;
};

// Returns { name, url, sounds } or null when the hash isn't a usable shared mix
export const decodeSharedMix = (hash) => {
  const params = new URLSearchParams((hash || '').replace(/^#/, ''));

  let scene = null;
  const sceneName = params.get('scene');
  const video = params.get('video');
  if (sceneName && sceneUrls[sceneName]) scene = { name: sceneName, url: sceneUrls[sceneName] };
  else if (video && isValidYouTubeUrl(video)) scene = { name: 'Shared video', url: video };
  if (!scene) return null;

  const sounds = [];
  if (params.has('base')) {
    sounds.push({ sound: BASE_SOUND, volume: toPercent(Number(params.get('base')) / 100) / 100 });
  }
  (params.get('sounds') || '').split('|').forEach((entry) => {
    const split = entry.lastIndexOf(':');
    if (split < 1) return;
    const sound = entry.slice(0, split);
    const percent = Number(entry.slice(split + 1));
    if (sound in soundUrls && Number.isFinite(percent)) {
      sounds.push({ sound, volume: toPercent(percent / 100) / 100 });
    }
  });

  return { ...scene, sounds };
};
