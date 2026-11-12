import { sceneUrls } from './scenes';
import { BASE_SOUND } from './sounds';

const sound = (name, volume = 1) => ({ sound: name, volume });

// Ready-made vibes: a scene plus ambient sounds at balanced volumes
const mixDefinitions = [
  {
    id: 'starter-rainy-night',
    name: 'Rainy Night In',
    scene: 'Rainy Castle',
    sounds: [sound(BASE_SOUND, 0.4), sound('Light Rain', 0.8), sound('Fireplace', 0.6)],
  },
  {
    id: 'starter-snowed-in',
    name: 'Snowed In',
    scene: 'Winter Cabin',
    sounds: [sound(BASE_SOUND, 0.5), sound('Blizzard', 0.35), sound('Fireplace', 0.7)],
  },
  {
    id: 'starter-fall-evening',
    name: 'Fall Porch Evening',
    scene: 'Nighttime Porch',
    sounds: [sound(BASE_SOUND, 0.5), sound('Nighttime Forest', 0.6), sound('Fall Leaves', 0.4)],
  },
  {
    id: 'starter-beach-bonfire',
    name: 'Beach Bonfire',
    scene: 'Beach Bonfire',
    sounds: [sound(BASE_SOUND, 0.6), sound('Waves', 0.5), sound('Soft Waves', 0.3)],
  },
  {
    id: 'starter-stormy-library',
    name: 'Stormy Library',
    scene: 'Hogwarts Library',
    sounds: [sound(BASE_SOUND, 0.5), sound('Thunder', 0.3), sound('Light Rain', 0.5), sound('Fireplace', 0.4)],
  },
  {
    id: 'starter-rainy-cafe',
    name: 'Rainy Coffee Shop',
    scene: 'Fall Coffee Shop',
    sounds: [sound(BASE_SOUND, 0.7), sound('Light Rain', 0.3)],
  },
  {
    id: 'starter-tropical-escape',
    name: 'Tropical Escape',
    scene: 'Tropical Beach',
    sounds: [sound(BASE_SOUND, 0.5), sound('Waves', 0.5), sound('Tropical House', 0.3)],
  },
  {
    id: 'starter-forest-walk',
    name: 'Forest Walk',
    scene: 'English Forest',
    sounds: [sound(BASE_SOUND, 0.6), sound('Stream', 0.4), sound('Forest Sounds', 0.3)],
  },
  {
    id: 'starter-magic-evening',
    name: 'Magic Kingdom Evening',
    scene: 'Magic Kingdom Sunset',
    sounds: [sound(BASE_SOUND, 0.5), sound('Magic Kingdom Area Music', 0.5), sound('Summer Night', 0.3)],
  },
  // Mixes can also set a weather effect (a preset id from effects/presets.js); the scene must offer it
  {
    id: 'starter-rainy-nook',
    name: 'Rainy Reading Nook',
    scene: 'Gothic Reading Nook',
    effect: 'lightRain',
    sounds: [sound(BASE_SOUND, 0.4), sound('Light Rain', 0.6), sound('Fireplace', 0.5)],
  },
  {
    id: 'starter-autumn-rain',
    name: 'Autumn Rain',
    scene: 'Autumn Forest',
    effect: 'lightRain',
    sounds: [sound(BASE_SOUND, 0.5), sound('Light Rain', 0.6), sound('Stream', 0.3)],
  },
  {
    id: 'starter-cozy-christmas',
    name: 'Cozy Christmas',
    scene: 'Christmas Porch',
    sounds: [sound(BASE_SOUND, 0.5), sound('Christmas Music', 0.4), sound('Light Snow', 0.4)],
  },
];

// Starter mixes reference scenes by name; saved mixes carry their own URL (custom videos too)
export const starterMixes = mixDefinitions.map((mix) => ({ ...mix, url: sceneUrls[mix.scene], starter: true }));
