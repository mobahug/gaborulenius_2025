import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const WIDE_LAYOUT_QUERY = "(min-width: 900px)";
// The pinned horizontal chapters (the Explorer map, the Work topology) need
// room in both directions; shorter windows get the stacked compositions.
const PINNED_LAYOUT_QUERY = "(min-width: 900px) and (min-height: 600px)";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

const matches = (query: string) =>
  typeof window !== "undefined" && window.matchMedia(query).matches;

const subscribeToQuery = (query: string) => (onChange: () => void) => {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};

export const prefersReducedMotion = () => matches(REDUCED_MOTION_QUERY);

/** Desktop compositions start at MUI's `md` breakpoint. */
export const isWideLayout = () => matches(WIDE_LAYOUT_QUERY);

export const isPinnedLayout = () => matches(PINNED_LAYOUT_QUERY);

export const hasFinePointer = () => matches(FINE_POINTER_QUERY);

export const onReducedMotionChange = subscribeToQuery(REDUCED_MOTION_QUERY);
export const onWideLayoutChange = subscribeToQuery(WIDE_LAYOUT_QUERY);
export const onPinnedLayoutChange = subscribeToQuery(PINNED_LAYOUT_QUERY);

export const useReducedMotion = () =>
  useSyncExternalStore(
    onReducedMotionChange,
    prefersReducedMotion,
    () => false,
  );

export const useWideLayout = () =>
  useSyncExternalStore(onWideLayoutChange, isWideLayout, () => true);

export const usePinnedLayout = () =>
  useSyncExternalStore(onPinnedLayoutChange, isPinnedLayout, () => true);

export type QualityTier = "low" | "medium" | "high";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/**
 * A coarse GPU/CPU budget used to size particle counts and the WebGL
 * render target. Phones and low-memory devices get the lightest variant.
 */
export const getQualityTier = (): QualityTier => {
  if (typeof window === "undefined") return "medium";
  const hints = navigator as NavigatorWithHints;
  const cores = hints.hardwareConcurrency ?? 4;
  const memory = hints.deviceMemory ?? 8;
  const coarse = matches("(pointer: coarse)");
  const smallScreen = Math.min(window.screen.width, window.screen.height) < 820;

  if (hints.connection?.saveData) return "low";
  if ((coarse && smallScreen) || memory <= 2 || cores <= 2) return "low";
  if (coarse || memory <= 4 || cores <= 4) return "medium";
  return "high";
};
