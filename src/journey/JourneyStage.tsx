import React, { useEffect, useRef, useState } from "react";
import DeferredVideoScroller from "../components/DeferredVideoScroller";
import { prefersReducedMotion } from "./device";
import { clamp, smoothstep } from "./math";
import { PORTAL_BEATS } from "./portalBeats";
import { onAfterSceneFrame, registerScene } from "./scrollTimeline";
import { setStageSize } from "./stageSize";
import { getTrailingEdge, getWipeClipPath } from "./wipeGeometry";
import { startWorldDirector } from "./worldDirector";
import { world } from "./worldState";
import "./journey.css";

const WorldCanvas = React.lazy(() => import("./WorldCanvas"));

/**
 * The fixed background of the whole journey: the jungle walk video (with
 * dusk and the wing-wipe clip) above the WebGL world that replaces it after
 * the portal. The stage director here derives the jungle's state from the
 * positions of the Trail and the portal chapters.
 */
const JourneyStage = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const jungleRef = useRef<HTMLDivElement>(null);
  const duskRef = useRef<HTMLDivElement>(null);
  const [canvasWanted, setCanvasWanted] = useState(false);
  const canvasWantedRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const updateSize = () =>
      setStageSize(stage.clientWidth, stage.clientHeight);
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const root = document.documentElement;

    const wantCanvas = () => {
      if (canvasWantedRef.current) return;
      canvasWantedRef.current = true;
      setCanvasWanted(true);
    };

    // The jungle walk runs from the top of the page to the moment the wing
    // passes the lens.
    const unregisterPortal = registerScene(
      () => document.getElementById("portal"),
      (frame) => {
        const range = Math.max(1, frame.height - frame.viewport.vh);
        const wipeStart = frame.top + PORTAL_BEATS.pass[0] * range;
        world.video = reduced
          ? 0
          : clamp(frame.viewport.y / Math.max(1, wipeStart));
        if (frame.viewport.y > frame.top - 3 * frame.viewport.vh) wantCanvas();
      },
    );

    // Dusk falls while the visitor walks the career trail.
    const unregisterTrail = registerScene(
      () => document.getElementById("experience"),
      (frame) => {
        world.dusk = smoothstep(0.15, 0.85, frame.pass);
      },
    );

    const stopWorldDirector = startWorldDirector();

    const unsubscribe = onAfterSceneFrame(({ vw, vh }) => {
      const jungle = jungleRef.current;
      const dusk = duskRef.current;
      if (dusk) dusk.style.opacity = (world.dusk * 0.9).toFixed(3);

      if (jungle) {
        if (world.wipe <= 0.0001) {
          jungle.style.clipPath = "";
          jungle.style.visibility = "";
        } else if (world.wipe >= 0.9999) {
          jungle.style.clipPath = "";
          jungle.style.visibility = "hidden";
        } else {
          const edge = getTrailingEdge(world.wipe, vw, vh);
          jungle.style.clipPath =
            getWipeClipPath(edge, vw, vh, "ahead") ?? "inset(50%)";
          jungle.style.visibility = "";
        }
      }

      root.style.setProperty("--jungle-presence", (1 - world.wipe).toFixed(3));
      root.style.setProperty(
        "--clearing-presence",
        Math.max(1 - world.wipe, world.horizon).toFixed(3),
      );
    });

    return () => {
      unregisterPortal();
      unregisterTrail();
      stopWorldDirector();
      unsubscribe();
    };
  }, []);

  return (
    <div ref={stageRef} className="journey-stage" aria-hidden="true">
      {canvasWanted ? (
        <React.Suspense fallback={null}>
          <WorldCanvas />
        </React.Suspense>
      ) : null}
      <div ref={jungleRef} className="journey-jungle">
        <DeferredVideoScroller />
        <div ref={duskRef} className="journey-dusk" />
      </div>
    </div>
  );
};

export default JourneyStage;
