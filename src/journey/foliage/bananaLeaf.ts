import { createRandom } from "../math";

/**
 * Procedural, back-lit banana leaf painted into a canvas: an oblong blade on
 * a drooping midrib, dense parallel veins that read dark against light coming
 * through the blade, splits along the veins, a pale midrib and dry margins.
 * Rendered once per size; motion is applied with CSS transforms.
 */
export type BananaLeafSpec = {
  /** Stalk position, as a fraction of the canvas size. */
  baseX: number;
  baseY: number;
  /** Midrib direction at the stalk in radians: 0 points up, positive leans right. */
  angle: number;
  /** How far the midrib turns from stalk to tip, in radians (positive turns clockwise). */
  bend: number;
  /** Blade length and half width, as fractions of the canvas height. */
  length: number;
  halfWidth: number;
  /** Splits per side of the blade. */
  tears: number;
  seed: number;
  /** 0 = leaf in shade, 1 = light shining through it. */
  backlight: number;
  /** Extra darkening for leaves close to the camera, deep in shadow (0–1). */
  shade?: number;
  /** Narrows one half of the blade, as if the leaf were turned away (0–0.8). */
  turn?: number;
  /** Depth-of-field blur in CSS pixels. */
  blur?: number;
};

type Theme = "light" | "dark";
type Point = [number, number];
type Rgb = [number, number, number];

const PALETTE: Record<
  Theme,
  { shade: Rgb; glow: Rgb; edge: Rgb; rib: Rgb; margin: Rgb }
> = {
  light: {
    shade: [24, 44, 18],
    glow: [150, 176, 58],
    edge: [18, 32, 12],
    rib: [206, 208, 132],
    margin: [118, 98, 48],
  },
  dark: {
    shade: [8, 20, 26],
    glow: [52, 98, 104],
    edge: [4, 10, 14],
    rib: [120, 168, 176],
    margin: [40, 62, 70],
  },
};

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const rgba = ([r, g, b]: Rgb, alpha = 1) =>
  `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const SAMPLES = 90;

/** Smooth 1D value noise over a fixed table, 0–1. */
const createNoise1D = (random: () => number, size = 64) => {
  const table = Array.from({ length: size }, () => random());
  return (x: number) => {
    const i = Math.floor(x);
    const t = x - i;
    const a = table[((i % size) + size) % size];
    const b = table[(((i + 1) % size) + size) % size];
    const k = t * t * (3 - 2 * t);
    return a + (b - a) * k;
  };
};

/** A small tile of grain for the leaf surface, reused for every leaf. */
let grainTile: HTMLCanvasElement | null = null;
const getGrainTile = () => {
  if (grainTile) return grainTile;
  const tile = document.createElement("canvas");
  tile.width = 96;
  tile.height = 96;
  const context = tile.getContext("2d");
  if (context) {
    const image = context.createImageData(96, 96);
    const random = createRandom(97);
    for (let index = 0; index < image.data.length; index += 4) {
      const value = 96 + random() * 64;
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
    context.putImageData(image, 0, 0);
  }
  grainTile = tile;
  return tile;
};

export const paintBananaLeaf = (
  canvas: HTMLCanvasElement,
  spec: BananaLeafSpec,
  theme: Theme,
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2),
) => {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  if (cssWidth === 0 || cssHeight === 0) return false;
  const width = Math.round(cssWidth * pixelRatio);
  const height = Math.round(cssHeight * pixelRatio);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return false;

  const random = createRandom(spec.seed);
  const base = PALETTE[theme];
  const darken = 1 - 0.55 * (spec.shade ?? 0);
  const dim = (color: Rgb): Rgb => [
    color[0] * darken,
    color[1] * darken,
    color[2] * darken,
  ];
  const palette = {
    shade: dim(base.shade),
    glow: dim(base.glow),
    edge: dim(base.edge),
    rib: dim(base.rib),
    margin: dim(base.margin),
  };
  const scale = height;
  const length = spec.length * scale;
  const halfWidth = spec.halfWidth * scale;
  const turn = spec.turn ?? 0;

  // Midrib: integrate a direction that turns more and more toward the tip.
  const rib: Point[] = [];
  const normals: Point[] = [];
  const widths: Array<[number, number]> = [];
  let x = spec.baseX * width;
  let y = spec.baseY * height;
  for (let index = 0; index <= SAMPLES; index += 1) {
    const u = index / SAMPLES;
    const theta = spec.angle + spec.bend * Math.pow(u, 1.6);
    rib.push([x, y]);
    normals.push([Math.cos(theta), Math.sin(theta)]);
    // Rounded base, long parallel middle, tapering drooping tip.
    const blade = u < 0.06 ? 0 : (u - 0.06) / 0.94;
    const rise = Math.pow(
      Math.sin(Math.min(1, blade / 0.26) * (Math.PI / 2)),
      0.75,
    );
    const fall = Math.pow(
      Math.cos(Math.max(0, (blade - 0.58) / 0.42) * (Math.PI / 2)),
      0.85,
    );
    const profile = blade <= 0 ? 0.03 : Math.max(0.03, rise * fall);
    const wobble =
      1 + 0.045 * Math.sin(u * 23 + spec.seed) + (random() - 0.5) * 0.05;
    widths.push([
      halfWidth * profile * (1 - turn) * wobble,
      halfWidth * profile * (1 + turn * 0.15) * wobble,
    ]);
    x += Math.sin(theta) * (length / SAMPLES);
    y += -Math.cos(theta) * (length / SAMPLES);
  }

  const edgePoint = (index: number, side: -1 | 1, inset = 1): Point => {
    const [rx, ry] = rib[index];
    const [nx, ny] = normals[index];
    const w = widths[index][side < 0 ? 0 : 1] * inset;
    return [rx + side * nx * w, ry + side * ny * w];
  };

  // Everything below is in device pixels.
  context.save();
  context.clearRect(0, 0, width, height);

  const blade = new Path2D();
  const start = edgePoint(0, -1);
  blade.moveTo(start[0], start[1]);
  for (let index = 1; index <= SAMPLES; index += 1) {
    const [px, py] = edgePoint(index, -1);
    blade.lineTo(px, py);
  }
  for (let index = SAMPLES; index >= 0; index -= 1) {
    const [px, py] = edgePoint(index, 1);
    blade.lineTo(px, py);
  }
  blade.closePath();

  // Blade: light glows through the middle of each half, the margins stay dark.
  // The blade is pleated along its veins, which shows as soft light and dark
  // bands across it.
  const mottle = Array.from(
    { length: SAMPLES + 1 },
    () => 0.85 + random() * 0.3,
  );
  const pleatPhase = random() * Math.PI * 2;
  // Sunlight comes through the canopy in patches.
  const dapple = createNoise1D(random);
  const dappleDepth = 0.25 + 0.5 * spec.backlight;
  for (const side of [-1, 1] as const) {
    for (let index = 0; index < SAMPLES; index += 1) {
      const u = index / SAMPLES;
      const along = smooth(0.08, 0.45, u) * (1 - 0.35 * smooth(0.72, 1, u));
      const pleat =
        1 + 0.2 * Math.sin(u * Math.PI * 2 * 17 + pleatPhase) * mottle[index];
      const patch =
        1 -
        dappleDepth +
        dappleDepth * 1.6 * dapple(u * 7 + (side < 0 ? 0 : 31));
      const light =
        spec.backlight *
        along *
        mottle[index] *
        pleat *
        patch *
        (side < 0 ? 1 - turn * 0.6 : 1);
      const centre = mix(palette.shade, palette.glow, light);
      const middle = mix(palette.shade, palette.glow, light * 0.72);
      const edge = mix(palette.edge, palette.shade, 0.4 + light * 0.3);
      const inner = rib[index];
      const outer = edgePoint(index, side);
      const gradient = context.createLinearGradient(
        inner[0],
        inner[1],
        outer[0],
        outer[1],
      );
      gradient.addColorStop(0, rgba(mix(centre, palette.shade, 0.25)));
      gradient.addColorStop(0.18, rgba(centre));
      gradient.addColorStop(0.7, rgba(middle));
      gradient.addColorStop(1, rgba(edge));
      context.fillStyle = gradient;
      const next = edgePoint(index + 1, side);
      context.beginPath();
      context.moveTo(inner[0], inner[1]);
      context.lineTo(rib[index + 1][0], rib[index + 1][1]);
      context.lineTo(next[0], next[1]);
      context.lineTo(outer[0], outer[1]);
      context.closePath();
      context.fill();
    }
  }

  // Parallel lateral veins, slanting toward the tip, dark against the light.
  context.save();
  context.clip(blade);
  context.lineCap = "round";
  const veinStep = 0.0045;
  for (let u = 0.08; u < 0.985; u += veinStep) {
    const index = Math.round(u * SAMPLES);
    const reach = Math.min(SAMPLES, index + 2);
    const strong = random() < 0.12;
    context.lineWidth = Math.max(0.6, scale * (strong ? 0.0016 : 0.0008));
    context.strokeStyle = rgba(palette.edge, strong ? 0.42 : 0.24);
    for (const side of [-1, 1] as const) {
      const [sx, sy] = rib[index];
      const [ex, ey] = edgePoint(reach, side, 1.02);
      const [mx, my] = edgePoint(Math.min(SAMPLES, index + 1), side, 0.55);
      context.beginPath();
      context.moveTo(sx, sy);
      context.quadraticCurveTo(mx, my, ex, ey);
      context.stroke();
    }
  }
  context.restore();

  // Surface grain: the blade is never a flat colour.
  context.save();
  context.clip(blade);
  const grain = context.createPattern(getGrainTile(), "repeat");
  if (grain) {
    context.globalCompositeOperation = "soft-light";
    context.globalAlpha = 0.35;
    context.fillStyle = grain;
    context.fillRect(0, 0, width, height);
  }
  context.restore();

  // Splits along the veins: cut thin wedges from the margin toward the rib.
  context.save();
  context.globalCompositeOperation = "destination-out";
  const tears: Array<{ inner: Point; left: Point; right: Point }> = [];
  for (const side of [-1, 1] as const) {
    for (let tear = 0; tear < spec.tears; tear += 1) {
      const u = 0.16 + random() * 0.78;
      const index = Math.round(u * SAMPLES);
      const reach = Math.min(SAMPLES, index + 2);
      const depth = 0.3 + random() * 0.68;
      const gap = scale * (0.003 + random() * 0.009);
      const [ox, oy] = edgePoint(reach, side, 1.05);
      const [ix, iy] = edgePoint(index, side, 1 - depth);
      const [nx, ny] = normals[index];
      const along: Point = [-ny, nx];
      const left: Point = [ox + along[0] * gap, oy + along[1] * gap];
      const right: Point = [ox - along[0] * gap, oy - along[1] * gap];
      context.beginPath();
      context.moveTo(ix, iy);
      context.lineTo(left[0], left[1]);
      context.lineTo(right[0], right[1]);
      context.closePath();
      context.fill();
      tears.push({ inner: [ix, iy], left, right });
    }
  }
  // Insect bites along the margin.
  const bites = 3 + Math.floor(random() * 4);
  for (let bite = 0; bite < bites; bite += 1) {
    const index = Math.round((0.2 + random() * 0.7) * SAMPLES);
    const side = random() < 0.5 ? -1 : 1;
    const [bx, by] = edgePoint(index, side, 0.97);
    const radius = scale * (0.004 + random() * 0.008);
    context.beginPath();
    context.ellipse(
      bx,
      by,
      radius * 1.4,
      radius,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  context.restore();

  // Dry, brown edges along the splits: darkest toward the margin.
  context.save();
  context.clip(blade);
  context.lineCap = "round";
  tears.forEach(({ inner, left, right }) => {
    for (const outer of [left, right]) {
      const dry = context.createLinearGradient(
        inner[0],
        inner[1],
        outer[0],
        outer[1],
      );
      dry.addColorStop(0, rgba(palette.margin, 0.05));
      dry.addColorStop(0.6, rgba(palette.margin, 0.35));
      dry.addColorStop(1, rgba(mix(palette.margin, [70, 46, 20], 0.4), 0.7));
      context.strokeStyle = dry;
      context.lineWidth = Math.max(0.8, scale * 0.0016);
      context.beginPath();
      context.moveTo(inner[0], inner[1]);
      context.lineTo(outer[0], outer[1]);
      context.stroke();
    }
  });
  context.restore();

  // A ragged, dried margin whose width wanders along the edge.
  context.save();
  context.clip(blade);
  const ragged = createNoise1D(random);
  for (const side of [-1, 1] as const) {
    for (let index = 2; index < SAMPLES - 1; index += 1) {
      const u = index / SAMPLES;
      const dryness = ragged(u * 18 + (side < 0 ? 0 : 40));
      const [x0, y0] = edgePoint(index, side);
      const [x1, y1] = edgePoint(index + 1, side);
      context.strokeStyle = rgba(
        mix(palette.margin, [74, 50, 22], dryness * 0.5),
        0.25 + 0.45 * dryness,
      );
      context.lineWidth = Math.max(
        1,
        scale * (0.002 + 0.006 * dryness * dryness),
      );
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.stroke();
    }
  }
  // The tip dries first.
  const [tx, ty] = rib[SAMPLES];
  const [sx, sy] = rib[Math.round(SAMPLES * 0.86)];
  const tip = context.createLinearGradient(sx, sy, tx, ty);
  tip.addColorStop(0, rgba(palette.margin, 0));
  tip.addColorStop(1, rgba(mix(palette.margin, [80, 54, 24], 0.5), 0.55));
  context.fillStyle = tip;
  context.fill(blade);
  // A few dry spots.
  const spots = 2 + Math.floor(random() * 4);
  for (let spot = 0; spot < spots; spot += 1) {
    const index = Math.round((0.35 + random() * 0.6) * SAMPLES);
    const side = random() < 0.5 ? -1 : 1;
    const [px, py] = edgePoint(index, side, 0.45 + random() * 0.45);
    const radius = scale * (0.006 + random() * 0.012);
    const stain = context.createRadialGradient(px, py, 0, px, py, radius);
    stain.addColorStop(0, rgba(mix(palette.margin, [90, 62, 26], 0.5), 0.5));
    stain.addColorStop(0.7, rgba(palette.margin, 0.2));
    stain.addColorStop(1, rgba(palette.margin, 0));
    context.fillStyle = stain;
    context.beginPath();
    context.ellipse(
      px,
      py,
      radius * 1.6,
      radius,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  context.restore();

  // Midrib: a raised ridge — shadowed on one side, catching light on the
  // other — tapering from the stalk to the tip, drawn as one smooth band.
  const ribWidth = (u: number) =>
    scale * (0.014 * Math.pow(1 - u, 1.2) + 0.0015);
  const band = (offset: number, widthScale: number) => {
    const path = new Path2D();
    const left: Point[] = [];
    const right: Point[] = [];
    rib.forEach(([rx, ry], index) => {
      const [nx, ny] = normals[index];
      const half = (ribWidth(index / SAMPLES) * widthScale) / 2;
      const centre = offset * ribWidth(index / SAMPLES);
      left.push([rx + nx * (centre - half), ry + ny * (centre - half)]);
      right.push([rx + nx * (centre + half), ry + ny * (centre + half)]);
    });
    path.moveTo(left[0][0], left[0][1]);
    left.forEach(([px, py]) => path.lineTo(px, py));
    for (let index = right.length - 1; index >= 0; index -= 1) {
      path.lineTo(right[index][0], right[index][1]);
    }
    path.closePath();
    return path;
  };
  const [bx, by] = rib[0];
  const [ex, ey] = rib[SAMPLES];
  const ribColor = context.createLinearGradient(bx, by, ex, ey);
  ribColor.addColorStop(0, rgba(mix(palette.shade, palette.rib, 0.35), 0.95));
  ribColor.addColorStop(
    0.5,
    rgba(
      mix(mix(palette.shade, palette.rib, 0.35), palette.rib, spec.backlight),
      0.95,
    ),
  );
  ribColor.addColorStop(
    1,
    rgba(
      mix(mix(palette.shade, palette.rib, 0.35), palette.rib, spec.backlight),
      0.9,
    ),
  );
  context.fillStyle = rgba(palette.edge, 0.4);
  context.fill(band(0.12, 1.4));
  context.fillStyle = ribColor;
  context.fill(band(0, 1));
  context.fillStyle = rgba(mix(palette.rib, [255, 250, 220], 0.35), 0.35);
  context.fill(band(-0.22, 0.28));
  context.restore();

  // Depth of field: bake the blur so moving the canvas stays cheap.
  const blur = (spec.blur ?? 0) * pixelRatio;
  if (blur > 0.5 && "filter" in context) {
    const copy = document.createElement("canvas");
    copy.width = width;
    copy.height = height;
    copy.getContext("2d")?.drawImage(canvas, 0, 0);
    context.clearRect(0, 0, width, height);
    context.filter = `blur(${blur.toFixed(1)}px)`;
    context.drawImage(copy, 0, 0);
    context.filter = "none";
  }
  return true;
};
