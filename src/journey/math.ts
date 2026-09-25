export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number) =>
  from + (to - from) * t;

/** Maps `value` from the range [start, end] onto [0, 1], clamped. */
export const range = (value: number, start: number, end: number) =>
  end === start
    ? value >= end
      ? 1
      : 0
    : clamp((value - start) / (end - start));

export const smoothstep = (start: number, end: number, value: number) => {
  const t = range(value, start, end);
  return t * t * (3 - 2 * t);
};

export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const easeInCubic = (t: number) => t * t * t;

/** A 0 → 1 → 0 bump across [start, end], peaking in the middle. */
export const bump = (value: number, start: number, end: number) =>
  Math.sin(Math.PI * range(value, start, end));

/** Interpolates exponentially, which reads as a constant-speed camera dolly. */
export const expLerp = (from: number, to: number, t: number) =>
  Math.exp(lerp(Math.log(from), Math.log(to), t));

export type Keyframe = [at: number, value: number];

/**
 * Piecewise-linear interpolation through sorted keyframes, clamped at both
 * ends. Used for authored choreography curves.
 */
export const keyframes = (value: number, frames: readonly Keyframe[]) => {
  if (value <= frames[0][0]) return frames[0][1];
  for (let index = 1; index < frames.length; index += 1) {
    const [at, frameValue] = frames[index];
    if (value <= at) {
      const [previousAt, previousValue] = frames[index - 1];
      const t = easeInOutSine(range(value, previousAt, at));
      return lerp(previousValue, frameValue, t);
    }
  }
  return frames[frames.length - 1][1];
};

/**
 * Smooth (cubic Hermite, Catmull-Rom tangents) interpolation through sorted
 * keyframes. Unlike `keyframes`, motion keeps its velocity through each key,
 * so flight paths do not stall at the waypoints.
 */
export const splineKeyframes = (value: number, frames: readonly Keyframe[]) => {
  const last = frames.length - 1;
  if (value <= frames[0][0]) return frames[0][1];
  if (value >= frames[last][0]) return frames[last][1];
  let index = 1;
  while (index < last && value > frames[index][0]) index += 1;
  const [t0, v0] = frames[index - 1];
  const [t1, v1] = frames[index];
  const tangent = (from: number, to: number) =>
    (frames[to][1] - frames[from][1]) / (frames[to][0] - frames[from][0]);
  const m0 =
    index - 2 >= 0 ? tangent(index - 2, index) : tangent(index - 1, index);
  const m1 =
    index + 1 <= last
      ? tangent(index - 1, index + 1)
      : tangent(index - 1, index);
  const h = t1 - t0;
  const s = (value - t0) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * v0 +
    (s3 - 2 * s2 + s) * h * m0 +
    (-2 * s3 + 3 * s2) * v1 +
    (s3 - s2) * h * m1
  );
};

/** Small deterministic PRNG so procedural shapes are identical every load. */
export const createRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
