import { createRandom } from "../math";
import type { BirdPalette } from "./drawBird";

/**
 * The bird's near wing a hand's breadth from the lens, seen from below with
 * the light behind it. It is painted once, feather by feather, into a canvas
 * and blurred as if far out of focus; during the wipe the canvas only moves.
 *
 * Local frame: u runs along the wing (root at −u, tip at +u), v across it
 * with the leading edge toward +v. The wipe's straight edge lies on
 * v = LENS_WING_TRAILING, where the wing is solid; only the tips of the
 * flight feathers reach past it.
 */
export const LENS_WING_LEADING = 44;
export const LENS_WING_TRAILING = -46;

export const LENS_WING_BOUNDS = { uMin: -170, uMax: 196, vMin: -104, vMax: 62 };

const U_ROOT = -160;
const U_TIP = 186;
const PRIMARIES = 10;
const SECONDARIES = 17;

type Point = [number, number];
type Rgb = [number, number, number];

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const rgba = ([r, g, b]: Rgb, alpha = 1) =>
  `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
const hexToRgb = (hex: string): Rgb => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

/** Leading edge of the wing: highest at the wrist, sweeping back to the tip. */
const leadingEdge = (u: number) => {
  const t = Math.min(1, Math.max(0, (u - U_ROOT) / (U_TIP - U_ROOT)));
  return LENS_WING_LEADING - 34 * Math.pow(t, 2.4) + 5 * Math.sin(t * Math.PI);
};

type Feather = {
  base: Point;
  tip: Point;
  width: number;
  /** Share of the width on the leading (outer) side of the shaft. */
  outer: number;
};

const frameOf = ({ base, tip }: Feather) => {
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const length = Math.hypot(dx, dy) || 1;
  const along: Point = [dx / length, dy / length];
  const across: Point = [-along[1], along[0]];
  const at = (s: number, offset: number): Point => [
    base[0] + along[0] * length * s + across[0] * offset,
    base[1] + along[1] * length * s + across[1] * offset,
  ];
  return { length, at };
};

/** A feather outline: narrow quill, long parallel vanes, a rounded tip. */
const featherPath = (feather: Feather) => {
  const { at } = frameOf(feather);
  const outer = feather.width * feather.outer;
  const inner = feather.width - outer;
  const path = new Path2D();
  const move = (point: Point) => path.moveTo(point[0], point[1]);
  const line = (point: Point) => path.lineTo(point[0], point[1]);
  const curve = (control: Point, end: Point) =>
    path.quadraticCurveTo(control[0], control[1], end[0], end[1]);
  move(at(0, outer * 0.3));
  curve(at(0.1, outer), at(0.28, outer));
  line(at(0.82, outer * 0.97));
  curve(at(1.01, outer * 0.86), at(1, 0));
  curve(at(1.01, -inner * 0.9), at(0.84, -inner));
  line(at(0.28, -inner));
  curve(at(0.1, -inner), at(0, -inner * 0.3));
  path.closePath();
  return path;
};

const flightFeathers = (): Array<Feather & { tone: number }> => {
  const random = createRandom(7);
  const feathers: Array<Feather & { tone: number }> = [];
  // Secondaries along the arm, root to wrist; their tips make the trailing edge.
  for (let index = 0; index < SECONDARIES; index += 1) {
    const t = index / (SECONDARIES - 1);
    const u = U_ROOT + 8 + t * 196;
    const reach = 13 + 3 * Math.sin(index * 2.1) + 2 * t;
    const slant = 4 + 10 * t;
    feathers.push({
      base: [u - slant * 0.3, 14],
      tip: [u + slant, LENS_WING_TRAILING - reach],
      width: 25,
      outer: 0.36,
      tone: random(),
    });
  }
  // Primaries fan out from the hand toward the wing tip.
  for (let index = 0; index < PRIMARIES; index += 1) {
    const t = index / (PRIMARIES - 1);
    const u = 50 + t * 118;
    const length = 88 + 30 * Math.sin(t * Math.PI * 0.8);
    const angle = (0.2 + 0.95 * Math.pow(t, 1.3)) * (Math.PI / 2) * 0.62;
    const base: Point = [u - 10, leadingEdge(u) - 20];
    feathers.push({
      base,
      tip: [
        base[0] + Math.sin(angle) * length,
        base[1] - Math.cos(angle) * length,
      ],
      width: 21 - 5 * t,
      outer: 0.3,
      tone: random(),
    });
  }
  // Draw from the wing tip toward the root so inner feathers overlap outer ones.
  return feathers.reverse();
};

/** A row of coverts along the leading edge, slightly irregular like real plumage. */
const covertRow = (
  seed: number,
  count: number,
  from: number,
  to: number,
  depth: number,
  length: number,
  width: number,
) => {
  const random = createRandom(seed);
  return Array.from(
    { length: count },
    (_, index): Feather & { tone: number } => {
      const t = index / (count - 1);
      const u = from + t * (to - from) + (random() - 0.5) * width * 0.35;
      const top = leadingEdge(u) - depth + (random() - 0.5) * 3;
      const slant = 6 + 8 * t + (random() - 0.5) * 4;
      const reach = length * (1 - 0.25 * t) * (0.85 + random() * 0.3);
      return {
        base: [u - slant * 0.4, top],
        tip: [u + slant, top - reach],
        width: width * (0.9 + random() * 0.2),
        outer: 0.45,
        tone: random(),
      };
    },
  ).reverse();
};

export type LensWingTheme = "light" | "dark";

/**
 * Paints the wing into `canvas`. `scale` is CSS pixels per local unit on
 * screen; the canvas is rendered below that resolution since it is blurred.
 */
export const paintLensWing = (
  canvas: HTMLCanvasElement,
  palette: BirdPalette,
  scale: number,
) => {
  const { uMin, uMax, vMin, vMax } = LENS_WING_BOUNDS;
  const unit = Math.max(1.2, Math.min(5, scale * 0.45));
  const width = Math.round((uMax - uMin) * unit);
  const height = Math.round((vMax - vMin) * unit);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;

  // The underwing is browner and less glossy than the back.
  const body = mix(hexToRgb(palette.body), [11, 9, 9], 0.5);
  const base = mix(palette.featherBase, [16, 13, 12], 0.5);
  const lit = palette.featherTip;
  const edge = palette.edge;

  context.save();
  context.clearRect(0, 0, width, height);
  // Local units, with v growing down the canvas: the leading edge is at the bottom.
  context.setTransform(unit, 0, 0, unit, -uMin * unit, -vMin * unit);
  context.lineCap = "round";

  // Close to the lens the light through the flight feathers is stronger.
  const glowing = mix(lit, edge, 0.28);
  const paint = (feather: Feather & { tone?: number }, flight: boolean) => {
    const path = featherPath(feather);
    const { at, length } = frameOf(feather);
    const [bx, by] = at(0, 0);
    const [tx, ty] = at(1, 0);
    const gradient = context.createLinearGradient(bx, by, tx, ty);
    if (flight) {
      const tone = 0.8 + 0.4 * (feather.tone ?? 0.5);
      gradient.addColorStop(0, rgba(body));
      gradient.addColorStop(0.5, rgba(mix(base, lit, 0.05 * tone)));
      gradient.addColorStop(0.84, rgba(mix(base, lit, 0.15 * tone)));
      gradient.addColorStop(1, rgba(mix(base, glowing, 0.26 * tone), 0.95));
    } else {
      const tone = 0.1 + 0.16 * (feather.tone ?? 0.5);
      gradient.addColorStop(0, rgba(body));
      gradient.addColorStop(0.7, rgba(mix(body, base, 0.7)));
      gradient.addColorStop(1, rgba(mix(base, lit, tone)));
    }
    context.fillStyle = gradient;
    context.fill(path);

    context.save();
    context.clip(path);
    // Barbs: fine parallel lines slanting from the shaft toward the tip.
    const barbs = new Path2D();
    const spacing = flight ? 1.25 : 1.6;
    for (let s = 0.06; s < 0.97; s += spacing / length) {
      for (const side of [1, -1]) {
        const [sx, sy] = at(s, 0);
        const reach =
          feather.width * (side > 0 ? feather.outer : 1 - feather.outer);
        const [ex, ey] = at(s + (reach * 0.8) / length, side * reach);
        barbs.moveTo(sx, sy);
        barbs.lineTo(ex, ey);
      }
    }
    context.lineWidth = 0.32;
    context.strokeStyle = rgba(lit, flight ? 0.09 : 0.035);
    context.stroke(barbs);
    // The light comes through the thin tip and catches its edge.
    const rim = context.createLinearGradient(bx, by, tx, ty);
    rim.addColorStop(0, rgba(edge, 0));
    rim.addColorStop(0.7, rgba(edge, 0));
    rim.addColorStop(1, rgba(edge, flight ? 0.32 : 0.04));
    context.strokeStyle = rim;
    context.lineWidth = 1.1;
    context.stroke(path);
    context.restore();

    // Shaft.
    if (flight) {
      const [qx, qy] = at(0.97, 0);
      const shaft = context.createLinearGradient(bx, by, qx, qy);
      shaft.addColorStop(0, rgba(mix(lit, edge, 0.3), 0.1));
      shaft.addColorStop(0.6, rgba(mix(lit, edge, 0.3), 0.34));
      shaft.addColorStop(1, rgba(mix(lit, edge, 0.3), 0.1));
      context.strokeStyle = shaft;
      context.lineWidth = 0.75;
      context.beginPath();
      context.moveTo(bx, by);
      context.lineTo(qx, qy);
      context.stroke();
    }
  };

  flightFeathers().forEach((feather) => paint(feather, true));
  covertRow(11, 24, U_ROOT, 150, 20, 30, 17).forEach((feather) =>
    paint(feather, false),
  );
  covertRow(12, 30, U_ROOT - 6, 132, 11, 21, 12).forEach((feather) =>
    paint(feather, false),
  );
  covertRow(13, 40, U_ROOT - 10, 118, 3, 14, 9).forEach((feather) =>
    paint(feather, false),
  );

  // The leading edge: the smooth, dark forearm under its small feathers.
  const edgePath = new Path2D();
  edgePath.moveTo(uMin, leadingEdge(uMin) + 2);
  for (let u = uMin; u <= U_TIP; u += 4) edgePath.lineTo(u, leadingEdge(u) + 2);
  for (let u = U_TIP; u >= uMin; u -= 4)
    edgePath.lineTo(u, leadingEdge(u) - 8 + 3 * Math.sin(u * 0.4));
  edgePath.closePath();
  context.fillStyle = rgba(body);
  context.fill(edgePath);
  context.restore();

  // Far out of focus, and smeared along the sweep: average offset copies.
  const copy = document.createElement("canvas");
  copy.width = width;
  copy.height = height;
  const copyContext = copy.getContext("2d");
  if (!copyContext) return;
  copyContext.drawImage(canvas, 0, 0);
  context.clearRect(0, 0, width, height);
  const blur = 1.1 * unit;
  if ("filter" in context) context.filter = `blur(${blur.toFixed(1)}px)`;
  context.globalCompositeOperation = "lighter";
  const taps = 7;
  const smear = 1.8 * unit;
  context.globalAlpha = 1 / taps;
  for (let tap = 0; tap < taps; tap += 1) {
    context.drawImage(copy, 0, (tap / (taps - 1) - 0.5) * smear);
  }
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
  context.filter = "none";
};
