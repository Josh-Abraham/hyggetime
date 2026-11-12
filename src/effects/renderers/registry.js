import { createCanvasRenderer } from './canvasParticles';
import { createGlassRenderer } from './glassRain';

// Picks the renderer for a region. Rain on train glass has its own (glassRain.js); a WebGL renderer
// would also register here for specific kinds, with canvas as the fallback when
// WebGL is unavailable, so adding one never replaces the canvas implementation.
//
// A renderer is a factory taking a <canvas> and returning
//   { setParams, resize, setPlaying, destroy }
// See canvasParticles.js for the contract.
const renderers = { glass: createGlassRenderer };

export const createRenderer = (canvas, kind) => (renderers[kind] || createCanvasRenderer)(canvas);

export { blendFor } from './canvasParticles';
