import { useEffect, useRef, useState } from "react";
import { useThemeToggle } from "../hooks/useThemeToggle";
import { getQualityTier, hasFinePointer, prefersReducedMotion } from "./device";
import { getJungleVideo, getJungleVideoVersion } from "./jungleVideo";
import { lerp } from "./math";
import { flushPendingSceneFrame, onAfterSceneFrame } from "./scrollTimeline";
import { getStageSize } from "./stageSize";
import { needsShaderWorld, world } from "./worldState";
import { WorldRenderer } from "./world/WorldRenderer";

type Rgb = [number, number, number];

// Flat colours per world for the CSS fallback when WebGL2 is unavailable.
const FALLBACK: Record<"light" | "dark", Record<string, Rgb>> = {
  light: {
    strange: [8, 22, 18],
    neural: [6, 11, 9],
    map: [31, 35, 23],
    network: [6, 14, 13],
    seeds: [9, 14, 11],
    horizon: [120, 92, 60],
  },
  dark: {
    strange: [5, 11, 17],
    neural: [3, 5, 11],
    map: [13, 18, 23],
    network: [4, 9, 16],
    seeds: [4, 8, 13],
    horizon: [30, 45, 56],
  },
};

const mixRgb = (from: Rgb, to: Rgb, t: number): Rgb => [
  lerp(from[0], to[0], t),
  lerp(from[1], to[1], t),
  lerp(from[2], to[2], t),
];

const fallbackColor = (theme: "light" | "dark") => {
  const palette = FALLBACK[theme];
  let color = mixRgb(palette.strange, palette.neural, world.neural);
  color = mixRgb(color, palette.map, world.contour);
  color = mixRgb(color, palette.network, world.network);
  color = mixRgb(color, palette.seeds, world.seeds);
  color = mixRgb(color, palette.horizon, world.horizon);
  return `rgb(${color.map((value) => Math.round(value)).join(", ")})`;
};

/**
 * The fixed WebGL layer behind the post-portal chapters. It only renders
 * while one of those worlds is on screen and the tab is visible, synchronises
 * with the DOM choreography frame by frame, and lowers its resolution when
 * frames get slow.
 */
const WorldCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const { selectedTheme } = useThemeToggle();
  const themeRef = useRef(selectedTheme);
  const requestDrawRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    themeRef.current = selectedTheme;
    requestDrawRef.current();
  }, [selectedTheme]);

  useEffect(() => {
    if (!failed) return;
    return onAfterSceneFrame(() => {
      const element = fallbackRef.current;
      if (!element) return;
      const visible = needsShaderWorld();
      element.style.visibility = visible ? "visible" : "hidden";
      if (visible) {
        element.style.backgroundColor = fallbackColor(themeRef.current);
      }
    });
  }, [failed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || failed) return;

    const tier = getQualityTier();
    let renderer: WorldRenderer;
    try {
      renderer = new WorldRenderer(canvas, tier);
    } catch (error) {
      if (import.meta.env.DEV) console.warn("WorldCanvas fallback:", error);
      setFailed(true);
      return;
    }

    const reduced = prefersReducedMotion();
    const pointerParallax = hasFinePointer() && !reduced;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let frameId: number | null = null;
    let running = false;
    let lost = false;
    let time = 0;
    let lastFrame = 0;
    let lastActivity = performance.now();
    let dark = themeRef.current === "dark" ? 1 : 0;
    let lastVideoVersion = -1;
    let lastVideoTime = -1;
    let videoUploaded = false;
    let skippedFrames = 0;
    let slowFrames = 0;
    let fastFrames = 0;

    const resize = () => {
      const { width, height } = getStageSize();
      renderer.resize(width, height);
    };
    resize();

    const syncVideo = () => {
      if (world.strange <= 0.001 || world.neural >= 0.999) return;
      const video = getJungleVideo();
      const version = getJungleVideoVersion();
      const currentTime = video?.currentTime ?? -1;
      if (
        !videoUploaded ||
        version !== lastVideoVersion ||
        Math.abs(currentTime - lastVideoTime) > 0.001
      ) {
        renderer.uploadVideoFrame(video);
        videoUploaded = Boolean(video && video.readyState >= 2);
        lastVideoVersion = version;
        lastVideoTime = currentTime;
      }
    };

    const draw = () => {
      syncVideo();
      renderer.render({
        time,
        dark,
        strange: world.strange,
        head: world.head,
        eye: [world.eyeX, world.eyeY, world.eyeR],
        iris: world.iris,
        pupil: world.pupil,
        tunnel: world.tunnel,
        neural: world.neural,
        depth: world.depth,
        contour: world.contour,
        pan: [world.panX, world.panY],
        network: world.network,
        seeds: world.seeds,
        horizon: world.horizon,
        pointer: [pointer.x, pointer.y],
      });
    };

    const governor = (delta: number) => {
      if (delta > 0.028) {
        slowFrames += 1;
        fastFrames = 0;
      } else if (delta < 0.018) {
        fastFrames += 1;
        slowFrames = Math.max(0, slowFrames - 1);
      }
      if (slowFrames > 24) {
        slowFrames = 0;
        renderer.adjustScale("down");
      } else if (fastFrames > 240) {
        fastFrames = 0;
        renderer.adjustScale("up");
      }
    };

    const loop = (now: number) => {
      frameId = null;
      if (!running || lost) return;
      flushPendingSceneFrame();
      const delta = lastFrame
        ? Math.min(0.1, (now - lastFrame) / 1000)
        : 1 / 60;
      lastFrame = now;
      const targetDark = themeRef.current === "dark" ? 1 : 0;
      dark += (targetDark - dark) * (1 - Math.exp(-delta * 6));
      pointer.x += (pointer.targetX - pointer.x) * (1 - Math.exp(-delta * 4));
      pointer.y += (pointer.targetY - pointer.y) * (1 - Math.exp(-delta * 4));

      if (reduced) {
        draw();
        // Render on demand only: keep going while the theme cross-fades.
        if (Math.abs(targetDark - dark) > 0.002) {
          frameId = window.requestAnimationFrame(loop);
        } else {
          running = false;
        }
        return;
      }

      time += delta;
      // Ambient motion only needs ~30 fps once the visitor stops scrolling,
      // and ~15 fps once they have been reading for a while.
      const still = now - lastActivity;
      const skip = still > 8000 ? 3 : still > 1200 ? 1 : 0;
      if (skippedFrames < skip) {
        skippedFrames += 1;
      } else {
        skippedFrames = 0;
        draw();
        if (skip === 0) governor(delta);
      }
      frameId = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (lost || document.hidden) return;
      canvas.style.visibility = "visible";
      if (running) return;
      running = true;
      lastFrame = 0;
      frameId = window.requestAnimationFrame(loop);
    };

    const stop = (hide: boolean) => {
      running = false;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      if (hide) canvas.style.visibility = "hidden";
    };

    requestDrawRef.current = () => {
      if (needsShaderWorld()) start();
    };

    const unsubscribe = onAfterSceneFrame(() => {
      lastActivity = performance.now();
      if (needsShaderWorld()) {
        start();
      } else if (running || canvas.style.visibility !== "hidden") {
        stop(true);
      }
    });

    const onResize = () => {
      resize();
      requestDrawRef.current();
    };
    const onVisibility = () => {
      if (document.hidden) stop(false);
      else requestDrawRef.current();
    };
    const onPointerMove = (event: PointerEvent) => {
      pointer.targetX = event.clientX / window.innerWidth - 0.5;
      pointer.targetY = 0.5 - event.clientY / window.innerHeight;
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      stop(true);
    };
    const onContextRestored = () => {
      try {
        renderer = new WorldRenderer(canvas, tier);
        lost = false;
        videoUploaded = false;
        resize();
        requestDrawRef.current();
      } catch {
        setFailed(true);
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    if (pointerParallax) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    if (import.meta.env.DEV) {
      (window as Window & { __journeyWorld?: typeof world }).__journeyWorld =
        world;
    }

    return () => {
      unsubscribe();
      stop(true);
      requestDrawRef.current = () => undefined;
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      if (pointerParallax)
        window.removeEventListener("pointermove", onPointerMove);
      if (!lost) renderer.dispose();
    };
  }, [failed]);

  if (failed) {
    return (
      <div
        ref={fallbackRef}
        className="journey-world journey-world--fallback"
      />
    );
  }

  return <canvas ref={canvasRef} className="journey-world" />;
};

export default WorldCanvas;
