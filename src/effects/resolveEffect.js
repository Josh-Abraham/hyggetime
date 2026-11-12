import { canCombine, effectLabel, effectPresets, splitEffect } from './presets';

// Turns (scene config, chosen preset id) into everything the layers need, or null when that
// scene doesn't offer the preset. Values resolve in order: preset, scene tuning, region tuning,
// then the region's scale multipliers.
const resolvePreset = (sceneConfig, presetId) => {
  const preset = effectPresets[presetId];
  if (!preset || !sceneConfig || !sceneConfig.offer.includes(presetId)) return null;

  const sceneTuned = { ...preset, ...sceneConfig.tuning?.[presetId] };
  // A scene can switch the particles off (kind: null), e.g. golden hour over a drone flyover,
  // where dust hanging in front of a flying camera would look wrong
  // On a train window the rain is drawn as water on the glass rather than falling (scene `travel`)
  const kind = sceneTuned.kind === 'rain' && sceneConfig.travel?.glass ? 'glass' : sceneTuned.kind;
  const regions = sceneConfig.regions.map((region) => {
    const tuned = { ...preset, ...sceneConfig.tuning?.[presetId], ...region.tuning?.[presetId] };
    return {
      id: region.id,
      mask: region.mask || null,
      kind,
      density: tuned.density * (region.densityScale ?? 1),
      speed: tuned.speed * (region.speedScale ?? 1),
      wind: tuned.wind,
      // On a moving train the rain streams past the glass instead of falling (scene `travel`)
      drift: ['rain', 'snow', 'glass'].includes(kind) ? sceneConfig.travel?.lean ?? 0 : 0,
      // Beads on glass are sized by the scene's glass.size, not by the falling rain's scale
      particleScale: kind === 'glass' ? 1 : region.particleScale ?? 1,
      sheet: tuned.sheet ?? 0,
      opacity: tuned.opacity ?? 1,
      frost: tuned.frost || null,
      blur: region.blur ?? 0,
      feather: region.feather ?? 8,
      // Scene knowledge the renderer can't read from the cross-origin video, authored per scene
      // Dust only shows where the sun catches it
      lights: region.lights || (kind === 'motes' && sceneConfig.sun
        ? [{ at: sceneConfig.sun.at, radius: (sceneConfig.sun.radius ?? 0.35) * 1.8, color: sceneTuned.grade?.glow?.color || '#ffc27a' }]
        : null),
      lightFloor: region.lightFloor ?? (kind === 'motes' ? 0.2 : 0.35),
      ground: region.ground || sceneConfig.ground || null,
    };
  });

  // Still windows (scene `glass`) keep their falling rain and add beads on the pane over it,
  // which gather and run down. Only the heavy drops slide, so the glass needs fewer than a train's
  const glass = sceneConfig.glass && kind === 'rain' ? sceneConfig.regions.map((region, i) => ({
    ...regions[i],
    id: `glass:${region.id}`,
    kind: 'glass',
    density: sceneTuned.density * (sceneConfig.glass.density ?? 0.6),
    particleScale: sceneConfig.glass.size ?? 1,
    drift: 0,
  })) : [];

  return {
    presetId,
    label: preset.label,
    kind,
    regions: [...regions, ...glass],
    // A scene can retune or add a grade, e.g. darkening a rainy video when its lightning is on
    // Merged, so a scene can adjust one value of a preset's grade without restating the rest
    grade: preset.grade || sceneConfig.tuning?.[presetId]?.grade
      ? { ...preset.grade, ...sceneConfig.tuning?.[presetId]?.grade }
      : null,
    lightning: sceneTuned.lightning || null,
    gradeScope: sceneConfig.grade?.scope || 'frame',
    // Optional whole-window shapes for region grading, so the grade covers the glazing bars and
    // no ungraded rim of glass shows around each tightly traced pane
    gradeAreas: sceneConfig.grade?.areas || null,
    sun: sceneConfig.sun || null,
    aspect: sceneConfig.aspect || 16 / 9,
  };
};

// A selection is one preset or a weather plus a light (see splitEffect). Combined, the weather
// keeps its particles and the light supplies the grade, sun and any particles of its own (dust)
export const resolveEffect = (sceneConfig, selection) => {
  const parts = splitEffect(selection);
  if (parts.length === 1) return resolvePreset(sceneConfig, parts[0]);
  if (parts.length !== 2 || !canCombine(parts[1], parts[0])) return null;
  const weather = resolvePreset(sceneConfig, parts[0]);
  const light = resolvePreset(sceneConfig, parts[1]);
  if (!weather || !light) return null;
  return {
    ...weather,
    presetId: selection,
    label: effectLabel(selection),
    regions: [
      ...weather.regions,
      ...light.regions.filter((region) => region.kind).map((region) => ({ ...region, id: `light:${region.id}` })),
    ],
    grade: light.grade,
    sun: light.sun,
    lightning: null,
  };
};

// CSS filter string for a grade
export const gradeFilter = (grade) => {
  const { saturate = 1, brightness = 1, contrast = 1, sepia = 0, blur = 0 } = grade;
  return `saturate(${saturate}) brightness(${brightness}) contrast(${contrast}) sepia(${sepia})${blur ? ` blur(${blur}px)` : ''}`;
};

// Dev-only sanity checks so a typo in sceneEffects.js shows up in the console, not as a broken scene
export const validateSceneEffects = (configs, sceneUrls) => {
  Object.entries(configs).forEach(([name, config]) => {
    const warn = (message) => console.warn(`[effects] "${name}": ${message}`);
    if (!sceneUrls[name]) warn('is not a scene in scenes.js');
    if (!['static', 'continuous'].includes(config.tier)) warn(`unknown tier "${config.tier}"`);
    (config.offer || []).forEach((id) => { if (!effectPresets[id]) warn(`offers unknown preset "${id}"`); });
    if (!config.offer?.length) warn('offers no presets');
    if (!config.regions?.length) warn('has no regions');
    (config.regions || []).forEach((region) => {
      if (!region.mask) return;
      if (config.tier !== 'static') warn(`region "${region.id}" has a mask but only static scenes can use masks`);
      const valid = region.mask.length >= 3
        && region.mask.every((p) => p.length === 2 && p.every((n) => n >= 0 && n <= 1));
      if (!valid) warn(`region "${region.id}" mask needs 3+ points with x and y between 0 and 1`);
    });
    (config.offer || []).forEach((id) => {
      if (effectPresets[id]?.grade?.glow && !config.sun) warn(`offers "${id}" but has no sun`);
    });
    (config.regions || []).forEach((region) => {
      if ((region.lights || region.ground) && config.tier !== 'static') {
        warn(`region "${region.id}" has lights or ground but only static scenes can use them`);
      }
    });
  });
};
