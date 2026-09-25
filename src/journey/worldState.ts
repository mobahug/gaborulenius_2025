/**
 * Parameters of the fixed background stage. Every chapter owns the
 * transition *into* its world and writes clamped values from its own scroll
 * progress on every frame, so the combined state is a pure function of the
 * scroll position.
 */
export type WorldState = {
  /** 0–1 position in the jungle walk video. */
  video: number;
  /** 0–1 dusk falling over the jungle before the portal. */
  dusk: number;
  /** 0–1 progress of the wing wipe that replaces the jungle. */
  wipe: number;
  /** 0–1 presence of the "strange jungle" (the video frame re-lit in the shader). */
  strange: number;
  /** 0–1 visibility of the bird's head close-up (drawn in the shader). */
  head: number;
  /** Eye centre (CSS px from the viewport's top-left) and radius (CSS px). */
  eyeX: number;
  eyeY: number;
  eyeR: number;
  /** 0–1 visibility of the iris inside the eye. */
  iris: number;
  /** Pupil dilation; slightly negative constricts. */
  pupil: number;
  /** 0–1 flight through the pupil. */
  tunnel: number;
  /** 0–1 neural filaments replacing the strange jungle. */
  neural: number;
  /** Camera depth through the neural sheets. */
  depth: number;
  /** 0–1 neural filaments multiplying into topographic contours. */
  contour: number;
  /** Map pan in viewport-height units. */
  panX: number;
  panY: number;
  /** 0–1 contours stepping into orthogonal network routes. */
  network: number;
  /** 0–1 routes dissolving into drifting seeds. */
  seeds: number;
  /** 0–1 every line lying down into horizon strata. */
  horizon: number;
};

export const world: WorldState = {
  video: 0,
  dusk: 0,
  wipe: 0,
  strange: 0,
  head: 0,
  eyeX: 0,
  eyeY: 0,
  eyeR: 0,
  iris: 0,
  pupil: 0,
  tunnel: 0,
  neural: 0,
  depth: 0,
  contour: 0,
  panX: 0,
  panY: 0,
  network: 0,
  seeds: 0,
  horizon: 0,
};

/** Neural sheet depth at the end of the Neural Decompiler chapter; the map
 * plane of the Explorer continues from the sheet that is in focus here. */
export const NEURAL_DEPTH_END = 1 + 1 / 6;

/** True once any post-portal world has to be drawn. */
export const needsShaderWorld = () =>
  world.wipe > 0.0001 || world.strange > 0.0001 || world.neural > 0.0001;
