// What users can pick. Each preset is the global meaning of an option: which particles, how many,
// how fast, and how the picture is graded. Scenes only choose which presets they offer and where
// they render (see sceneEffects.js), so retuning a preset here retunes it everywhere.
//
//   group    'light' for presets that change the light rather than add weather (golden hour,
//            winter glow). One light preset can be layered with leaves or snow
//   kind     particle type: 'rain' | 'snow' | 'leaves' | 'motes' (dust in sunlight), or null for
//            no particles (lightning only)
//   density  1 = a full downpour / blizzard at 1280x720; scales with the area the effect covers
//   speed    1 = natural fall speed for the kind
//   wind     0 = straight down; 0.3 = clearly slanted. A slow gust is layered on top
//   sheet    rain only: strength of the veil of distant rain behind the individual drops
//   opacity  rain only: 0-1 overall strength of the drops and veil, so rain melds into the picture
//   lightning  optional { minGap, maxGap, strength }: the picture flares now and then, every
//              minGap-maxGap seconds; strength 0-1 is how bright the brightest flicker gets
//   grade    optional picture grading (CSS filter + tint) that makes the scene match the weather
//     saturate / brightness / contrast   CSS filter multipliers (1 = unchanged)
//     tint, tintOpacity                  colour wash over the picture
//     skyDarken                          0-1 darkening that fades out toward the bottom of the frame
//     sepia                              0-1 CSS sepia, a warm shift of the whole picture
//     blur                               px of softening, for scenes that only grade inside their
//                                        windows: the wet film on a rain-streaked train window
//     room                               0-1 dimming of the whole picture, for scenes that only
//                                        grade inside their windows (a storm still darkens the room)
//     roomColor                          colour of that dimming, default a neutral night blue
//   frost    optional { start, full } seconds: on rain-on-glass scenes, frost creeps in from the
//            edges of each pane, starting at `start` and reaching its furthest at `full`
//     glow                               { color, strength } warm light from the scene's authored
//                                        `sun` (sceneEffects.js): highlights on the sunny side warm
//                                        and lift, plus a soft bloom around the sun itself
export const effectPresets = {
  lightRain: {
    label: 'Light rain',
    kind: 'rain',
    // Light rain is mostly empty air: a scatter of fine drops, barely any veil
    density: 0.24,
    speed: 0.85,
    wind: 0.06,
    sheet: 0.12,
    opacity: 0.55,
    grade: {
      saturate: 0.82, brightness: 0.94, contrast: 0.98, tint: '#8aa0b8', tintOpacity: 0.14, skyDarken: 0.12,
    },
  },
  heavyRain: {
    label: 'Heavy rain',
    kind: 'rain',
    density: 0.8,
    speed: 1.1,
    wind: 0.22,
    sheet: 0.45,
    opacity: 0.6,
    grade: {
      saturate: 0.6, brightness: 0.8, contrast: 0.96, tint: '#6f8398', tintOpacity: 0.24, skyDarken: 0.3,
    },
  },
  thunderstorm: {
    label: 'Thunderstorm',
    kind: 'rain',
    density: 0.9,
    speed: 1.15,
    wind: 0.28,
    sheet: 0.5,
    opacity: 0.65,
    grade: {
      saturate: 0.55, brightness: 0.72, contrast: 1.02, tint: '#62758c', tintOpacity: 0.28, skyDarken: 0.38,
    },
    // Rare on purpose: a storm that flashes every few seconds feels like a strobe, not weather
    lightning: { minGap: 20, maxGap: 60, strength: 0.8 },
  },
  // For videos that already have their own rain: overlaid rain would double up, but the storm's
  // lightning still fits. No particles and no grade, since the video is already rainy.
  lightning: {
    label: 'Lightning',
    kind: null,
    lightning: { minGap: 20, maxGap: 60, strength: 0.8 },
  },
  snow: {
    label: 'Snow',
    kind: 'snow',
    // Flakes are small, so it takes more of them to read as snowfall
    density: 0.75,
    speed: 0.7,
    wind: 0.12,
    grade: {
      saturate: 0.85, brightness: 1, contrast: 0.95, tint: '#b8c8e0', tintOpacity: 0.1, skyDarken: 0.06,
    },
  },
  // Late warm sunlight. Mostly a grade, but a uniform warm tint just looks like a photo filter:
  // the light has to come from the sun's side of the picture and lift the highlights there while
  // the shadows stay deep. Dust drifting in the light sells it. Only for soft daylight scenes,
  // since the video's own shadows can't be moved.
  goldenHour: {
    label: 'Golden hour',
    group: 'light',
    kind: 'motes',
    density: 0.6,
    speed: 1,
    wind: 0.05,
    grade: {
      saturate: 1.12, brightness: 1.02, contrast: 1.06, sepia: 0.16, skyDarken: 0,
      glow: { color: '#ffa94d', strength: 0.6 },
    },
  },
  // The pink-gold of low sun on snow (alpenglow), with ice crystals glinting in the light. Warmer
  // than daylight snow but softer and pinker than golden hour, which turns snow orange
  winterGlow: {
    label: 'Winter glow',
    group: 'light',
    kind: 'motes',
    density: 0.45,
    speed: 0.8,
    wind: 0.08,
    grade: {
      // Soft light can't colour white, so snow takes its pink from a gentle multiplied tint
      saturate: 1.08, brightness: 1.04, contrast: 1.05, sepia: 0.05, skyDarken: 0,
      tint: '#ffc9bc', tintOpacity: 0.55,
      glow: { color: '#ffb3a6', strength: 0.65 },
    },
  },
  // Only for the Hogwarts Express: the train stops being cosy. The rain gets heavy, the light
  // drains out of the compartment, it turns cold and the windows frost over from the edges in
  dementors: {
    label: 'Dementors attack',
    kind: 'rain',
    density: 1,
    speed: 1.15,
    wind: 0.28,
    sheet: 0.5,
    opacity: 0.65,
    grade: {
      saturate: 0.3, brightness: 0.5, contrast: 1.05, tint: '#4a6488', tintOpacity: 0.4, skyDarken: 0.4,
      room: 0.55, roomColor: '#1c2c48', blur: 2,
    },
    frost: { start: 5, full: 90 },
  },
  leaves: {
    label: 'Falling leaves',
    kind: 'leaves',
    density: 0.7,
    speed: 0.6,
    wind: 0.35,
  },
};

const isPreset = (id) => Object.prototype.hasOwnProperty.call(effectPresets, id);
export const isLightPreset = (id) => effectPresets[id]?.group === 'light';

// A light preset layers over particles that don't bring their own sky. Rain and storms come with
// an overcast grade, so golden hour over rain would contradict itself
const LAYERS_WITH_LIGHT = ['leaves', 'snow'];
export const canCombine = (lightId, weatherId) => isLightPreset(lightId)
  && !isLightPreset(weatherId) && LAYERS_WITH_LIGHT.includes(effectPresets[weatherId]?.kind);

// A selection is one preset id, or a weather and a light joined with a comma ("leaves,goldenHour"),
// so saved mixes and share links keep storing a single string
export const splitEffect = (selection) => (selection ? selection.split(',').filter(Boolean) : []);
export const joinEffect = (weatherId, lightId) => [weatherId, lightId].filter(Boolean).join(',');

export const isEffectPreset = (selection) => {
  const parts = splitEffect(selection);
  if (parts.length === 1) return isPreset(parts[0]);
  return parts.length === 2 && parts.every(isPreset) && canCombine(parts[1], parts[0]);
};

export const effectLabel = (selection) => splitEffect(selection)
  .map((id) => effectPresets[id]?.label).filter(Boolean).join(' + ');
