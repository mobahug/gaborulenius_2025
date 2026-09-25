import {
  clamp,
  keyframes,
  range,
  smoothstep,
  splineKeyframes,
  type Keyframe,
} from "../math";
import {
  GLIDE_POSE,
  blendPose,
  flapPose,
  type BirdState,
  type BirdTransform,
  type Camera,
  type Vec3,
} from "./birdRig";

/**
 * The bird's approach in the portal. The path is authored as waypoints in
 * screen space (fractions of the viewport) plus the distance from the camera
 * in centimetres, then lifted into 3D, so heading, banking and perspective
 * all follow from one path: it comes out of the light shaft, swings left,
 * turns back across the clearing and passes just over the lens.
 */
type Waypoint = readonly [at: number, x: number, y: number, distance: number];

const WAYPOINTS: readonly Waypoint[] = [
  [0.0, 0.53, 0.1, 1150],
  [0.05, 0.505, 0.16, 900],
  [0.11, 0.445, 0.24, 680],
  [0.17, 0.385, 0.31, 510],
  [0.225, 0.36, 0.36, 385],
  [0.275, 0.43, 0.385, 295],
  [0.315, 0.53, 0.35, 225],
  [0.345, 0.56, 0.27, 165],
  [0.37, 0.5, 0.13, 105],
  [0.39, 0.37, -0.08, 56],
  [0.41, 0.2, -0.4, 28],
];

const X_KEYS: Keyframe[] = WAYPOINTS.map(([at, x]) => [at, x]);
const Y_KEYS: Keyframe[] = WAYPOINTS.map(([at, , y]) => [at, y]);
const DISTANCE_KEYS: Keyframe[] = WAYPOINTS.map(([at, , , distance]) => [
  at,
  Math.log(distance),
]);

/** The bird has left the frame (over the camera) by this progress. */
export const FLIGHT_END = 0.415;

/** Flapping (1) and gliding (0): bursts of wingbeats with glides between. */
const FLAPPING: Keyframe[] = [
  [0, 1],
  [0.095, 1],
  [0.115, 0],
  [0.145, 0],
  [0.165, 1],
  [0.232, 1],
  [0.25, 0],
  [0.285, 0],
  [0.3, 1],
  [0.5, 1],
];

/** Wingbeats per unit of progress: fast and small far away, slower close up. */
const BEAT_RATE: Keyframe[] = [
  [0, 64],
  [0.2, 50],
  [0.32, 36],
  [0.42, 30],
];

// The wingbeat phase is the integral of rate × flapping, so it slows into a
// glide and picks up again without jumps; it is tabulated once.
const PHASE_STEP = 0.0005;
const PHASE_END = 0.5;
const PHASE_TABLE = (() => {
  const count = Math.ceil(PHASE_END / PHASE_STEP) + 1;
  const table = new Float64Array(count);
  for (let index = 1; index < count; index += 1) {
    const at = (index - 0.5) * PHASE_STEP;
    table[index] =
      table[index - 1] +
      keyframes(at, BEAT_RATE) * keyframes(at, FLAPPING) * PHASE_STEP;
  }
  // Nudge the last beats so the bird is mid-downstroke as it passes over the
  // lens and its near wing sweeps down into the frame.
  const passIndex = Math.round(0.372 / PHASE_STEP);
  const offset = (1.34 - (table[passIndex] % 1)) % 1;
  for (let index = 0; index < count; index += 1) {
    table[index] += offset * smoothstep(0.3, 0.372, index * PHASE_STEP);
  }
  return table;
})();

export const flapPhase = (progress: number) => {
  const position = clamp(progress, 0, PHASE_END) / PHASE_STEP;
  const index = Math.min(Math.floor(position), PHASE_TABLE.length - 2);
  const t = position - index;
  return PHASE_TABLE[index] * (1 - t) + PHASE_TABLE[index + 1] * t;
};

export const createFlightCamera = (vw: number, vh: number): Camera => ({
  focal: 0.62 * Math.max(vw, vh),
  centreX: vw / 2,
  centreY: vh / 2,
});

const positionAt = (
  progress: number,
  camera: Camera,
  vw: number,
  vh: number,
): Vec3 => {
  const depth = Math.exp(splineKeyframes(progress, DISTANCE_KEYS));
  const x = splineKeyframes(progress, X_KEYS) * vw;
  const y = splineKeyframes(progress, Y_KEYS) * vh;
  return [
    ((x - camera.centreX) * depth) / camera.focal,
    ((camera.centreY - y) * depth) / camera.focal,
    depth,
  ];
};

const headingAt = (
  progress: number,
  camera: Camera,
  vw: number,
  vh: number,
): Vec3 => {
  const step = 0.004;
  const ahead = positionAt(Math.min(progress + step, 0.5), camera, vw, vh);
  const behind = positionAt(Math.max(progress - step, 0), camera, vw, vh);
  return [ahead[0] - behind[0], ahead[1] - behind[1], ahead[2] - behind[2]];
};

const yawAt = (progress: number, camera: Camera, vw: number, vh: number) => {
  const [x, , z] = headingAt(progress, camera, vw, vh);
  return Math.atan2(x, -z);
};

export type FlightFrame = {
  state: BirdState;
  transform: BirdTransform;
  camera: Camera;
  phase: number;
  /** 0–1: how much the bird is flapping rather than gliding. */
  flapping: number;
  opacity: number;
  /** Strength of the halo of back light (strongest in the light shaft). */
  glow: number;
};

/**
 * The bird for a portal progress. `rest` (0–1) eases the wings into a glide
 * when the page has stopped scrolling, so a paused frame never freezes the
 * bird mid-flap.
 */
export const flightAt = (
  progress: number,
  vw: number,
  vh: number,
  rest = 0,
): FlightFrame => {
  const camera = createFlightCamera(vw, vh);
  const position = positionAt(progress, camera, vw, vh);
  const heading = headingAt(progress, camera, vw, vh);

  // Bank into turns: roll follows the rate of change of the heading.
  const window = 0.02;
  const turn =
    (yawAt(Math.min(progress + window, 0.5), camera, vw, vh) -
      yawAt(Math.max(progress - window, 0), camera, vw, vh)) /
    (2 * window);
  const bank = clamp(turn * 0.045, -0.55, 0.55);

  const phase = flapPhase(progress);
  const settle = rest * (1 - smoothstep(0.3, 0.34, progress));
  const flapping = keyframes(progress, FLAPPING) * (1 - settle);
  const pose = blendPose(GLIDE_POSE, flapPose(phase), flapping);
  const braking = smoothstep(0.32, 0.38, progress);

  return {
    state: {
      pose,
      tailSpread: clamp(0.3 + 0.5 * braking + 0.35 * Math.abs(bank)),
      tailPitch: -5 * braking,
      bob: -1.1 * Math.sin(2 * Math.PI * phase) * flapping,
    },
    transform: {
      position,
      forward: heading,
      bank,
      pitch: 0.1 * (1 - flapping) + 0.12 * braking,
    },
    camera,
    phase,
    flapping,
    opacity:
      range(progress, 0, 0.03) * (1 - range(progress, 0.395, FLIGHT_END)),
    glow: 0.25 + 0.75 * (1 - smoothstep(0.08, 0.3, progress)),
  };
};
