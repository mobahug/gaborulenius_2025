/**
 * A small 3D rig of the portfolio's bird (a blue whistling thrush) in flight.
 * Units are centimetres. Bird space: +x forward, +y up, +z to the bird's
 * left. The wings are articulated at shoulder, elbow and wrist, carry
 * individual flight feathers, and fold on the upstroke the way real wings
 * do; the rig is projected with a perspective camera so the bird
 * foreshortens naturally as it flies toward the viewer.
 */

export type Vec3 = [number, number, number];

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (a: Vec3): Vec3 => {
  const length = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (degrees: number) => (degrees * Math.PI) / 180;

const rotateX = ([x, y, z]: Vec3, angle: number): Vec3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x, y * c - z * s, y * s + z * c];
};

const rotateZ = ([x, y, z]: Vec3, angle: number): Vec3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x * c - y * s, x * s + y * c, z];
};

// ---------------------------------------------------------------- poses

export type WingPose = {
  /** Wing elevation at the shoulder in degrees; positive is up. */
  elevation: number;
  /** 0 extended … 1 folded at the elbow. */
  elbow: number;
  /** 0 extended … 1 folded at the wrist. */
  wrist: number;
  /** 0 primaries closed … 1 fanned. */
  spread: number;
  /** Extra elevation of the hand relative to the arm, in degrees. */
  handLag: number;
  /** Leading edge up (+) or down, in degrees. */
  attack: number;
  /** 0 in flight … 1 folded flat against the body, as when perched. */
  tuck?: number;
};

const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** One wingbeat. The downstroke is the power stroke with the wing fully
 * spread; on the upstroke the wing folds at elbow and wrist. */
export const flapPose = (phase: number): WingPose => {
  const t = phase - Math.floor(phase);
  const downstroke = 0.56;
  const handLag = 20 * Math.cos(2 * Math.PI * t + 0.9);
  if (t < downstroke) {
    const k = easeInOut(t / downstroke);
    return {
      elevation: mix(58, -42, k),
      elbow: 0.06 + 0.06 * Math.sin(Math.PI * k),
      wrist: 0.08,
      spread: 1,
      handLag,
      attack: mix(4, 10, Math.sin(Math.PI * k)),
    };
  }
  const k = (t - downstroke) / (1 - downstroke);
  const fold = Math.sin(Math.PI * k);
  return {
    elevation: mix(-42, 58, easeInOut(k)),
    elbow: 0.08 + 0.52 * fold,
    wrist: 0.1 + 0.78 * Math.pow(fold, 0.8),
    spread: 1 - 0.72 * fold,
    handLag,
    attack: mix(10, -6, fold),
  };
};

export const GLIDE_POSE: WingPose = {
  elevation: 9,
  elbow: 0.05,
  wrist: 0.1,
  spread: 0.9,
  handLag: 5,
  attack: 3,
};

export const blendPose = (a: WingPose, b: WingPose, t: number): WingPose => ({
  elevation: mix(a.elevation, b.elevation, t),
  elbow: mix(a.elbow, b.elbow, t),
  wrist: mix(a.wrist, b.wrist, t),
  spread: mix(a.spread, b.spread, t),
  handLag: mix(a.handLag, b.handLag, t),
  attack: mix(a.attack, b.attack, t),
  tuck: mix(a.tuck ?? 0, b.tuck ?? 0, t),
});

// ---------------------------------------------------------------- geometry

export type FeatherKind =
  | "primary"
  | "secondary"
  | "tertial"
  | "covert"
  | "tail";

export type Polygon = {
  kind: FeatherKind;
  points: Vec3[];
  /** Base and tip of a feather, for shading along its length. */
  base?: Vec3;
  tip?: Vec3;
};

export type Sphere = { centre: Vec3; radius: number };

export type Bone = {
  from: Vec3;
  to: Vec3;
  fromRadius: number;
  toRadius: number;
};

/** A glossy spot at the tip of a body feather, and which way it faces. */
export type Spangle = { point: Vec3; normal: Vec3 };

export type BirdGeometry = {
  /** Body, neck and head as a dense chain of spheres: one smooth silhouette. */
  spine: Sphere[];
  head: Sphere;
  beak: { base: Vec3; tip: Vec3; radius: number };
  eyes: Vec3[];
  spangles: Spangle[];
  polygons: Polygon[];
  /** The thick leading edge of each wing (shoulder → elbow → wrist → hand). */
  bones: Bone[];
};

/** Key cross-sections from the root of the tail to the face; `bob` is how
 * much each follows the body's vertical bob (the head stays steady). */
const SPINE_KEYS: Array<{ centre: Vec3; radius: number; bob: number }> = [
  { centre: [-9.2, 0.45, 0], radius: 1.2, bob: 1 },
  { centre: [-7.4, 0.25, 0], radius: 2.1, bob: 1 },
  { centre: [-4.2, -0.2, 0], radius: 3.4, bob: 1 },
  { centre: [0.6, -0.7, 0], radius: 4.3, bob: 1 },
  { centre: [5.0, -0.1, 0], radius: 4.4, bob: 1 },
  { centre: [8.4, 1.0, 0], radius: 3.3, bob: 0.6 },
  { centre: [10.6, 1.6, 0], radius: 3.0, bob: 0 },
  { centre: [12.0, 1.8, 0], radius: 2.8, bob: 0 },
  { centre: [13.1, 1.5, 0], radius: 1.8, bob: 0 },
];
const SPINE_SAMPLES = 34;
const HEAD: Sphere = { centre: [12.0, 1.8, 0], radius: 2.8 };

const catmullRom = (a: number, b: number, c: number, d: number, t: number) =>
  0.5 *
  (2 * b +
    (-a + c) * t +
    (2 * a - 5 * b + 4 * c - d) * t * t +
    (-a + 3 * b - 3 * c + d) * t * t * t);

const NECK_PIVOT: Vec3 = [8.4, 1.0, 0];

/** Turns a head point about the neck, nose down for positive angles. */
const turnHead = (point: Vec3, angle: number): Vec3 =>
  angle === 0
    ? point
    : add(NECK_PIVOT, rotateZ(sub(point, NECK_PIVOT), -angle));

/** Cross-section of the body at `at` (0 = tail root … 1 = face). */
const spineAt = (at: number, bob: number, headTurn = 0): Sphere => {
  const last = SPINE_KEYS.length - 1;
  const position = Math.min(Math.max(at, 0), 1) * last;
  const index = Math.min(Math.floor(position), last - 1);
  const t = position - index;
  const key = (offset: number) =>
    SPINE_KEYS[Math.min(Math.max(index + offset, 0), last)];
  const [a, b, c, d] = [key(-1), key(0), key(1), key(2)];
  const channel = (pick: (k: (typeof SPINE_KEYS)[number]) => number) =>
    catmullRom(pick(a), pick(b), pick(c), pick(d), t);
  const centre: Vec3 = [
    channel((k) => k.centre[0]),
    channel((k) => k.centre[1] + k.bob * bob),
    channel((k) => k.centre[2]),
  ];
  const headShare = Math.min(
    1,
    Math.max(
      0,
      channel((k) => 1 - k.bob),
    ),
  );
  return {
    centre: turnHead(centre, headTurn * headShare),
    radius: channel((k) => k.radius),
  };
};

// Spangles cover the breast, neck, back and crown; fixed so they never flicker.
const SPANGLE_SEEDS = (() => {
  let state = 0x5eed;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return Array.from({ length: 110 }, () => ({
    at: 0.36 + random() * 0.6,
    angle: random() * Math.PI * 2,
  }));
})();
const SHOULDER: Vec3 = [4.2, 1.9, 2.3];
const HUMERUS = 4.8;
const FOREARM = 6.0;
const HAND = 4.2;
const PRIMARY_LENGTHS = [8.6, 9.3, 9.9, 10.4, 10.8, 11.0, 10.8, 10.2, 9.1];

/** Direction in the flat wing plane: 0 points straight out, positive sweeps back. */
const wingDirection = (angle: number): Vec3 => [
  -Math.sin(angle),
  0,
  Math.cos(angle),
];

const feather = (
  kind: FeatherKind,
  base: Vec3,
  direction: Vec3,
  length: number,
  width: number,
): Polygon => {
  const across: Vec3 = [direction[2], 0, -direction[0]];
  const at = (along: number, side: number) =>
    add(
      add(base, scale(direction, length * along)),
      scale(across, width * side),
    );
  return {
    kind,
    base,
    tip: at(1, 0),
    points: [
      at(0, 0.32),
      at(0.24, 0.5),
      at(0.68, 0.46),
      at(0.92, 0.24),
      at(1, -0.02),
      at(0.9, -0.3),
      at(0.58, -0.48),
      at(0.2, -0.44),
      at(0, -0.3),
    ],
  };
};

/** Builds one (left) wing in bird space. */
const buildWing = (pose: WingPose): { polygons: Polygon[]; bones: Bone[] } => {
  // Tucked, the arm folds into a Z along the body and every flight feather
  // points back over the tail.
  const tuck = pose.tuck ?? 0;
  const humerusAngle = rad(mix(mix(18, 62, pose.elbow), 84, tuck));
  const forearmAngle = rad(mix(mix(6, -44, pose.elbow), -84, tuck));
  const handAngle = rad(mix(mix(22, 118, pose.wrist), 94, tuck));
  const shoulder: Vec3 = [0, 0, 0];
  const elbow = add(shoulder, scale(wingDirection(humerusAngle), HUMERUS));
  const wrist = add(elbow, scale(wingDirection(forearmAngle), FOREARM));
  const handTip = add(wrist, scale(wingDirection(handAngle), HAND));

  const polygons: Polygon[] = [];

  // Primaries fan from the hand; closed they overlap, spread they "finger".
  PRIMARY_LENGTHS.forEach((length, index) => {
    const t = index / (PRIMARY_LENGTHS.length - 1);
    const base = add(wrist, scale(sub(handTip, wrist), 0.08 + 0.92 * t));
    const open = mix(74, 6, t);
    const closed = mix(mix(40, 14, t), mix(6, -2, t), tuck);
    const angle = handAngle + rad(mix(closed, open, pose.spread));
    polygons.push(
      feather("primary", base, wingDirection(angle), length, mix(2.3, 1.45, t)),
    );
  });

  // Secondaries along the forearm, tertials near the body.
  for (let index = 0; index < 9; index += 1) {
    const t = index / 8;
    const base = add(elbow, scale(sub(wrist, elbow), t));
    const angle =
      forearmAngle + rad(mix(mix(96, 82, t), mix(170, 178, t), tuck));
    polygons.push(
      feather("secondary", base, wingDirection(angle), mix(6.7, 7.4, t), 2.2),
    );
  }
  [0.45, 0.7, 0.92].forEach((t, index) => {
    const base = add(shoulder, scale(sub(elbow, shoulder), t));
    const angle = humerusAngle + rad(mix(98, 8, tuck));
    polygons.push(
      feather("tertial", base, wingDirection(angle), 5.2 + index * 0.5, 2.1),
    );
  });

  // Coverts: the smooth inner wing over the feather bases.
  const back = (point: Vec3, angle: number, distance: number) =>
    add(point, scale(wingDirection(angle), distance));
  const leadingBulge = add(scale(add(shoulder, elbow), 0.5), [0.9, 0, 0]);
  polygons.push({
    kind: "covert",
    points: [
      shoulder,
      leadingBulge,
      elbow,
      wrist,
      handTip,
      back(handTip, handAngle + rad(mix(70, 4, tuck)), 2.0),
      back(wrist, forearmAngle + rad(mix(84, 172, tuck)), mix(2.9, 3.4, tuck)),
      back(elbow, forearmAngle + rad(mix(96, 176, tuck)), mix(3.1, 2.2, tuck)),
      back(shoulder, humerusAngle + rad(mix(100, 12, tuck)), 2.8),
    ],
  });

  // Pose the flat wing: twist, a lagging hand, then elevation at the shoulder.
  const handStart = PRIMARY_LENGTHS.length;
  const poser =
    (isHand: boolean) =>
    (point: Vec3): Vec3 => {
      let p = rotateZ(point, rad(pose.attack));
      if (isHand) {
        p = add(wrist, rotateX(sub(p, wrist), rad(-pose.handLag)));
      }
      p = rotateX(p, rad(-pose.elevation));
      return add(p, SHOULDER);
    };
  const posedPolygons = polygons.map((polygon, polygonIndex) => {
    const pose3 = poser(polygonIndex < handStart);
    return {
      ...polygon,
      points: polygon.points.map(pose3),
      base: polygon.base ? pose3(polygon.base) : undefined,
      tip: polygon.tip ? pose3(polygon.tip) : undefined,
    };
  });
  const arm = poser(false);
  const hand = poser(true);
  const bones: Bone[] = [
    { from: arm(shoulder), to: arm(elbow), fromRadius: 1.25, toRadius: 0.95 },
    { from: arm(elbow), to: arm(wrist), fromRadius: 0.95, toRadius: 0.65 },
    { from: hand(wrist), to: hand(handTip), fromRadius: 0.65, toRadius: 0.3 },
  ];
  return { polygons: posedPolygons, bones };
};

const mirror = ([x, y, z]: Vec3): Vec3 => [x, y, -z];

const buildTail = (spread: number, pitch: number): Polygon[] => {
  const base: Vec3 = [-7.4, 0.25, 0];
  const halfAngle = rad(mix(9, 34, spread));
  const polygons: Polygon[] = [];
  for (let index = 0; index < 10; index += 1) {
    const t = index / 9;
    const side = t * 2 - 1;
    const angle = mix(-halfAngle, halfAngle, t);
    // A slightly cupped tail: spread, the outer feathers sit lower than the
    // central pair.
    const droop = -0.08 - 0.12 * side * side * (0.2 + 0.8 * spread);
    const direction = normalize(
      rotateZ([-Math.cos(angle), droop, Math.sin(angle)], rad(pitch)),
    );
    const length = 11.2 + 1.0 * Math.cos(side * (Math.PI / 2));
    const across = normalize(cross(direction, [0, 1, 0]));
    const at = (along: number, offset: number) =>
      add(
        add(base, scale(direction, length * along)),
        scale(across, 1.75 * offset),
      );
    polygons.push({
      kind: "tail",
      base,
      tip: at(1, 0),
      points: [
        at(0, 0.28),
        at(0.5, 0.5),
        at(0.95, 0.42),
        at(1, 0),
        at(0.95, -0.42),
        at(0.5, -0.5),
        at(0, -0.28),
      ],
    });
  }
  // Upper and under tail coverts give the base of the tail its depth, and
  // the stacked feathers a little thickness, so a closed tail does not read
  // as a flat blade from the side.
  const tilt = (point: Vec3) =>
    add(base, rotateZ(sub(point, base), rad(pitch)));
  const tipX = base[0] - 11.8;
  polygons.push({
    kind: "tail",
    base: tilt([base[0] - 3, 0.2, 0]),
    tip: tilt([tipX, -1.0, 0]),
    points: [
      [base[0] - 3, 0.95, 0],
      [tipX + 0.6, -0.55, 0],
      [tipX, -1.0, 0],
      [tipX + 0.5, -1.7, 0],
      [base[0] - 3, -0.6, 0],
    ].map((point) => tilt(point as Vec3)),
  });
  polygons.push({
    kind: "covert",
    points: [
      [-5.6, 2.1, 0],
      [-9.4, 1.4, 0],
      [-12.6, 0.6, 0],
      [-12.8, 0.05, 0],
      [-10.2, -0.7, 0],
      [-6.6, -1.9, 0],
      [-4.4, -2.6, 0],
    ].map((point) => tilt(point as Vec3)),
  });
  return polygons;
};

export type BirdState = {
  pose: WingPose;
  tailSpread: number;
  tailPitch: number;
  /** Vertical body bob in centimetres. */
  bob: number;
  /** Head turned about the neck, nose down, in radians (a perched bird
   * keeps its head level while its body leans back). */
  headTurn?: number;
};

export const buildBird = ({
  pose,
  tailSpread,
  tailPitch,
  bob,
  headTurn = 0,
}: BirdState): BirdGeometry => {
  const { polygons: leftWing, bones: leftBones } = buildWing(pose);
  const rightWing = leftWing.map((polygon) => ({
    ...polygon,
    points: polygon.points.map(mirror),
    base: polygon.base ? mirror(polygon.base) : undefined,
    tip: polygon.tip ? mirror(polygon.tip) : undefined,
  }));
  const rightBones = leftBones.map((bone) => ({
    ...bone,
    from: mirror(bone.from),
    to: mirror(bone.to),
  }));
  const lift: Vec3 = [0, bob, 0];
  return {
    spine: Array.from({ length: SPINE_SAMPLES }, (_, index) =>
      spineAt(index / (SPINE_SAMPLES - 1), bob, headTurn),
    ),
    // Birds keep the head steady while the body bobs.
    head: { ...HEAD, centre: turnHead(HEAD.centre, headTurn) },
    beak: {
      base: turnHead([13.6, 1.3, 0], headTurn),
      tip: turnHead([17.6, 0.55, 0], headTurn),
      radius: 0.9,
    },
    eyes: [
      turnHead([12.3, 2.3, 2.55], headTurn),
      turnHead([12.3, 2.3, -2.55], headTurn),
    ],
    spangles: SPANGLE_SEEDS.map(({ at, angle }) => {
      const { centre, radius } = spineAt(at, bob, headTurn);
      const normal: Vec3 = [0, Math.cos(angle), Math.sin(angle)];
      return { point: add(centre, scale(normal, radius * 0.98)), normal };
    }),
    polygons: [
      ...buildTail(tailSpread, tailPitch),
      ...leftWing,
      ...rightWing,
    ].map((polygon) => ({
      ...polygon,
      points: polygon.points.map((point) => add(point, lift)),
      base: polygon.base ? add(polygon.base, lift) : undefined,
      tip: polygon.tip ? add(polygon.tip, lift) : undefined,
    })),
    bones: [...leftBones, ...rightBones].map((bone) => ({
      ...bone,
      from: add(bone.from, lift),
      to: add(bone.to, lift),
    })),
  };
};

// ---------------------------------------------------------------- camera

export type BirdTransform = {
  /** Bird position relative to the camera (cm); the camera looks along +z. */
  position: Vec3;
  /** Direction of flight (need not be normalised). */
  forward: Vec3;
  /** Roll about the direction of flight, radians. */
  bank: number;
  /** Nose up (+) about the lateral axis, radians. */
  pitch: number;
};

export type Camera = {
  /** Focal length in CSS pixels. */
  focal: number;
  centreX: number;
  centreY: number;
};

export type Projector = {
  /** Camera-space point for a bird-space point. */
  toCamera: (point: Vec3) => Vec3;
  /** Screen point (CSS px) and depth for a camera-space point. */
  project: (point: Vec3) => [number, number, number];
};

export const createProjector = (
  transform: BirdTransform,
  camera: Camera,
): Projector => {
  let forward = normalize(transform.forward);
  let up: Vec3 = normalize(
    sub([0, 1, 0], scale(forward, dot([0, 1, 0], forward))),
  );
  let left = normalize(cross(forward, up));
  // Pitch about the lateral axis, then bank about the direction of flight.
  const cp = Math.cos(transform.pitch);
  const sp = Math.sin(transform.pitch);
  [forward, up] = [
    normalize(add(scale(forward, cp), scale(up, sp))),
    normalize(sub(scale(up, cp), scale(forward, sp))),
  ];
  const cb = Math.cos(transform.bank);
  const sb = Math.sin(transform.bank);
  [up, left] = [
    normalize(add(scale(up, cb), scale(left, sb))),
    normalize(sub(scale(left, cb), scale(up, sb))),
  ];
  const origin = transform.position;
  return {
    toCamera: ([x, y, z]) =>
      add(origin, add(add(scale(forward, x), scale(up, y)), scale(left, z))),
    project: ([x, y, z]) => {
      const depth = Math.max(z, 1);
      return [
        camera.centreX + (camera.focal * x) / depth,
        camera.centreY - (camera.focal * y) / depth,
        z,
      ];
    },
  };
};
