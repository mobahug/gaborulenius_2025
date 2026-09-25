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
  createProjector,
  flapPose,
  type BirdState,
  type BirdTransform,
  type Camera,
  type Vec3,
  type WingPose,
} from "./birdRig";

/**
 * The bird's return at the end of the journey. It comes in over the
 * viewer's shoulder from the upper right, glides down across the clearing,
 * flares — wings high, tail fanned, body upright — and settles on the
 * branch facing the low sun, where it folds its wings. Everything is a
 * function of the finale's scroll progress, so it reverses cleanly.
 */

/** Screen offsets from the perch (fractions of the viewport) and distance
 * relative to the perched distance, over the finale's progress. */
type Waypoint = readonly [at: number, dx: number, dy: number, depth: number];

const WAYPOINTS: readonly Waypoint[] = [
  [0.14, 0.62, -0.62, 0.62],
  [0.28, 0.42, -0.4, 0.82],
  [0.42, 0.22, -0.22, 1.02],
  [0.54, 0.1, -0.11, 1.08],
  [0.64, 0.03, -0.04, 1.04],
  [0.72, 0.0, 0.0, 1.0],
];

const X_KEYS: Keyframe[] = WAYPOINTS.map(([at, dx]) => [at, dx]);
const Y_KEYS: Keyframe[] = WAYPOINTS.map(([at, , dy]) => [at, dy]);
const DEPTH_KEYS: Keyframe[] = WAYPOINTS.map(([at, , , depth]) => [at, depth]);

export const LANDING_START = 0.14;
export const LANDED = 0.72;
export const FOLDED = 0.84;

/** Wingbeats: a few strokes on the way in, a glide, then the flare. */
const FLAPPING: Keyframe[] = [
  [0.14, 1],
  [0.26, 1],
  [0.31, 0],
  [0.4, 0],
  [0.45, 1],
  [0.56, 1],
  [0.62, 0],
];

/** Wings high and spread wide to brake, just before the feet touch. */
const FLARE: WingPose = {
  elevation: 62,
  elbow: 0.08,
  wrist: 0.12,
  spread: 1,
  handLag: -12,
  attack: 22,
};

/** Folded against the body, as the bird sits. */
export const PERCHED_POSE: WingPose = {
  elevation: -70,
  elbow: 1,
  wrist: 1,
  spread: 0,
  handLag: 0,
  attack: 8,
  tuck: 1,
};

export const PERCHED_PITCH = 0.92;
const PERCHED_FORWARD: Vec3 = [-1, 0, 0];

export type Perch = {
  /** Screen position of the feet on the branch, in CSS pixels. */
  x: number;
  y: number;
  /** Camera distance at which the perched bird has the intended size. */
  depth: number;
};

export type Idle = {
  /** Seconds of idle animation after landing (0 when not animating). */
  time: number;
};

export type LandingFrame = {
  state: BirdState;
  transform: BirdTransform;
  camera: Camera;
  /** Legs reach down to the branch from this progress on. */
  standing: boolean;
  opacity: number;
};

const mixVec = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

// Small signs of life once the bird has settled: breathing, a glance, and a
// flick of the tail now and then.
const idleMotion = (time: number) => {
  const breath = Math.sin((time * 2 * Math.PI) / 3.4);
  const glance =
    smoothstep(0.0, 0.25, (time % 6.5) - 3.2) *
    (1 - smoothstep(0.9, 1.3, (time % 6.5) - 3.2));
  const flickPhase = (time % 9.2) - 5.1;
  const flick =
    flickPhase > 0 && flickPhase < 0.5
      ? Math.sin((flickPhase / 0.5) * Math.PI)
      : 0;
  return { breath, glance, flick };
};

export const landingAt = (
  progress: number,
  perch: Perch,
  camera: Camera,
  idle: Idle,
  reduced: boolean,
): LandingFrame => {
  const e = reduced ? 1 : progress;
  const toWorld = (dx: number, dy: number, depthScale: number): Vec3 => {
    const depth = perch.depth * depthScale;
    const sx = perch.x + dx * camera.centreX * 2;
    const sy = perch.y + dy * camera.centreY * 2;
    return [
      ((sx - camera.centreX) * depth) / camera.focal,
      ((camera.centreY - sy) * depth) / camera.focal,
      depth,
    ];
  };
  // The path is flown by the feet; the body sits where, perched, its legs
  // reach down to the branch.
  const probe = createProjector(
    {
      position: [0, 0, 0],
      forward: PERCHED_FORWARD,
      bank: 0,
      pitch: PERCHED_PITCH,
    },
    camera,
  );
  const leg = probe.toCamera([1.6, -3.7, 0]);
  const hip: Vec3 = [0.5 - leg[0], 2.6 - leg[1], -leg[2]];
  const pathAt = (at: number): Vec3 => {
    const feet = toWorld(
      splineKeyframes(at, X_KEYS),
      splineKeyframes(at, Y_KEYS),
      splineKeyframes(at, DEPTH_KEYS),
    );
    return [feet[0] + hip[0], feet[1] + hip[1], feet[2] + hip[2]];
  };
  const position = pathAt(Math.min(e, LANDED));

  // Heading follows the path until the bird turns to face the sun on landing.
  const ahead = pathAt(Math.min(e + 0.01, LANDED));
  const behind = pathAt(Math.max(e - 0.01, LANDING_START));
  const heading: Vec3 = [
    ahead[0] - behind[0],
    ahead[1] - behind[1] * 0.3,
    ahead[2] - behind[2],
  ];
  const forward = mixVec(heading, PERCHED_FORWARD, smoothstep(0.5, LANDED, e));

  const phase = e * 26;
  const flapping = keyframes(e, FLAPPING) * (1 - smoothstep(0.56, 0.62, e));
  let pose = blendPose(GLIDE_POSE, flapPose(phase), flapping);
  pose = blendPose(pose, FLARE, smoothstep(0.56, 0.66, e));
  pose = blendPose(pose, PERCHED_POSE, smoothstep(LANDED - 0.02, FOLDED, e));

  const { breath, glance, flick } = idleMotion(idle.time);
  const perched = smoothstep(FOLDED - 0.04, FOLDED, e);
  const flare = smoothstep(0.56, 0.66, e) * (1 - smoothstep(LANDED, FOLDED, e));

  return {
    state: {
      pose,
      tailSpread: clamp(0.3 + 0.7 * flare - 0.25 * perched),
      tailPitch: -8 - 20 * flare + (-34 + 12 * flick * perched) * perched,
      bob: 0.12 * breath * perched,
      headTurn: 0.82 * perched + 0.4 * flare - 0.12 * glance * perched,
    },
    transform: {
      position,
      forward,
      bank: 0,
      pitch: 0.12 + (PERCHED_PITCH - 0.12) * smoothstep(0.54, 0.7, e),
    },
    camera,
    standing: e >= LANDED - 0.03,
    opacity: reduced ? 1 : range(e, LANDING_START, LANDING_START + 0.04),
  };
};
