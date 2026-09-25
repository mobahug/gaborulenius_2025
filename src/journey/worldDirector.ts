import { isPinnedLayout, prefersReducedMotion } from "./device";
import { clamp, easeInOutSine, range } from "./math";
import { registerScene, type SceneFrame } from "./scrollTimeline";
import { NEURAL_DEPTH_END, world } from "./worldState";

/**
 * Drives the transitions between the post-portal worlds from the geometry of
 * the chapter wrappers, which exist before their (lazy) content loads. The
 * world is therefore identical however the visitor arrived at a position,
 * including navigation jumps over chapters that never rendered.
 */

/** The Explorer map's east-west track, as a multiple of the viewport width. */
export const EXPLORER_TRACK_VW = 280;

/** Progress across a pinned chapter entering the viewport and its pinned range. */
export const pinnedArrival = (frame: SceneFrame) => {
  const { viewport, top, height } = frame;
  const travel = viewport.vh + Math.max(1, height - viewport.vh);
  return clamp((viewport.y - (top - viewport.vh)) / travel);
};

/** How far along the Explorer trail the walker is (0–1). */
export const explorerWalk = (arrival: number) =>
  easeInOutSine(range(arrival, 0.4, 0.97));

/** Horizontal pan of the Explorer map in CSS pixels. */
export const explorerPanPx = (arrival: number, vw: number) =>
  explorerWalk(arrival) * ((EXPLORER_TRACK_VW / 100) * vw - vw * 1.02);

/** Whether the pinned desktop compositions are in use. */
export const usesPinnedLayout = () =>
  isPinnedLayout() && !prefersReducedMotion();

const byId = (id: string) => () => document.getElementById(id);

export const startWorldDirector = () => {
  const root = document.documentElement;

  const scenes = [
    registerScene(byId("neural-decompiler"), (frame) => {
      world.depth = prefersReducedMotion()
        ? Number(frame.pass > 0.5) * NEURAL_DEPTH_END
        : clamp(frame.pass * 1.15) * NEURAL_DEPTH_END;
    }),

    registerScene(byId("explorer"), (frame) => {
      if (prefersReducedMotion()) {
        world.contour = Number(frame.enter > 0.5);
        world.panX = 0;
        world.panY = 0;
        return;
      }
      if (!usesPinnedLayout()) {
        world.contour = easeInOutSine(range(frame.enter, 0.1, 0.9));
        world.panX = 0;
        world.panY = -frame.pass * 0.9;
        return;
      }
      const arrival = pinnedArrival(frame);
      world.contour = easeInOutSine(range(arrival, 0.12, 0.42));
      world.panX =
        explorerPanPx(arrival, frame.viewport.vw) / frame.viewport.vh;
      world.panY = 0;
    }),

    registerScene(byId("work"), (frame) => {
      if (prefersReducedMotion()) {
        world.network = Number(frame.enter > 0.5);
      } else if (!usesPinnedLayout()) {
        world.network = easeInOutSine(range(frame.enter, 0.05, 0.85));
      } else {
        world.network = easeInOutSine(range(pinnedArrival(frame), 0.1, 0.4));
      }
    }),

    registerScene(byId("skills"), (frame) => {
      world.seeds = prefersReducedMotion()
        ? Number(frame.enter > 0.5)
        : easeInOutSine(range(frame.enter, 0, 0.8));
    }),

    registerScene(byId("contact"), (frame) => {
      world.horizon = prefersReducedMotion()
        ? Number(frame.enter > 0.5)
        : easeInOutSine(range(frame.enter, 0.05, 0.85));
      root.style.setProperty("--horizon", world.horizon.toFixed(3));
    }),
  ];

  return () => scenes.forEach((unregister) => unregister());
};
