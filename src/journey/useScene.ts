import { useLayoutEffect, useRef, type RefObject } from "react";
import { registerScene, type SceneCallback } from "./scrollTimeline";

/**
 * Registers an element as a scroll scene for the lifetime of the component.
 * The latest callback is always used without re-registering, and styles are
 * written directly to the DOM so scrolling never re-renders React.
 */
export const useScene = (
  ref: RefObject<HTMLElement | null>,
  callback: SceneCallback,
) => {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    return registerScene(element, (frame) => callbackRef.current(frame));
  }, [ref]);
};
