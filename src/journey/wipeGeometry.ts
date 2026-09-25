/**
 * Geometry of the wing that sweeps past the lens in the portal. The wing
 * travels along DIRECTION; everything behind its trailing edge already shows
 * the new world, everything ahead of it still shows the jungle.
 */

const rawDirection = { x: -0.37, y: 0.93 };
const length = Math.hypot(rawDirection.x, rawDirection.y);

export const WIPE_DIRECTION = {
  x: rawDirection.x / length,
  y: rawDirection.y / length,
};

/** Wing depth along the sweep direction, relative to the viewport diagonal. */
export const WING_DEPTH_RATIO = 0.46;

type Point = [number, number];

const project = ([x, y]: Point) => x * WIPE_DIRECTION.x + y * WIPE_DIRECTION.y;

const corners = (vw: number, vh: number): Point[] => [
  [0, 0],
  [vw, 0],
  [vw, vh],
  [0, vh],
];

export const getWipeMetrics = (vw: number, vh: number) => {
  const projections = corners(vw, vh).map(project);
  const min = Math.min(...projections);
  const max = Math.max(...projections);
  const diagonal = Math.hypot(vw, vh);
  const wingDepth = diagonal * WING_DEPTH_RATIO;
  return { min, max, diagonal, wingDepth };
};

/**
 * Projection (along the sweep direction) of the wing's trailing edge for a
 * wipe progress of 0–1. At 0 the wing is entirely above the viewport; at 1
 * its trailing edge has left the far corner.
 */
export const getTrailingEdge = (wipe: number, vw: number, vh: number) => {
  const { min, max, wingDepth } = getWipeMetrics(vw, vh);
  return min - wingDepth + wipe * (max - min + wingDepth);
};

/**
 * Clips the viewport rectangle to one side of the trailing edge and returns
 * a CSS `clip-path` polygon, or null when nothing remains.
 */
export const getWipeClipPath = (
  edge: number,
  vw: number,
  vh: number,
  keep: "ahead" | "behind",
) => {
  const inside = (point: Point) =>
    keep === "ahead" ? project(point) >= edge : project(point) <= edge;
  const points: Point[] = [];
  const rectangle = corners(vw, vh);

  rectangle.forEach((current, index) => {
    const next = rectangle[(index + 1) % rectangle.length];
    const currentInside = inside(current);
    const nextInside = inside(next);
    if (currentInside) points.push(current);
    if (currentInside !== nextInside) {
      const from = project(current);
      const to = project(next);
      const t = (edge - from) / (to - from);
      points.push([
        current[0] + (next[0] - current[0]) * t,
        current[1] + (next[1] - current[1]) * t,
      ]);
    }
  });

  if (points.length < 3) return null;
  return `polygon(${points
    .map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`)
    .join(", ")})`;
};
