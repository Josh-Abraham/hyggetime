// Which scenes get weather effects, and where. Scenes with no entry here show no Effects control.
// This is configured by us; users only pick a preset by name.
//
// tier
//   'static'      fixed camera, one framing for the whole video. Allows window masks.
//   'continuous'  moving camera in one consistent outdoor world (walkthroughs, flyovers).
//                 Full-frame effects only: there is nothing for a mask to stay aligned to.
//
// offer     preset ids (see presets.js) this scene offers, in display order
// grade     optional { scope }. 'frame' (default) grades the whole picture; 'regions' grades only
//           inside each region's mask, which keeps a warm interior untouched while the window goes grey
// tuning    optional per-preset overrides for the whole scene, e.g. { heavyRain: { density: 0.7 } }
// aspect    video aspect ratio, default 16/9
// travel    optional { lean, glass } for a fixed camera inside a moving train: lean is how hard the
//           rain streams sideways (positive = rightward, with the scenery); glass: true draws the
//           rain as water pushed along the outside of the pane instead of falling
// glass     optional { density, size } for still windows: beads gather on the pane over the falling
//           rain and the heavy ones run down. density is relative to the preset's (default 0.6);
//           size scales the beads (default 1), smaller for glass further from the camera
// ground    optional { far, near } frame y (0 top, 1 bottom) where the farthest and the nearest
//           particles land. Far rain ending at the horizon instead of falling through the foreground
//           floor is one of the strongest depth cues. far is usually where the visible ground meets
//           the distance; near defaults to 1.05 (just below the frame). Regions can override it.
// regions   where the effect renders. Several are allowed (two windows, a doorway...)
//     id            label, used by the mask editor
//     mask          polygon [[x, y], ...] in 0-1 coordinates of the video frame; omit for the full frame
//     densityScale / particleScale / speedScale   multipliers on the preset for this region.
//                   Seen through glass, particles should be smaller and slower
//     blur          px of softness on the particles (distance haze)
//     feather       px (at 720p) of soft edge on the mask, default 8, so it melts into the frame
//     tuning        per-preset overrides for this region only
// sun       optional { at: [x, y], radius } where the sunlight comes from, in frame coordinates
//           (may sit just outside the frame); radius is a fraction of the frame height, default
//           0.35. Required by golden hour. On continuous scenes use a broad light from the top,
//           since it has to suit every shot
//   Static scenes can also describe what's in the picture, since the video itself can't be read:
//     lights        [{ at: [x, y], radius, color }] light sources in frame coordinates. Rain and
//                   snow show near them and fade away from them, which is how rain looks at night.
//                   radius is a fraction of the frame height (default 0.12)
//     lightFloor    0-1 visibility away from any light (default 0.35). Omit lights entirely for
//                   evenly lit daytime scenes
//
// To author or check an entry, use the dev authoring view (see AuthorView.js):
//   npm start, then /hyggetime/?author&t=<seconds>#scene=<Scene+Name>&effect=<presetId>
// It draws a 0-1 grid over the video frame and outlines this config, so coordinates are read
// straight off a screenshot. Check the framing at several timestamps before trusting a mask.
// One rectangular region per pane of a window with glazing bars
const panes = (prefix, columns, rows) => columns.flatMap(([x0, x1], c) => rows.map(([y0, y1], r) => ({
  id: `${prefix}${r + 1}${c + 1}`,
  mask: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]],
})));

// A rectangle with rounded corners (rx, ry in frame units), for windows like a train's
const roundedRect = ([x0, y0, x1, y1], rx, ry, steps = 4) => {
  const corners = [[x1 - rx, y0 + ry, -Math.PI / 2], [x1 - rx, y1 - ry, 0], [x0 + rx, y1 - ry, Math.PI / 2], [x0 + rx, y0 + ry, Math.PI]];
  return corners.flatMap(([cx, cy, start]) => Array.from({ length: steps + 1 }, (_, i) => {
    const angle = start + (i / steps) * (Math.PI / 2);
    return [+(cx + rx * Math.cos(angle)).toFixed(4), +(cy + ry * Math.sin(angle)).toFixed(4)];
  }));
};

// For flyovers: light presets keep their grade but lose their particles
const NO_DUST = { goldenHour: { kind: null }, winterGlow: { kind: null } };

export const sceneEffects = {
  // Fixed shot of a stream in an open forest, fully outdoors and evenly lit by daylight: rain or
  // leaves over the whole frame
  'Autumn Forest': {
    tier: 'static',
    offer: ['lightRain', 'heavyRain', 'thunderstorm', 'leaves'],
    // The far bank where the stream disappears into the trees
    ground: { far: 0.42 },
    regions: [{ id: 'full' }],
  },

  // Fixed shot from inside a library looking out through a tall arched window at a lamplit street,
  // with a second, narrower window beside it.
  // The video opens on a closer framing for its first seconds, then holds this wider one for the
  // rest of its 12 hours (traced from 1h56 and checked at 5h57). Weather only happens in the
  // window, so the room keeps its warm candlelit look. The mask follows the curve of the arch on
  // the right and runs just below the street, under the plants and jars on the sill.
  'Gothic Reading Nook': {
    tier: 'static',
    offer: ['lightRain', 'heavyRain', 'thunderstorm', 'snow'],
    grade: { scope: 'regions' },
    // The far side of the street, at the foot of the building; near rain lands on the sill
    ground: { far: 0.5, near: 0.8 },
    regions: [{
      id: 'window',
      mask: [
        [0.048, 0], [0.44, 0], [0.458, 0.089], [0.473, 0.189], [0.484, 0.3], [0.491, 0.422],
        [0.496, 0.556], [0.498, 0.596], [0.481, 0.629], [0.431, 0.638], [0.381, 0.649],
        [0.344, 0.667], [0.3, 0.693], [0.225, 0.722], [0.15, 0.74], [0.048, 0.751],
      ],
      densityScale: 1.8,
      particleScale: 0.9,
      speedScale: 0.85,
      blur: 0.3,
      feather: 10,
      // Street lamps, and the lit doorway and windows of the building across the street
      lights: [
        { at: [0.171, 0.356], radius: 0.12 },
        { at: [0.206, 0.378], radius: 0.1 },
        { at: [0.24, 0.4], radius: 0.09 },
        { at: [0.278, 0.407], radius: 0.07 },
        { at: [0.315, 0.422], radius: 0.09 },
        { at: [0.37, 0.433], radius: 0.07 },
        { at: [0.406, 0.4], radius: 0.07 },
      ],
      lightFloor: 0.55,
    },
    // The second, narrower window to the right of the arch: two pointed lancets split by a stone
    // mullion, one region each so no rain falls on the stone. It looks onto trees, with no lamps,
    // and is further from the camera, so smaller drops and a tighter feather for the thin panes.
    ...[
      ['lancetLeft', [[0.571, 0.529], [0.571, 0.178], [0.579, 0.122], [0.593, 0.089], [0.61, 0.078], [0.611, 0.529]]],
      ['lancetRight', [[0.623, 0.529], [0.623, 0.078], [0.638, 0.089], [0.65, 0.122], [0.658, 0.178], [0.659, 0.529]]],
    ].map(([id, mask]) => ({
      id,
      mask,
      densityScale: 1.8,
      particleScale: 0.7,
      speedScale: 0.85,
      blur: 0.3,
      feather: 4,
    }))],
  },

  // ---- Window scenes: fixed camera, weather only in the openings ----

  // Greenhouse-style window on the right, traced under the hanging dried flowers and above the jars
  // on the sill, plus the smaller window behind the herbs left of the dark post. The video already
  // has its own drifting petals, so no leaves.
  "Autumn Witch's Apothecary": {
    tier: 'static',
    offer: ['lightRain', 'heavyRain', 'thunderstorm'],
    grade: { scope: 'regions' },
    // Beads gather on the pane and run down it, over the rain falling outside
    glass: { density: 1 },
    ground: { far: 0.45, near: 0.6 },
    // A storm outside dims the candlelit room too
    tuning: {
      heavyRain: { grade: { room: 0.2 } },
      thunderstorm: { grade: { room: 0.28 } },
    },
    regions: [{
      // Front window: under the hanging herbs at the top, then down to the shelf, stepping around
      // the flower bunch, the bottle, the figure and both jars
      id: 'window',
      mask: [
        [0.7688, 0.3], [0.825, 0.3], [0.875, 0.267], [0.9, 0.189], [0.9125, 0.089], [0.944, 0.033],
        [1, 0.011], [1, 0.6033], [0.9641, 0.6033], [0.9641, 0.5311], [0.9609, 0.5267], [0.9297, 0.5267],
        [0.9266, 0.5339], [0.9266, 0.6061], [0.9203, 0.6061], [0.9203, 0.5311], [0.9172, 0.5256],
        [0.8891, 0.5256], [0.8866, 0.5311], [0.8866, 0.57], [0.8797, 0.57], [0.8788, 0.5256],
        [0.8719, 0.5256], [0.8713, 0.57], [0.8663, 0.5767], [0.8656, 0.6033], [0.8631, 0.6033],
        [0.8631, 0.5339], [0.8578, 0.53], [0.8516, 0.5339], [0.8531, 0.5172], [0.8688, 0.5117],
        [0.8781, 0.4811], [0.875, 0.4589], [0.8438, 0.4478], [0.825, 0.4433], [0.8063, 0.4578],
        [0.7938, 0.4811], [0.7922, 0.5089], [0.7969, 0.5339], [0.8031, 0.5644], [0.8038, 0.595],
        [0.7828, 0.595], [0.7828, 0.5489], [0.7688, 0.5467],
      ],
      densityScale: 1.6,
      particleScale: 0.85,
      speedScale: 0.85,
      feather: 3,
    }, {
      // The garden showing under the right end of the table
      id: 'underTable',
      mask: [[0.9938, 0.6311], [1, 0.6311], [1, 0.7478], [0.9703, 0.7478], [0.9725, 0.6589], [0.9875, 0.6422]],
      densityScale: 1.6,
      particleScale: 0.85,
      speedScale: 0.85,
      feather: 3,
    }, {
      // Back window: below the lantern it widens to its bright left side, and runs down to the
      // sill around the candles standing in front of it
      id: 'backWindow',
      mask: [
        [0.658, 0.24], [0.7138, 0.22], [0.7138, 0.4733], [0.7063, 0.4733], [0.7063, 0.52], [0.6963, 0.52],
        [0.6963, 0.4556], [0.6788, 0.4556], [0.6788, 0.52], [0.6638, 0.52], [0.663, 0.4489], [0.6363, 0.4422],
        [0.6363, 0.32], [0.658, 0.3169],
      ],
      densityScale: 1.6,
      particleScale: 0.7,
      speedScale: 0.85,
      feather: 3,
    }],
  },

  // Night storefront: two big panes, two corner panes and the door glass, each its own region so
  // the mullions stay clear; the tops sit below the string-light bulbs. Autumn trees outside, so leaves fit too.
  'Fall Coffee Shop': {
    tier: 'static',
    offer: ['lightRain', 'heavyRain', 'thunderstorm', 'leaves'],
    // Beads gather on the glass and run down it, over the rain falling outside
    glass: { density: 1, size: 0.7 },
    grade: { scope: 'regions' },
    ground: { far: 0.55, near: 0.7 },
    regions: [
      // The panes run up to just under the string lights, so the top edge follows the bulbs
      ['leftPane', [[0.24, 0.32], [0.27, 0.3333], [0.2875, 0.3449], [0.3125, 0.3449], [0.335, 0.3467],
        [0.36, 0.3449], [0.3825, 0.3307], [0.3925, 0.3244], [0.3925, 0.6], [0.24, 0.6]]],
      // The strip of glass above the string lights, between the window frame and the bulbs
      ['leftTop', [[0.24, 0.3089], [0.3909, 0.3089], [0.3909, 0.3145], [0.38, 0.3156], [0.3606, 0.3278],
        [0.3353, 0.33], [0.3119, 0.33], [0.2878, 0.3278], [0.2738, 0.3178], [0.24, 0.3145]]],
      // Narrow strip on the left window's right side, split at its glazing bar
      ['leftStrip', [[0.4035, 0.3389], [0.4119, 0.3389], [0.4119, 0.4156], [0.4035, 0.4156]]],
      ['leftStripLow', [[0.4035, 0.4333], [0.4119, 0.4333], [0.4119, 0.6861], [0.4035, 0.6861]]],
      ['leftCorner', [[0.19, 0.33], [0.232, 0.33], [0.232, 0.68], [0.19, 0.68]]],
      ['door', [[0.47, 0.44], [0.525, 0.44], [0.525, 0.68], [0.47, 0.68]]],
      // Transom over the door, in two parts either side of the sagging string of bulbs
      ['transomTop', [[0.4563, 0.2784], [0.5375, 0.2784], [0.5375, 0.3256], [0.5263, 0.3282], [0.51, 0.3344],
        [0.4925, 0.3389], [0.4775, 0.3353], [0.4605, 0.3282], [0.4563, 0.3291]]],
      ['transom', [[0.456, 0.345], [0.492, 0.365], [0.525, 0.355], [0.537, 0.335], [0.537, 0.398], [0.456, 0.398]]],
      // Right window, split pane by pane so no rain falls on the glazing bars, the counter or the
      // things standing on it. Upper row under the string lights, then the big pane down to the
      // counter, stepping around the plant and the candle jar
      // Above the string lights, stepping under the hanging lamp shade
      ['rightTop', [[0.5856, 0.3123], [0.6731, 0.3123], [0.6778, 0.32], [0.7075, 0.32], [0.7122, 0.3123],
        [0.7644, 0.3123], [0.7644, 0.32], [0.7519, 0.3212], [0.7272, 0.3345], [0.6934, 0.3412],
        [0.6669, 0.3401], [0.6356, 0.3289], [0.6013, 0.3256], [0.5919, 0.3267], [0.5856, 0.3156]]],
      ['rightStrip', [[0.586, 0.345], [0.5975, 0.345], [0.5975, 0.4233], [0.586, 0.4233]]],
      ['rightStripLow', [[0.586, 0.4361], [0.5975, 0.4361], [0.5975, 0.7444], [0.586, 0.7444]]],
      ['rightUpperLeft', [[0.6125, 0.3472], [0.6375, 0.3472], [0.6531, 0.3528], [0.6688, 0.36], [0.686, 0.36],
        [0.686, 0.4233], [0.6125, 0.4233]]],
      ['rightUpperRight', [[0.6922, 0.36], [0.7094, 0.36], [0.7272, 0.3556], [0.7406, 0.3472], [0.7522, 0.34],
        [0.7663, 0.3361], [0.7663, 0.4233], [0.6922, 0.4233]]],
      ['rightPane', [[0.6125, 0.4361], [0.7663, 0.4361], [0.7663, 0.6195], [0.7494, 0.6195], [0.7494, 0.5989],
        [0.7381, 0.5989], [0.7381, 0.6195], [0.6844, 0.6195], [0.6844, 0.6128], [0.6531, 0.6128],
        [0.6531, 0.6195], [0.6344, 0.6195], [0.6344, 0.5917], [0.6219, 0.5917], [0.6219, 0.6195],
        [0.6125, 0.6195]]],
      // Below the counter: the street under its top, down around the two stools
      ['rightUnderCounter', [[0.6125, 0.6322], [0.7438, 0.6322], [0.7438, 0.6567], [0.736, 0.66], [0.7016, 0.66],
        [0.6766, 0.6628], [0.6422, 0.6656], [0.6391, 0.6889], [0.636, 0.7083], [0.6141, 0.7083]]],
      ['rightUnderCounterEnd', [[0.7569, 0.6322], [0.7656, 0.6322], [0.7656, 0.6917], [0.7569, 0.6917]]],
      // Corner window: two slim upper panes and a sliver above the bulb, then the tall lower pane,
      // which narrows where the cabinet stands in front of it
      ['rightCornerSliver', [[0.7809, 0.3139], [0.7934, 0.3139], [0.7934, 0.3278], [0.7809, 0.3278]]],
      ['rightCornerUpperLeft', [[0.7794, 0.3444], [0.7959, 0.3444], [0.7959, 0.4183], [0.7794, 0.4239]]],
      ['rightCornerUpperRight', [[0.8019, 0.3306], [0.8131, 0.3306], [0.8131, 0.4178], [0.8019, 0.4178]]],
      ['rightCorner', [[0.7794, 0.4389], [0.8131, 0.4267], [0.8131, 0.6394], [0.8019, 0.6394], [0.8019, 0.72],
        [0.7794, 0.72]]],
    ].map(([id, mask]) => ({ id, mask, densityScale: 1.8, particleScale: 0.75, speedScale: 0.85, feather: 4 })),
  },

  // Moonlit glazed double doors behind the sofa: one region per door leaf, plus the arched
  // fanlight above them
  'Halloween Party': {
    tier: 'static',
    offer: ['lightRain', 'heavyRain', 'thunderstorm'],
    // Beads gather on the glass and run down it, over the rain falling outside
    glass: { density: 1 },
    grade: { scope: 'regions' },
    regions: [
      // Left leaf: up under the bunting, and below the mantel shelf it widens to the leaf's left
      // column, down beside the flower arrangement
      ['doorLeft', [[0.3831, 0.2722], [0.4006, 0.2722], [0.4006, 0.2833], [0.405, 0.2833], [0.405, 0.5917],
        [0.3888, 0.5917], [0.3888, 0.6611], [0.3756, 0.6611], [0.3756, 0.4333], [0.3831, 0.4333]]],
      ['doorLeftLow', [[0.4006, 0.6278], [0.405, 0.6278], [0.405, 0.6611], [0.4006, 0.6611]]],
      // The mantel and its garland stand in front of the fanlight's lower left
      ['fanlight', [[0.3625, 0.1694], [0.3625, 0.15], [0.377, 0.133], [0.408, 0.124], [0.4375, 0.133], [0.456, 0.162],
        [0.456, 0.236], [0.3841, 0.236], [0.3841, 0.1694]]],
      // Right leaf: down to the top of the flowers, stepping in where the ghost stands in front
      ['doorRight', [[0.4231, 0.2822], [0.455, 0.2822], [0.455, 0.4889], [0.4481, 0.4889], [0.4481, 0.5456],
        [0.4231, 0.5456]]],
    ].map(([id, mask]) => ({ id, mask, densityScale: 2, particleScale: 0.7, speedScale: 0.85, feather: 3 })),
  },

  // Arched window over the table; the video already rains outside it, so only lightning
  "Witch's Kitchen": {
    tier: 'static',
    offer: ['lightning'],
    grade: { scope: 'regions' },
    regions: [{
      id: 'window',
      mask: [[0.538, 0.15], [0.56, 0.11], [0.6, 0.09], [0.65, 0.095], [0.69, 0.13], [0.694, 0.467], [0.538, 0.467]],
      feather: 5,
    }],
  },

  // Open stone arch onto the balcony and the castle; the video already rains, so only lightning.
  // A storm with lightning is darker than the video's steady rain, so the whole scene dims a little
  'Rainy Castle': {
    tier: 'static',
    offer: ['lightning'],
    tuning: {
      lightning: {
        grade: { saturate: 0.85, brightness: 0.8, contrast: 1.02, tint: '#62758c', tintOpacity: 0.12, skyDarken: 0.22 },
      },
    },
    regions: [{
      id: 'arch',
      mask: [
        [0.18, 0.78], [0.18, 0.25], [0.21, 0.12], [0.26, 0.04], [0.33, 0], [0.4, 0], [0.47, 0.04],
        [0.52, 0.13], [0.545, 0.25], [0.545, 0.72], [0.42, 0.73],
      ],
      feather: 8,
    }],
  },

  // Two sash windows onto the sea, inside the curtains. Each pane is its own region so the wooden
  // bars stay in front of the rain; rain drawn across the bars reads as falling inside the room.
  // panes(columns, rows) takes the glass edges between bars as [start, end] pairs in frame coordinates
  // Fixed camera inside a moving carriage: the window masks hold, but the rain streams past the
  // glass instead of falling. The scenery runs left to right, so the rain does too
  'Train Ride': {
    tier: 'static',
    offer: ['lightRain', 'heavyRain', 'thunderstorm'],
    // glass: rain shows as water running along the outside of the pane instead of falling
    travel: { lean: 1.1, glass: true },
    grade: {
      scope: 'regions',
      // Whole windows plus a little of their frames, so no bright rim of glass stays ungraded
      areas: [
        roundedRect([0.25, 0.119, 0.7255, 0.7175], 0.03, 0.053),
        [[-0.03, 0.125], [0.088, 0.125], [0.104, 0.137], [0.112, 0.166], [0.112, 0.437], [-0.03, 0.437]],
        [[0.866, 0.176], [0.873, 0.148], [0.893, 0.132], [1.03, 0.132], [1.03, 0.445], [0.866, 0.445]],
      ],
    },
    tuning: {
      lightRain: { grade: { blur: 0.6 } },
      heavyRain: { grade: { room: 0.14, blur: 1.6 } },
      thunderstorm: { grade: { room: 0.22, blur: 1.8 } },
    },
    // The rain streams on past the bottom of the glass rather than landing on a ground line
    ground: { far: 1.05, near: 1.1 },
    regions: [
      { id: 'window', mask: roundedRect([0.256, 0.1255, 0.7195, 0.711], 0.026, 0.046) },
      { id: 'leftWindow', mask: [[0, 0.1316], [0.085, 0.1316], [0.1, 0.1422], [0.1065, 0.1689], [0.1065, 0.4311],
        [0.0625, 0.4223], [0.0475, 0.3983], [0.04, 0.3911], [0.0375, 0.3467], [0.0275, 0.3307], [0.0125, 0.3218], [0, 0.32]] },
      { id: 'rightWindow', mask: [[0.871, 0.1778], [0.8775, 0.1511], [0.895, 0.1387], [1, 0.1387], [1, 0.3422],
        [0.985, 0.3511], [0.976, 0.3733], [0.974, 0.416], [0.88, 0.4356], [0.871, 0.44]] },
    // Fewer, slower drops than other windows: streaming sideways, each one covers far more glass
    ].map((region) => ({ ...region, densityScale: 0.8, particleScale: 0.7, speedScale: 0.6, feather: 1 })),
  },
  // Same idea as Train Ride: a fixed camera in a moving compartment, the hills running left to
  // right past the window. Four small top lights over one big pane, all in perspective
  'Hogwarts Express': {
    tier: 'static',
    offer: ['lightRain', 'heavyRain', 'thunderstorm', 'dementors'],
    travel: { lean: 0.9, glass: true },
    grade: {
      scope: 'regions',
      // The whole window and a little of its frame. Not cut around the owl cage: the glass shows
      // between its wires, and left ungraded it stood out as a pale dome. Only the rain steps
      // around the cage, so no beads sit on the wires
      areas: [[[0.1456, 0.0644], [0.5894, 0.1511], [0.5894, 0.4844], [0.5675, 0.5289], [0.2831, 0.5489],
        [0.18, 0.5533], [0.1644, 0.5289]]],
    },
    tuning: {
      lightRain: { grade: { blur: 0.6 } },
      // Darker than the preset: a sunlit glen outside reads as a passing shower, not a downpour
      heavyRain: { grade: { room: 0.2, blur: 1.6, brightness: 0.66 } },
      thunderstorm: { grade: { room: 0.26, blur: 1.8, brightness: 0.6 } },
    },
    ground: { far: 1.05, near: 1.1 },
    regions: [
      { id: 'top1', mask: [[0.15, 0.0756], [0.2863, 0.1011], [0.2881, 0.2344], [0.1581, 0.2311]] },
      { id: 'top2', mask: [[0.2956, 0.1089], [0.3988, 0.1256], [0.3988, 0.2456], [0.2956, 0.2378]] },
      { id: 'top3', mask: [[0.4094, 0.1311], [0.4975, 0.1467], [0.4975, 0.2567], [0.4094, 0.2489]] },
      { id: 'top4', mask: [[0.5038, 0.1478], [0.5825, 0.1589], [0.5813, 0.2678], [0.5038, 0.26]] },
      { id: 'pane', mask: [[0.1644, 0.2589], [0.5813, 0.2933], [0.5806, 0.4756], [0.575, 0.4978], [0.5644, 0.5133],
        [0.2788, 0.5367], [0.2717, 0.5359], [0.2675, 0.5304], [0.255, 0.5137], [0.2404, 0.5037], [0.2269, 0.5015],
        [0.2263, 0.4926], [0.2233, 0.4926], [0.2227, 0.5015], [0.2113, 0.5044], [0.1988, 0.5156], [0.1894, 0.5341], [0.1863, 0.5422], [0.175, 0.5311], [0.1688, 0.5067]] },
    ].map((region) => ({ ...region, densityScale: 0.8, particleScale: 0.7, speedScale: 0.6, feather: 1 })),
  },
  'Stormy Night by the Sea': {
    tier: 'static',
    offer: ['lightRain', 'heavyRain', 'thunderstorm'],
    // Beads gather on the glass and run down it, over the rain falling outside
    glass: { density: 0.5 },
    // Graded as whole windows, bars included, while the rain stays inside each pane: graded
    // pane by pane, the thin glass left at every pane edge showed as a bright outline
    grade: {
      scope: 'regions',
      areas: [
        // Both shapes overlap the surrounding frame generously: darkening the dark frame shows
        // nothing, but any glass or lit frame edge left outside them shows as a light line
        [[0.6082, 0.2758], [0.7269, 0.271], [0.728, 0.3956], [0.7321, 0.4978], [0.7363, 0.6181], [0.7403, 0.7143],
          [0.6061, 0.7143], [0.6069, 0.5144], [0.6086, 0.4011]],
        // Runs past the right edge of the picture, so its soft edge doesn't leave a bright sliver there
        [[0.8868, 0.214], [0.9494, 0.1907], [1.03, 0.1613], [1.03, 0.781], [0.9625, 0.771], [0.8915, 0.7616],
          [0.8893, 0.5122], [0.8868, 0.3717]],
      ],
    },
    ground: { far: 0.6, near: 0.76 },
    // Through glass at night the veil of distant rain just greys out the dark sea
    tuning: { heavyRain: { sheet: 0.15 }, thunderstorm: { sheet: 0.18 } },
    // One region per pane, traced corner by corner right up to the glazing bars, with almost no
    // soft edge: a blurred edge reads as rain drawn on top of the bars rather than falling behind
    // them. Both windows are slightly askew, so every pane is its own quadrilateral
    regions: [
      ...[
        ['left11', [[0.6142, 0.2848], [0.6694, 0.2822], [0.6696, 0.3967], [0.6146, 0.3978]]],
        ['left12', [[0.6713, 0.2822], [0.7229, 0.28], [0.724, 0.3956], [0.6715, 0.3967]]],
        ['left21', [[0.6146, 0.4011], [0.6696, 0.4], [0.6698, 0.4992], [0.6129, 0.5007]]],
        ['left22', [[0.6713, 0.4], [0.7246, 0.3989], [0.7281, 0.4978], [0.6713, 0.4992]]],
        ['left31', [[0.6129, 0.5144], [0.6688, 0.5137], [0.6696, 0.6172], [0.6125, 0.6163]]],
        ['left32', [[0.6704, 0.5137], [0.7292, 0.5126], [0.7323, 0.6181], [0.6713, 0.6172]]],
        ['left41', [[0.6125, 0.6204], [0.6696, 0.6213], [0.6698, 0.7083], [0.6121, 0.7083]]],
        ['left42', [[0.6713, 0.6213], [0.7333, 0.6222], [0.7363, 0.7083], [0.6715, 0.7083]]],
      ].map(([id, mask]) => ({ id, mask })),
      // Right window, seen at an angle so its bars slope more
      ...[
        ['right11', [[0.8938, 0.23], [0.9494, 0.2067], [0.9494, 0.3533], [0.8938, 0.3633]]],
        ['right12', [[0.9547, 0.205], [1, 0.1883], [1, 0.3422], [0.9547, 0.3533]]],
        ['right21', [[0.8938, 0.3717], [0.95, 0.3606], [0.9522, 0.49], [0.8941, 0.4911]]],
        ['right22', [[0.9553, 0.3578], [1, 0.3494], [1, 0.4878], [0.9563, 0.4889]]],
        ['right31', [[0.8953, 0.5122], [0.9553, 0.5106], [0.9553, 0.6467], [0.8953, 0.6444]]],
        ['right32', [[0.9616, 0.51], [1, 0.5083], [1, 0.6522], [0.9616, 0.6483]]],
        ['right41', [[0.8956, 0.6533], [0.9556, 0.6556], [0.9563, 0.7639], [0.8975, 0.7556]]],
        ['right42', [[0.9622, 0.6567], [1, 0.6589], [1, 0.775], [0.9625, 0.765]]],
      ].map(([id, mask]) => ({ id, mask })),
    ].map((region) => ({ ...region, densityScale: 1.8, particleScale: 0.75, speedScale: 0.85, feather: 0.75 })),
  },

  // Tall leaded window on the right, above the desk. The dense leading sits in front of anything
  // drawn over the glass, so rain reads as being in the room; only lightning, which lights the glass
  'Hogwarts Library': {
    tier: 'static',
    offer: ['lightning'],
    regions: [{
      id: 'window',
      mask: [[0.822, 0.13], [0.84, 0.06], [0.88, 0.02], [0.94, 0], [1, 0], [1, 0.5], [0.822, 0.5]],
      feather: 5,
    }],
  },

  // The arched window at the far end of the aisle: two lancets with cusped heads either side of a
  // thin mullion, ending at the sill, and the tracery above them (a quatrefoil, two trefoils and
  // two small cusps). Floating books drift past in front of it now and then
  'Hogwarts Library 2': {
    tier: 'static',
    offer: ['lightRain', 'heavyRain', 'thunderstorm'],
    // Beads gather on the glass and run down it, over the rain falling outside
    glass: { density: 1 },
    grade: { scope: 'regions' },
    regions: [
      ['lancetLeft', [[0.4577, 0.615], [0.4577, 0.3363], [0.4608, 0.327], [0.4629, 0.3141], [0.4681, 0.3085], [0.4712, 0.3011], [0.4765, 0.2982], [0.4817, 0.3011], [0.4848, 0.3085], [0.49, 0.3141], [0.4931, 0.3252], [0.4952, 0.3363], [0.4952, 0.615]]],
      ['lancetRight', [[0.5035, 0.615], [0.5035, 0.3363], [0.5067, 0.3252], [0.5087, 0.3141], [0.5139, 0.3085], [0.5181, 0.3011], [0.5233, 0.2974], [0.5285, 0.3011], [0.5327, 0.3085], [0.5379, 0.3141], [0.541, 0.3252], [0.5431, 0.3363], [0.5431, 0.615]]],
      ['quatrefoil', [[0.4884, 0.2192], [0.4905, 0.2136], [0.4928, 0.2067], [0.4959, 0.2025], [0.4991, 0.2033], [0.5014, 0.2017], [0.5045, 0.2039], [0.5066, 0.2094], [0.5077, 0.2150], [0.5100, 0.2192], [0.5092, 0.2247], [0.5069, 0.2275], [0.5053, 0.2344], [0.5030, 0.2400], [0.4998, 0.2433], [0.4972, 0.2406], [0.4952, 0.2344], [0.4928, 0.2289], [0.4897, 0.2261]]],
      ['trefoilLeft', [[0.4733, 0.2428], [0.4780, 0.2392], [0.4827, 0.2400], [0.4863, 0.2450], [0.4884, 0.2517], [0.4909, 0.2608], [0.4931, 0.2720], [0.4944, 0.2845], [0.4947, 0.2983], [0.4931, 0.3000], [0.4889, 0.2950], [0.4847, 0.2900], [0.4806, 0.2850], [0.4775, 0.2795], [0.4744, 0.2733], [0.4733, 0.2672], [0.4722, 0.2608], [0.4717, 0.2539], [0.4722, 0.2469]]],
      ['trefoilRight', [[0.5162, 0.2400], [0.5209, 0.2386], [0.5252, 0.2417], [0.5269, 0.2489], [0.5275, 0.2567], [0.5261, 0.2636], [0.5264, 0.2706], [0.5238, 0.2767], [0.5202, 0.2822], [0.5159, 0.2872], [0.5116, 0.2917], [0.5077, 0.2961], [0.5050, 0.3000], [0.5042, 0.2872], [0.5053, 0.2733], [0.5075, 0.2622], [0.5100, 0.2525], [0.5128, 0.2450]]],
      ['cuspLeft', [[0.4655, 0.2761], [0.4675, 0.2858], [0.4666, 0.2942], [0.4606, 0.2950]]],
      ['cuspRight', [[0.5331, 0.2739], [0.5397, 0.2950], [0.5350, 0.2945], [0.5319, 0.2845]]],
    ].map(([id, mask]) => ({ id, mask, densityScale: 2.4, particleScale: 0.55, speedScale: 0.8, feather: 2 })),
  },

  // ---- Full-frame scenes: fixed camera, fully outdoors ----

  // Sunny autumn day: rain would fight the sunlight, but falling leaves fit. Backlit by a sun
  // behind the castle, which golden hour deepens
  'Peaceful Autumn Day At Hogwarts': {
    tier: 'static',
    offer: ['goldenHour', 'leaves'],
    sun: { at: [0.62, 0.12], radius: 0.4 },
    ground: { far: 0.62 },
    regions: [{ id: 'full' }],
  },

  // Porch at night: rain in front of a covered porch looks wrong, but leaves falling in the yard work
  'Nighttime Porch': {
    tier: 'static',
    offer: ['leaves'],
    regions: [{ id: 'full' }],
  },

  // Bag End's garden: a spring shower, or the evening sun from the open sky at top left
  'The Shire (Hobbiton)': {
    tier: 'static',
    offer: ['goldenHour', 'lightRain', 'heavyRain'],
    sun: { at: [0.04, 0.05], radius: 0.45 },
    ground: { far: 0.62 },
    regions: [{ id: 'full' }],
  },

  // Covered patio looking out at a sunlit garden and waterfall. The roof rules out weather, but
  // late sun streaming in under it, with dust in the light, fits
  // Fixed shot of a midday beach under palm fronds. Golden hour only, tuned rich and moody, since
  // a light grade just looks like the midday original. No dust, which doesn't belong over open sea air
  'Tropical Beach': {
    tier: 'static',
    offer: ['goldenHour'],
    // Low over the open sea on the right, clear of the palm fronds, so the glow warms the pale
    // sky and lays a sheen on the water
    sun: { at: [0.85, 0.38], radius: 0.6 },
    tuning: {
      goldenHour: {
        kind: null,
        // Rich and moody: darker and contrasty, a warm wash, the top of the sky deepened
        grade: {
          saturate: 1.06, brightness: 0.86, contrast: 1.16, sepia: 0.14, skyDarken: 0.12,
          tint: '#ffb070', tintOpacity: 0.12, glow: { color: '#ffa94d', strength: 0.65 },
        },
      },
    },
    regions: [{ id: 'full' }],
  },

  'Spring Cafe 2': {
    tier: 'static',
    offer: ['goldenHour'],
    sun: { at: [0.18, 0.25], radius: 0.45 },
    regions: [{ id: 'full' }],
  },

  // Lamplit street at night
  'Diagon Alley Night': {
    tier: 'static',
    offer: ['lightRain', 'heavyRain', 'snow'],
    ground: { far: 0.62 },
    regions: [{ id: 'full' }],
  },

  // Snow-covered village with no falling snow of its own
  'Hogsmeade in Snow': {
    tier: 'static',
    offer: ['snow'],
    ground: { far: 0.55 },
    regions: [{ id: 'full' }],
  },

  // ---- Continuous scenes: cuts between outdoor shots, or walking outdoors. Full frame only ----

  // Bluebell woods in low spring sun, several shots of the same wood
  'English Forest': {
    tier: 'continuous',
    offer: ['goldenHour'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    regions: [{ id: 'full' }],
  },

  // Soft hazy daylight around the castle, outdoors throughout
  'Summer Day at Hogwarts': {
    tier: 'continuous',
    offer: ['goldenHour'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    regions: [{ id: 'full' }],
  },

  // Jungle waterfall in soft shade: late sun with dust in the light
  Waterfall: {
    tier: 'continuous',
    offer: ['goldenHour'],
    sun: { at: [0.75, -0.05], radius: 0.6 },
    regions: [{ id: 'full' }],
  },


  // Mountain lake shots in soft late light
  'Mountain View': {
    tier: 'continuous',
    offer: ['goldenHour'],
    sun: { at: [0.3, -0.05], radius: 0.6 },
    regions: [{ id: 'full' }],
  },

  // Hazy, backlit autumn valleys
  'Autumn at Hogwarts': {
    tier: 'continuous',
    offer: ['goldenHour', 'lightRain', 'heavyRain', 'thunderstorm', 'leaves'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    regions: [{ id: 'full' }],
  },

  // Misty autumn grounds
  'Fall Grounds at Hogwarts': {
    tier: 'continuous',
    offer: ['goldenHour', 'lightRain', 'heavyRain', 'thunderstorm', 'leaves'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    regions: [{ id: 'full' }],
  },

  // Conifer forest and valley shots, day and night
  'Hogwarts Forest': {
    tier: 'continuous',
    offer: ['lightRain', 'heavyRain', 'thunderstorm'],
    regions: [{ id: 'full' }],
  },

  // Frosty landscapes with no falling snow of their own, hazy and backlit, so the low winter sun
  // fits too
  'Calm Winter Day at Hogwarts': {
    tier: 'continuous',
    offer: ['snow', 'winterGlow'],
    sun: { at: [0.7, -0.05], radius: 0.6 },
    regions: [{ id: 'full' }],
  },

  // Real footage walking a snowy trail, outdoors throughout, nothing falling
  'Winter Forest Walkthrough': {
    tier: 'continuous',
    offer: ['snow'],
    regions: [{ id: 'full' }],
  },

  // Green spring shots around the grounds
  'Hogwarts Spring Walkthrough': {
    tier: 'continuous',
    offer: ['lightRain', 'heavyRain'],
    regions: [{ id: 'full' }],
  },

  // Overcast redwood shots: Pacific Northwest rain
  'Redwood Forest Soundscape': {
    tier: 'continuous',
    offer: ['lightRain', 'heavyRain'],
    regions: [{ id: 'full' }],
  },

  // ---- Drone flyovers: light only. Particles of any kind hanging in front of a camera flying
  // over a landscape look wrong, so golden hour and winter glow drop their dust here ----

  // Soft daylight over hills, valleys and coast: golden hour
  'Scottish Highlands': {
    tier: 'continuous',
    offer: ['goldenHour'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    tuning: NO_DUST,
    regions: [{ id: 'full' }],
  },
  'Switzerland and the Alps': {
    tier: 'continuous',
    offer: ['goldenHour'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    tuning: NO_DUST,
    regions: [{ id: 'full' }],
  },
  'Iceland Flyover': {
    tier: 'continuous',
    offer: ['goldenHour'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    tuning: NO_DUST,
    regions: [{ id: 'full' }],
  },
  'Norway Flyover': {
    tier: 'continuous',
    offer: ['goldenHour'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    tuning: NO_DUST,
    regions: [{ id: 'full' }],
  },
  'British Isles Flyover': {
    tier: 'continuous',
    offer: ['goldenHour'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    tuning: NO_DUST,
    regions: [{ id: 'full' }],
  },
  'Canada Flyover': {
    tier: 'continuous',
    offer: ['goldenHour'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    tuning: NO_DUST,
    regions: [{ id: 'full' }],
  },


  // Snowy forest and mountains under a pale sky: alpenglow
  'Winter Ambience Drone Flyover': {
    tier: 'continuous',
    offer: ['winterGlow'],
    sun: { at: [0.5, -0.05], radius: 0.6 },
    tuning: NO_DUST,
    regions: [{ id: 'full' }],
  },
};

export const getSceneEffects = (sceneName) => sceneEffects[sceneName] || null;
