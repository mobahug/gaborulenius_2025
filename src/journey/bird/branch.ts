import { createRandom } from "../math";

/**
 * The branch the bird lands on at the end of the journey: a twig reaching in
 * from the right with a few leaves, seen against a low sun. Painted once
 * into a canvas (bark, rim light on its upper edge, leaves that glow where
 * the light comes through their thin margins) and blitted every frame.
 *
 * All sizes are fractions of the branch box width `W`; the box is `W` wide
 * and `BRANCH_ASPECT * W` tall.
 */
export const BRANCH_ASPECT = 0.62;

/** Where along the box the bird's feet rest, as a fraction of its width. */
const PERCH_X = 0.46;

type Point = [number, number];
type Theme = "light" | "dark";

const COLORS: Record<
  Theme,
  {
    bark: string;
    barkLight: string;
    rim: string;
    leaf: string;
    leafLit: string;
    vein: string;
  }
> = {
  light: {
    bark: "#0d0a08",
    barkLight: "#2a1d14",
    rim: "rgba(255, 196, 120, 0.75)",
    leaf: "#0c120a",
    leafLit: "rgba(190, 150, 60, 0.55)",
    vein: "rgba(210, 170, 90, 0.35)",
  },
  dark: {
    bark: "#05070a",
    barkLight: "#141c24",
    rim: "rgba(170, 205, 245, 0.55)",
    leaf: "#060a0c",
    leafLit: "rgba(110, 150, 180, 0.4)",
    vein: "rgba(150, 190, 220, 0.25)",
  },
};

// The main twig as a cubic curve from the right edge to its tip.
const TWIG: [Point, Point, Point, Point] = [
  [1.04, 0.47],
  [0.8, 0.43],
  [0.5, 0.41],
  [0.18, 0.37],
];

const cubic = ([a, b, c, d]: typeof TWIG, t: number): Point => {
  const u = 1 - t;
  return [
    u * u * u * a[0] +
      3 * u * u * t * b[0] +
      3 * u * t * t * c[0] +
      t * t * t * d[0],
    u * u * u * a[1] +
      3 * u * u * t * b[1] +
      3 * u * t * t * c[1] +
      t * t * t * d[1],
  ];
};

/** Paints a tapered limb along `points` into `context`, with a lit upper edge. */
const paintLimb = (
  context: CanvasRenderingContext2D,
  points: Point[],
  widthAt: (t: number) => number,
  colors: (typeof COLORS)[Theme],
  scale: number,
) => {
  const upper: Point[] = [];
  const lower: Point[] = [];
  points.forEach(([x, y], index) => {
    const [px, py] = points[Math.max(0, index - 1)];
    const [nx, ny] = points[Math.min(points.length - 1, index + 1)];
    const dx = nx - px;
    const dy = ny - py;
    const length = Math.hypot(dx, dy) || 1;
    const normal: Point = [-dy / length, dx / length];
    const half = (widthAt(index / (points.length - 1)) * scale) / 2;
    // The normal points "down" on screen for a leftward limb; keep it upward.
    const up = normal[1] < 0 ? normal : ([-normal[0], -normal[1]] as Point);
    upper.push([x * scale + up[0] * half, y * scale + up[1] * half]);
    lower.push([x * scale - up[0] * half, y * scale - up[1] * half]);
  });
  const outline = new Path2D();
  outline.moveTo(upper[0][0], upper[0][1]);
  upper.forEach(([x, y]) => outline.lineTo(x, y));
  for (let index = lower.length - 1; index >= 0; index -= 1) {
    outline.lineTo(lower[index][0], lower[index][1]);
  }
  outline.closePath();
  context.fillStyle = colors.bark;
  context.fill(outline);

  // Bark: faint streaks along the limb.
  context.save();
  context.clip(outline);
  const random = createRandom(points.length * 17);
  context.strokeStyle = colors.barkLight;
  context.lineWidth = Math.max(0.6, scale * 0.002);
  for (let streak = 0; streak < 26; streak += 1) {
    const offset = random() - 0.5;
    const start = Math.floor(random() * (points.length - 6));
    context.beginPath();
    for (let index = start; index < start + 6; index += 1) {
      const t = index / (points.length - 1);
      const [ux, uy] = upper[index];
      const [lx, ly] = lower[index];
      const k = 0.5 + offset * 0.8 * (1 - t * 0.3);
      const x = ux + (lx - ux) * k;
      const y = uy + (ly - uy) * k;
      if (index === start) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  context.restore();

  // Rim light on the upper edge, strongest toward the sun on the left.
  context.save();
  context.lineCap = "round";
  for (let index = 1; index < upper.length; index += 1) {
    const t = index / (upper.length - 1);
    context.strokeStyle = colors.rim;
    context.globalAlpha = 0.25 + 0.75 * t;
    context.lineWidth = Math.max(0.8, scale * 0.0035);
    context.beginPath();
    context.moveTo(upper[index - 1][0], upper[index - 1][1]);
    context.lineTo(upper[index][0], upper[index][1]);
    context.stroke();
  }
  context.restore();
};

/** A lanceolate leaf hanging from `base`, pointing at `angle` (radians, 0 = right, positive = down). */
const paintLeaf = (
  context: CanvasRenderingContext2D,
  base: Point,
  angle: number,
  length: number,
  width: number,
  curl: number,
  colors: (typeof COLORS)[Theme],
) => {
  const along: Point = [Math.cos(angle), Math.sin(angle)];
  const across: Point = [-along[1], along[0]];
  const at = (s: number, w: number): Point => {
    const bend = curl * s * s * length;
    return [
      base[0] + along[0] * s * length + across[0] * (w + bend),
      base[1] + along[1] * s * length + across[1] * (w + bend),
    ];
  };
  const profile = (s: number) =>
    Math.sin(Math.PI * Math.pow(s, 0.8)) * (1 - 0.35 * s);
  const leaf = new Path2D();
  const steps = 18;
  const start = at(0, 0);
  leaf.moveTo(start[0], start[1]);
  for (let step = 1; step <= steps; step += 1) {
    const s = step / steps;
    const [x, y] = at(s, (width / 2) * profile(s));
    leaf.lineTo(x, y);
  }
  for (let step = steps; step >= 0; step -= 1) {
    const s = step / steps;
    const [x, y] = at(s, (-width / 2) * profile(s));
    leaf.lineTo(x, y);
  }
  leaf.closePath();
  context.fillStyle = colors.leaf;
  context.fill(leaf);

  // Light through the thin margin on the side facing the sun.
  context.save();
  context.clip(leaf);
  const [gx0, gy0] = at(0.5, width * 0.6);
  const [gx1, gy1] = at(0.5, -width * 0.2);
  const glow = context.createLinearGradient(gx0, gy0, gx1, gy1);
  glow.addColorStop(0, colors.leafLit);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fill(leaf);
  // Midrib and a few veins.
  context.strokeStyle = colors.vein;
  context.lineWidth = Math.max(0.6, width * 0.06);
  context.beginPath();
  for (let step = 0; step <= steps; step += 1) {
    const [x, y] = at(step / steps, 0);
    if (step === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
  context.lineWidth = Math.max(0.4, width * 0.03);
  for (let vein = 1; vein < 6; vein += 1) {
    const s = vein / 6.5;
    for (const side of [-1, 1]) {
      const [x0, y0] = at(s, 0);
      const [x1, y1] = at(
        s + 0.1,
        side * (width / 2) * profile(s + 0.1) * 0.85,
      );
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.stroke();
    }
  }
  context.restore();

  // Stalk.
  context.strokeStyle = colors.bark;
  context.lineWidth = Math.max(0.8, width * 0.08);
  context.beginPath();
  context.moveTo(
    base[0] - along[0] * width * 0.5,
    base[1] - along[1] * width * 0.5,
  );
  context.lineTo(base[0], base[1]);
  context.stroke();
};

/**
 * Paints the branch into `canvas` for a box `width` CSS pixels wide.
 * Returns false when there is nothing to paint.
 */
export const paintBranch = (
  canvas: HTMLCanvasElement,
  width: number,
  theme: Theme,
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2),
) => {
  if (width <= 0) return false;
  const height = width * BRANCH_ASPECT;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  const context = canvas.getContext("2d");
  if (!context) return false;
  const colors = COLORS[theme];
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);

  const samples = Array.from({ length: 40 }, (_, index) =>
    cubic(TWIG, index / 39),
  );
  // A side twig rising from the right part of the main one.
  const fork = cubic(TWIG, 0.3);
  const side: [Point, Point, Point, Point] = [
    fork,
    [fork[0] - 0.08, fork[1] - 0.06],
    [fork[0] - 0.12, fork[1] - 0.14],
    [fork[0] - 0.1, fork[1] - 0.24],
  ];
  const sideSamples = Array.from({ length: 20 }, (_, index) =>
    cubic(side, index / 19),
  );

  paintLimb(
    context,
    sideSamples,
    (t) => 0.022 * (1 - t) + 0.005,
    colors,
    width,
  );
  paintLimb(context, samples, (t) => 0.05 * (1 - t) + 0.009, colors, width);

  // Leaves along the outer part of the twig, clear of the perch.
  const random = createRandom(23);
  const leaves: Array<[number, number, number]> = [
    [0.12, 0.9, 1],
    [0.2, 2.1, -1],
    [0.3, 1.2, 1],
    [0.8, 0.5, -1],
    [0.86, 1.5, 1],
    [0.93, 2.3, -1],
  ];
  leaves.forEach(([t, angle, curl]) => {
    const [x, y] = cubic(TWIG, t);
    paintLeaf(
      context,
      [x * width, y * width],
      angle + (random() - 0.5) * 0.3,
      width * (0.15 + random() * 0.05),
      width * (0.05 + random() * 0.015),
      curl * 0.12,
      colors,
    );
  });
  sideSamples.slice(8).forEach(([x, y], index) => {
    if (index % 5 !== 0) return;
    paintLeaf(
      context,
      [x * width, y * width],
      -2.2 + index * 0.25,
      width * 0.12,
      width * 0.042,
      -0.1,
      colors,
    );
  });
  return true;
};

/** The perch point on the twig's upper edge, in box pixels. */
export const perchPoint = (width: number): Point => {
  let bestT = 0;
  let bestPoint = cubic(TWIG, 0);
  for (let index = 0; index <= 80; index += 1) {
    const t = index / 80;
    const point = cubic(TWIG, t);
    if (Math.abs(point[0] - PERCH_X) < Math.abs(bestPoint[0] - PERCH_X)) {
      bestT = t;
      bestPoint = point;
    }
  }
  const half = (0.05 * (1 - bestT) + 0.009) / 2;
  return [bestPoint[0] * width, (bestPoint[1] - half) * width];
};
