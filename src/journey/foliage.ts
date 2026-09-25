import { createRandom } from "./math";

/**
 * Procedural fern fronds for the canopy silhouettes. They are generated once
 * from fixed seeds, so every visit gets the same composition, and they cost
 * no network request.
 */

type Point = [number, number];

const toPolygon = (points: Point[]) =>
  `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;

export type FrondShape = {
  length: number;
  leaflets: number;
  leafletLength: number;
  leafletWidth: number;
  /** Sideways bend of the rachis tip as a fraction of the length. */
  bend: number;
  seed: number;
};

/** A fern/palm frond growing from (0, 0) toward −y with paired leaflets. */
export const frondPath = ({
  length,
  leaflets,
  leafletLength,
  leafletWidth,
  bend,
  seed,
}: FrondShape) => {
  const random = createRandom(seed);
  const rachisAt = (t: number): Point => [bend * length * t * t, -length * t];
  const tangentAt = (t: number): Point => {
    const dx = 2 * bend * length * t;
    const dy = -length;
    const norm = Math.hypot(dx, dy);
    return [dx / norm, dy / norm];
  };

  const parts: string[] = [];

  // Rachis as a tapered sliver.
  const rachis: Point[] = [];
  const rachisBack: Point[] = [];
  for (let index = 0; index <= 16; index += 1) {
    const t = index / 16;
    const [x, y] = rachisAt(t);
    const [tx, ty] = tangentAt(t);
    const half = leafletWidth * 0.12 * (1 - t * 0.85);
    rachis.push([x - ty * half, y + tx * half]);
    rachisBack.push([x + ty * half, y - tx * half]);
  }
  parts.push(toPolygon([...rachis, ...rachisBack.reverse()]));

  for (let index = 0; index < leaflets; index += 1) {
    const t = 0.08 + (index / leaflets) * 0.9;
    const [bx, by] = rachisAt(t);
    const [tx, ty] = tangentAt(t);
    const taper = 1 - Math.pow(t, 1.6) * 0.75;
    [-1, 1].forEach((side) => {
      const angle = (0.95 + random() * 0.3) * side;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      // Leaflet direction: the tangent rotated towards the side, drooping.
      const dirX = tx * cos - ty * sin;
      const dirY = tx * sin + ty * cos + 0.35;
      const dirNorm = Math.hypot(dirX, dirY);
      const ux = dirX / dirNorm;
      const uy = dirY / dirNorm;
      const nx = -uy;
      const ny = ux;
      const leafLength = leafletLength * taper * (0.85 + random() * 0.3);
      const halfWidth = leafletWidth * taper * 0.5;
      const at = (along: number, offset: number): Point => [
        bx + ux * leafLength * along + nx * offset,
        by + uy * leafLength * along + ny * offset,
      ];
      parts.push(
        toPolygon([
          at(0, 0),
          at(0.25, halfWidth * 0.9),
          at(0.6, halfWidth * 0.75),
          at(1, 0),
          at(0.6, -halfWidth * 0.55),
          at(0.25, -halfWidth * 0.7),
        ]),
      );
    });
  }

  return parts.join("");
};
