import {
  buildBird,
  createProjector,
  type BirdState,
  type BirdTransform,
  type Camera,
  type Polygon,
  type Vec3,
} from "./birdRig";

type Rgb = [number, number, number];

export type BirdPalette = {
  body: string;
  sheen: string;
  featherBase: Rgb;
  featherTip: Rgb;
  edge: Rgb;
  glow: string;
  beakLight: string;
  beakDark: string;
  eyeLight: string;
};

/** Back-lit plumage: near-black body, flight feathers the light shines through. */
export const BIRD_PALETTES: Record<"light" | "dark", BirdPalette> = {
  light: {
    body: "#0a0b17",
    sheen: "rgba(52, 66, 150, 0.55)",
    featherBase: [10, 11, 20],
    featherTip: [84, 70, 60],
    edge: [255, 214, 150],
    glow: "rgba(255, 204, 120, 0.6)",
    beakLight: "#e2b13a",
    beakDark: "#7d4c0e",
    eyeLight: "rgba(255, 236, 200, 0.85)",
  },
  dark: {
    body: "#05060d",
    sheen: "rgba(60, 86, 170, 0.5)",
    featherBase: [7, 9, 16],
    featherTip: [52, 66, 86],
    edge: [160, 210, 240],
    glow: "rgba(150, 200, 240, 0.45)",
    beakLight: "#c99a36",
    beakDark: "#5e3a0c",
    eyeLight: "rgba(214, 238, 255, 0.8)",
  },
};

const rgba = ([r, g, b]: Rgb, alpha: number) =>
  `rgba(${r}, ${g}, ${b}, ${alpha})`;

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const length = (a: Vec3) => Math.hypot(a[0], a[1], a[2]) || 1;

type Circle = { x: number; y: number; r: number; depth: number };

/** minX, minY, maxX, maxY in CSS pixels. */
type Bounds = [number, number, number, number];

/**
 * Draws the low-resolution scratch canvas over the main canvas, upscaled,
 * but only within `bounds` (plus a margin for the soft edge).
 */
const drawUpscaled = (
  context: CanvasRenderingContext2D,
  scratch: HTMLCanvasElement,
  bounds: Bounds,
) => {
  const ratio = context.getTransform().a;
  const { width, height } = context.canvas;
  const factor = scratch.width / width;
  const margin = 8 / factor;
  const left = Math.max(0, Math.floor(bounds[0] * ratio - margin));
  const top = Math.max(0, Math.floor(bounds[1] * ratio - margin));
  const right = Math.min(width, Math.ceil(bounds[2] * ratio + margin));
  const bottom = Math.min(height, Math.ceil(bounds[3] * ratio + margin));
  if (right <= left || bottom <= top) return;
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    scratch,
    left * factor,
    top * factor,
    (right - left) * factor,
    (bottom - top) * factor,
    left,
    top,
    right - left,
    bottom - top,
  );
  context.restore();
};

type Projected = {
  kind: Polygon["kind"] | "body" | "beak";
  depth: number;
  path: Path2D;
  /** Gradient axis: base to tip for feathers and the beak, top to bottom for the body. */
  from?: [number, number];
  to?: [number, number];
  /** How squarely the surface faces the camera: 0 edge-on … 1 face-on. */
  facing: number;
  eyes?: Array<Circle & { facing: number }>;
  spangles?: Array<Circle & { facing: number }>;
  /** The head's outline, for its own gloss so it reads apart from the breast. */
  head?: Circle;
};

// Every sub-shape is added clockwise so the non-zero fill is a clean union.
const addClockwise = (path: Path2D, points: Array<[number, number]>) => {
  let area = 0;
  points.forEach(([x, y], index) => {
    const [nx, ny] = points[(index + 1) % points.length];
    area += x * ny - nx * y;
  });
  const ordered = area >= 0 ? points : [...points].reverse();
  ordered.forEach(([x, y], index) =>
    index === 0 ? path.moveTo(x, y) : path.lineTo(x, y),
  );
  path.closePath();
};

const addCircle = (path: Path2D, { x, y, r }: Circle) => {
  path.moveTo(x + r, y);
  path.arc(x, y, r, 0, Math.PI * 2, false);
};

/** The tapered band between two circles. */
const addHull = (path: Path2D, a: Circle, b: Circle) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy) || 1;
  const nx = -dy / distance;
  const ny = dx / distance;
  addClockwise(path, [
    [a.x + nx * a.r, a.y + ny * a.r],
    [b.x + nx * b.r, b.y + ny * b.r],
    [b.x - nx * b.r, b.y - ny * b.r],
    [a.x - nx * a.r, a.y - ny * a.r],
  ]);
};

const projectBird = (
  state: BirdState,
  transform: BirdTransform,
  camera: Camera,
): { items: Projected[]; size: number; bounds: Bounds } | null => {
  const geometry = buildBird(state);
  const projector = createProjector(transform, camera);
  // Screen bounds of everything drawn, so full-canvas passes can be limited
  // to the bird.
  const bounds: Bounds = [Infinity, Infinity, -Infinity, -Infinity];
  const include = (x: number, y: number, radius = 0) => {
    bounds[0] = Math.min(bounds[0], x - radius);
    bounds[1] = Math.min(bounds[1], y - radius);
    bounds[2] = Math.max(bounds[2], x + radius);
    bounds[3] = Math.max(bounds[3], y + radius);
  };
  const project = (point: Vec3) => {
    const screen = projector.project(point);
    include(screen[0], screen[1]);
    return screen;
  };
  const toScreen = (point: Vec3) => project(projector.toCamera(point));
  const toCircle = (centre: Vec3, radius: number): Circle => {
    const [x, y, depth] = toScreen(centre);
    const r = (camera.focal * radius) / Math.max(depth, 1);
    include(x, y, r);
    return { x, y, depth, r };
  };

  // Body, neck and head: a dense chain of projected spheres joined by
  // tapered hulls, filled as one smooth silhouette.
  const spine = geometry.spine.map((sphere) =>
    toCircle(sphere.centre, sphere.radius),
  );
  if (spine.some((circle) => circle.depth < 4)) return null;
  const body = new Path2D();
  spine.forEach((circle, index) => {
    addCircle(body, circle);
    if (index > 0) addHull(body, spine[index - 1], circle);
  });

  // Surface details on the side that faces the camera.
  const facingOf = (point: Vec3, normal: Vec3) => {
    const position = projector.toCamera(point);
    const direction = sub(
      projector.toCamera([
        point[0] + normal[0],
        point[1] + normal[1],
        point[2] + normal[2],
      ]),
      position,
    );
    return -dot(direction, position) / (length(direction) * length(position));
  };
  const headCentre = geometry.head.centre;
  const eyes = geometry.eyes.flatMap((eye) => {
    const facing = facingOf(eye, sub(eye, headCentre));
    return facing > 0.05 ? [{ ...toCircle(eye, 0.5), facing }] : [];
  });
  const spangles = geometry.spangles.flatMap(({ point, normal }) => {
    const facing = facingOf(point, normal);
    return facing > 0.2 ? [{ ...toCircle(point, 0.2), facing }] : [];
  });

  // Beak: a slightly hooked cone.
  const [bx, by] = toScreen(geometry.beak.base);
  const [tx, ty, beakDepth] = toScreen(geometry.beak.tip);
  const beakRadius =
    (camera.focal * geometry.beak.radius) / Math.max(beakDepth, 1);
  const bdx = tx - bx;
  const bdy = ty - by;
  const beakLength = Math.hypot(bdx, bdy) || 1;
  const bnx = -bdy / beakLength;
  const bny = bdx / beakLength;
  const beak = new Path2D();
  beak.moveTo(bx + bnx * beakRadius, by + bny * beakRadius);
  beak.quadraticCurveTo(
    bx + bdx * 0.7 + bnx * beakRadius * 0.55,
    by + bdy * 0.7 + bny * beakRadius * 0.55,
    tx,
    ty,
  );
  beak.lineTo(bx - bnx * beakRadius, by - bny * beakRadius);
  beak.closePath();

  const extent = (circles: Circle[]): [[number, number], [number, number]] => {
    const top = Math.min(...circles.map((circle) => circle.y - circle.r));
    const bottom = Math.max(...circles.map((circle) => circle.y + circle.r));
    const x =
      circles.reduce((sum, circle) => sum + circle.x, 0) / circles.length;
    return [
      [x, top],
      [x, bottom],
    ];
  };
  const [bodyTop, bodyBottom] = extent(spine);
  const breast = spine[Math.round(spine.length * 0.55)];
  const face = spine[spine.length - 1];
  const items: Projected[] = [
    {
      kind: "body",
      depth: breast.depth,
      path: body,
      from: bodyTop,
      to: bodyBottom,
      facing: 1,
      eyes,
      spangles,
      head: toCircle(geometry.head.centre, geometry.head.radius),
    },
    {
      kind: "beak",
      depth: Math.min(face.depth, beakDepth) - 0.01,
      path: beak,
      from: [bx, by],
      to: [tx, ty],
      facing: 1,
    },
  ];

  // Wing leading edges: tapered, solid "arms" so the wing keeps its mass
  // even when seen edge-on.
  geometry.bones.forEach((bone) => {
    const a = toCircle(bone.from, bone.fromRadius);
    const c = toCircle(bone.to, bone.toRadius);
    if (a.depth < 2 || c.depth < 2) return;
    const path = new Path2D();
    addCircle(path, a);
    addCircle(path, c);
    addHull(path, a, c);
    items.push({
      kind: "covert",
      depth: (a.depth + c.depth) / 2 - 0.2,
      path,
      facing: 1,
    });
  });

  geometry.polygons.forEach((polygon) => {
    const cameraPoints = polygon.points.map(projector.toCamera);
    if (cameraPoints.some((point) => point[2] < 2)) return;
    const points = cameraPoints.map(project);
    const path = new Path2D();
    points.forEach(([x, y], index) =>
      index === 0 ? path.moveTo(x, y) : path.lineTo(x, y),
    );
    path.closePath();
    const depth =
      points.reduce((sum, point) => sum + point[2], 0) / points.length;

    const third = Math.floor(cameraPoints.length / 3);
    const normal = cross(
      sub(cameraPoints[third], cameraPoints[0]),
      sub(cameraPoints[third * 2], cameraPoints[0]),
    );
    const centroid = cameraPoints[third];
    const facing =
      Math.abs(dot(normal, centroid)) / (length(normal) * length(centroid));

    const from = polygon.base ? toScreen(polygon.base) : undefined;
    const to = polygon.tip ? toScreen(polygon.tip) : undefined;
    items.push({
      kind: polygon.kind,
      depth,
      path,
      from: from ? [from[0], from[1]] : undefined,
      to: to ? [to[0], to[1]] : undefined,
      facing,
    });
  });

  items.sort((a, b) => b.depth - a.depth);
  const wingspan = (camera.focal * 46) / Math.max(breast.depth, 1);
  return { items, size: wingspan, bounds };
};

/** Projected wingspan in CSS pixels, without drawing. */
export const birdScreenSize = (transform: BirdTransform, camera: Camera) => {
  const depth = transform.position[2];
  return depth > 1 ? (camera.focal * 46) / depth : Infinity;
};

export type DrawBirdOptions = {
  palette: BirdPalette;
  /** Perched: legs reach down to a branch at this screen y (CSS px). */
  perch?: { y: number };
  /** Earlier poses drawn faintly under the bird to suggest motion blur. */
  ghosts?: BirdState[];
  /** Low-resolution scratch canvas for the halo of back light. */
  glowCanvas?: HTMLCanvasElement;
  /** Strength of that halo, 0–1. */
  glow?: number;
  /** Strength of the blue gloss on the plumage, 0–1 (low against the sun). */
  sheen?: number;
  /** How much light shows through the flight feathers, 0–1. */
  translucency?: number;
  opacity?: number;
};

export const drawBird = (
  context: CanvasRenderingContext2D,
  state: BirdState,
  transform: BirdTransform,
  camera: Camera,
  {
    palette,
    perch,
    ghosts = [],
    glowCanvas,
    glow = 1,
    sheen = 1,
    translucency = 1,
    opacity = 1,
  }: DrawBirdOptions,
) => {
  const projected = projectBird(state, transform, camera);
  if (!projected) return;
  const { items, size, bounds } = projected;
  const detailed = size > 36;

  context.save();
  context.globalAlpha = opacity;

  if (perch) {
    // Legs and toes, behind the belly feathers: the far leg first.
    const projector = createProjector(transform, camera);
    const legs = ([1.3, -1.3] as const)
      .map((side) => {
        const point = projector.project(
          projector.toCamera([1.6, -3.7 + state.bob, side]),
        );
        return { side, x: point[0], y: point[1], depth: point[2] };
      })
      .sort((a, b) => b.depth - a.depth);
    legs.forEach((leg, index) => {
      const scale = camera.focal / Math.max(leg.depth, 1);
      const footX = leg.x - scale * 0.5;
      const footY = perch.y + scale * 0.2;
      context.strokeStyle = index === 0 ? "#040509" : palette.body;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = Math.max(1, scale * 0.34);
      context.beginPath();
      context.moveTo(leg.x, leg.y);
      context.lineTo(footX, footY - scale * 0.2);
      context.stroke();
      // Three toes forward around the branch, one behind.
      context.lineWidth = Math.max(0.8, scale * 0.24);
      context.beginPath();
      context.moveTo(footX, footY - scale * 0.2);
      context.quadraticCurveTo(
        footX - scale * 1.2,
        footY - scale * 0.4,
        footX - scale * 2,
        footY + scale * 0.25,
      );
      context.moveTo(footX, footY - scale * 0.2);
      context.lineTo(footX + scale * 1.3, footY + scale * 0.05);
      context.stroke();
    });
  }

  // Halo: light scattering around the silhouette.
  if (glowCanvas && size > 14 && glow > 0.01) {
    const glowContext = glowCanvas.getContext("2d");
    const factor = glowCanvas.width / context.canvas.width;
    if (glowContext) {
      glowContext.setTransform(1, 0, 0, 1, 0, 0);
      glowContext.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
      const ratio = context.getTransform().a;
      glowContext.setTransform(factor * ratio, 0, 0, factor * ratio, 0, 0);
      glowContext.fillStyle = palette.glow;
      items.forEach((item) => glowContext.fill(item.path));
      context.globalAlpha = opacity * 0.9 * glow;
      drawUpscaled(context, glowCanvas, bounds);
      context.globalAlpha = opacity;
    }
  }

  // Motion blur: earlier poses of the flight feathers, faint.
  if (detailed) {
    ghosts.forEach((ghost, index) => {
      const ghostProjection = projectBird(ghost, transform, camera);
      if (!ghostProjection) return;
      context.fillStyle = rgba(palette.featherBase, 0.18 / (index + 1));
      ghostProjection.items
        .filter((item) => item.kind === "primary" || item.kind === "secondary")
        .forEach((item) => context.fill(item.path));
    });
  }

  const edgeWidth = Math.max(0.5, size / 420);
  items.forEach((item) => {
    if (item.kind === "beak" && item.from && item.to) {
      const gradient = context.createLinearGradient(
        item.from[0],
        item.from[1],
        item.to[0],
        item.to[1],
      );
      gradient.addColorStop(0, palette.beakDark);
      gradient.addColorStop(0.45, palette.beakLight);
      gradient.addColorStop(1, palette.beakDark);
      context.fillStyle = gradient;
      context.fill(item.path);
      return;
    }
    if (item.kind === "body" || item.kind === "covert") {
      context.fillStyle = palette.body;
      context.fill(item.path);
      if (item.kind === "body" && size > 110 && glowCanvas) {
        // Back light catching the upper outline: fill the silhouette with the
        // rim colour, then cover it with a soft copy of itself shifted down,
        // drawn at low resolution so upscaling blurs its edge.
        const scratch = glowCanvas.getContext("2d");
        if (scratch) {
          const factor = glowCanvas.width / context.canvas.width;
          const ratio = context.getTransform().a;
          scratch.setTransform(1, 0, 0, 1, 0, 0);
          scratch.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
          scratch.setTransform(
            factor * ratio,
            0,
            0,
            factor * ratio,
            0,
            (size / 110) * factor * ratio,
          );
          scratch.fillStyle = palette.body;
          scratch.fill(item.path);
          context.save();
          context.clip(item.path);
          context.fillStyle = rgba(palette.edge, 0.34);
          context.fill(item.path);
          drawUpscaled(context, glowCanvas, bounds);
          context.restore();
        }
      }
      if (detailed && item.from && item.to && sheen > 0) {
        // Iridescent blue on the upper surfaces.
        const gradient = context.createLinearGradient(
          item.from[0],
          item.from[1],
          item.to[0],
          item.to[1],
        );
        gradient.addColorStop(0, palette.sheen);
        gradient.addColorStop(0.55, "rgba(0, 0, 0, 0)");
        context.globalAlpha = opacity * sheen;
        context.fillStyle = gradient;
        context.fill(item.path);
        context.globalAlpha = opacity;
      }
      if (detailed && item.head && sheen > 0) {
        // Gloss on the crown: the head reads as its own rounded form.
        const { x, y, r } = item.head;
        const gloss = context.createRadialGradient(
          x - r * 0.3,
          y - r * 0.45,
          r * 0.1,
          x,
          y,
          r * 1.05,
        );
        gloss.addColorStop(0, palette.sheen);
        gloss.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.save();
        context.clip(item.path);
        context.globalAlpha = opacity * sheen;
        context.fillStyle = gloss;
        context.beginPath();
        context.arc(x, y, r * 1.05, 0, Math.PI * 2);
        context.fill();
        // A soft shadow under the chin separates head from breast.
        const chin = context.createRadialGradient(
          x,
          y + r * 1.1,
          r * 0.2,
          x,
          y + r * 1.1,
          r * 1.1,
        );
        chin.addColorStop(0, "rgba(0, 0, 0, 0.35)");
        chin.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = chin;
        context.beginPath();
        context.arc(x, y + r * 1.1, r * 1.1, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      item.spangles?.forEach((spangle) => {
        if (size < 170) return;
        context.fillStyle = `rgba(120, 146, 255, ${(0.3 * spangle.facing * sheen).toFixed(3)})`;
        context.beginPath();
        context.ellipse(
          spangle.x,
          spangle.y,
          spangle.r,
          spangle.r * 0.7,
          0,
          0,
          Math.PI * 2,
        );
        context.fill();
      });
      item.eyes?.forEach((eye) => {
        if (eye.r < 0.9) return;
        context.fillStyle = "#040406";
        context.beginPath();
        context.arc(eye.x, eye.y, eye.r, 0, Math.PI * 2);
        context.fill();
        if (eye.r > 1.6) {
          context.globalAlpha = opacity * Math.min(1, eye.facing * 1.4);
          context.fillStyle = palette.eyeLight;
          context.beginPath();
          context.arc(
            eye.x - eye.r * 0.28,
            eye.y - eye.r * 0.3,
            eye.r * 0.26,
            0,
            Math.PI * 2,
          );
          context.fill();
          context.globalAlpha = opacity;
        }
      });
      return;
    }

    // Flight feathers: dark at the base, lit through toward the tip. Seen
    // edge-on they show no light through them and no bright rim.
    const through = (0.35 + 0.65 * item.facing) * translucency;
    if (detailed && item.from && item.to) {
      const gradient = context.createLinearGradient(
        item.from[0],
        item.from[1],
        item.to[0],
        item.to[1],
      );
      gradient.addColorStop(0, rgba(palette.featherBase, 0.97));
      gradient.addColorStop(0.55, rgba(palette.featherBase, 0.92));
      gradient.addColorStop(
        1,
        rgba(
          [
            palette.featherBase[0] +
              (palette.featherTip[0] - palette.featherBase[0]) * through,
            palette.featherBase[1] +
              (palette.featherTip[1] - palette.featherBase[1]) * through,
            palette.featherBase[2] +
              (palette.featherTip[2] - palette.featherBase[2]) * through,
          ],
          0.8,
        ),
      );
      context.fillStyle = gradient;
    } else {
      context.fillStyle = rgba(palette.featherBase, 0.95);
    }
    context.fill(item.path);
    if (detailed) {
      context.strokeStyle = rgba(palette.edge, 0.22 * Math.sqrt(item.facing));
      context.lineWidth = edgeWidth;
      context.stroke(item.path);
      if (item.from && item.to && size > 120) {
        // The feather shaft.
        context.beginPath();
        context.moveTo(item.from[0], item.from[1]);
        context.lineTo(item.to[0], item.to[1]);
        context.strokeStyle = `rgba(128, 116, 104, ${(0.26 * item.facing).toFixed(3)})`;
        context.lineWidth = Math.max(0.5, size / 700);
        context.stroke();
      }
    }
  });

  context.restore();
};
