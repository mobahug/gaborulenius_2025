import { clamp } from "./math";

/**
 * The scroll position is the master timeline of the page. This module owns
 * the single scroll/resize listener and flushes every registered scene once
 * per animation frame, always in a read-then-write order. Scenes derive their
 * whole visual state from the progress values they receive, so scrolling
 * backwards replays every effect in reverse and jumping (for example through
 * the navigation) lands in a consistent state.
 */

export type Viewport = {
  y: number;
  vw: number;
  vh: number;
  maxY: number;
};

export type SceneFrame = {
  viewport: Viewport;
  /** Absolute document offset of the scene element. */
  top: number;
  height: number;
  /** 0 when the element's top meets the viewport top, 1 when its bottom meets the viewport bottom. */
  pin: number;
  /** 0 when the top enters at the viewport bottom, 1 when the bottom leaves at the viewport top. */
  pass: number;
  /** 0 when the top enters at the viewport bottom, 1 when the top reaches the viewport top. */
  enter: number;
  /** 0 when the bottom reaches the viewport bottom, 1 when the bottom reaches the viewport top. */
  exit: number;
  /** True while the element is within one viewport of being visible. */
  near: boolean;
};

export type SceneCallback = (frame: SceneFrame) => void;
export type FrameCallback = (viewport: Viewport) => void;

type SceneTarget = HTMLElement | (() => HTMLElement | null);

type Scene = {
  target: SceneTarget;
  callback: SceneCallback;
};

const scenes = new Set<Scene>();
const afterFrameCallbacks = new Set<FrameCallback>();
let frameId: number | null = null;
let listening = false;

const resolveTarget = (target: SceneTarget) =>
  typeof target === "function" ? target() : target;

export const readViewport = (): Viewport => {
  const vh = window.innerHeight;
  return {
    y: window.scrollY,
    vw: document.documentElement.clientWidth || window.innerWidth,
    vh,
    maxY: Math.max(0, document.documentElement.scrollHeight - vh),
  };
};

export const computeSceneFrame = (
  viewport: Viewport,
  top: number,
  height: number,
): SceneFrame => {
  const { y, vh } = viewport;
  return {
    viewport,
    top,
    height,
    pin: clamp((y - top) / Math.max(1, height - vh)),
    pass: clamp((y + vh - top) / Math.max(1, height + vh)),
    enter: clamp((y + vh - top) / Math.max(1, vh)),
    exit: clamp((y - (top + height - vh)) / Math.max(1, vh)),
    near: y + 2 * vh > top && y - vh < top + height,
  };
};

const measure = (element: HTMLElement, viewport: Viewport) => {
  const rect = element.getBoundingClientRect();
  return { top: rect.top + viewport.y, height: rect.height };
};

const flush = () => {
  frameId = null;
  const viewport = readViewport();

  // Read phase: measure every scene before any scene writes styles.
  const measured: Array<[Scene, number, number]> = [];
  scenes.forEach((scene) => {
    const element = resolveTarget(scene.target);
    if (!element) return;
    const { top, height } = measure(element, viewport);
    measured.push([scene, top, height]);
  });

  // Write phase.
  measured.forEach(([scene, top, height]) => {
    scene.callback(computeSceneFrame(viewport, top, height));
  });
  afterFrameCallbacks.forEach((callback) => callback(viewport));
};

export const requestSceneFrame = () => {
  if (frameId !== null || typeof window === "undefined") return;
  frameId = window.requestAnimationFrame(flush);
};

/**
 * Runs a pending scene flush synchronously. The WebGL loop calls this before
 * drawing so the shader and the DOM always render the same scroll position
 * in the same frame.
 */
export const flushPendingSceneFrame = () => {
  if (frameId === null) return;
  window.cancelAnimationFrame(frameId);
  flush();
};

const startListening = () => {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("scroll", requestSceneFrame, { passive: true });
  window.addEventListener("resize", requestSceneFrame);
  window.addEventListener("orientationchange", requestSceneFrame);
  window.addEventListener("load", requestSceneFrame);
  // Lazy sections change the document height; re-run so progress stays exact.
  if ("ResizeObserver" in window) {
    new ResizeObserver(requestSceneFrame).observe(document.documentElement);
  }
};

/**
 * Registers a scene. The callback runs immediately (so the first paint is
 * already correct) and then on every frame in which the page scrolls or
 * resizes.
 */
export const registerScene = (target: SceneTarget, callback: SceneCallback) => {
  startListening();
  const scene: Scene = { target, callback };
  scenes.add(scene);

  const element = resolveTarget(target);
  if (element) {
    const viewport = readViewport();
    const { top, height } = measure(element, viewport);
    callback(computeSceneFrame(viewport, top, height));
  }
  requestSceneFrame();

  return () => {
    scenes.delete(scene);
  };
};

/** Runs after all scenes have written their state for the frame. */
export const onAfterSceneFrame = (callback: FrameCallback) => {
  startListening();
  afterFrameCallbacks.add(callback);
  requestSceneFrame();
  return () => {
    afterFrameCallbacks.delete(callback);
  };
};
