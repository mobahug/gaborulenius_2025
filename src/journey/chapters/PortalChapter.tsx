import { useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { BIRD_PALETTES, birdScreenSize, drawBird } from "../bird/drawBird";
import { FLIGHT_END, flightAt } from "../bird/flight";
import {
  LENS_WING_BOUNDS,
  LENS_WING_LEADING,
  LENS_WING_TRAILING,
  paintLensWing,
} from "../bird/lensWing";
import { flapPose } from "../bird/birdRig";
import { prefersReducedMotion } from "../device";
import {
  bump,
  easeInCubic,
  easeInOutSine,
  easeOutCubic,
  expLerp,
  range,
  smoothstep,
  splineKeyframes,
  type Keyframe,
} from "../math";
import { PORTAL_BEATS } from "../portalBeats";
import type { SceneFrame } from "../scrollTimeline";
import { getStageSize } from "../stageSize";
import { useScene } from "../useScene";
import {
  WIPE_DIRECTION,
  getTrailingEdge,
  getWipeMetrics,
} from "../wipeGeometry";
import { world } from "../worldState";
import "./chapters.css";

const EYE_X: Keyframe[] = [
  [0.36, 0.43],
  [0.62, 0.46],
  [0.8, 0.5],
  [1, 0.5],
];
const EYE_Y: Keyframe[] = [
  [0.36, 0.47],
  [0.62, 0.485],
  [0.8, 0.5],
  [1, 0.5],
];

// The reduced-motion composition: the bird's head in the strange jungle.
// The head itself (with its eye) is drawn by the world shader.
const STILL_PROGRESS = 0.6;

const resolveProgress = (frame: SceneFrame, reduced: boolean) => {
  if (!reduced) return frame.pin;
  if (frame.enter < 0.5) return 0;
  if (frame.exit > 0.5) return 1;
  return STILL_PROGRESS;
};

type BirdCanvas = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  glow: HTMLCanvasElement;
};

// The paused bird eases into a glide over this long (ms), after this much
// stillness (ms).
const REST_DELAY = 160;
const REST_DURATION = 450;

const readTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/**
 * "The Eye" — the signature transition from the jungle into the neural
 * world. A bird flies out of the light toward the camera, its near wing
 * sweeps across the lens and reveals the same jungle re-lit as a strange,
 * glowing place, the bird looks back, and the camera dollies into its eye
 * and through the pupil.
 */
const PortalChapter = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const birdCanvasRef = useRef<HTMLCanvasElement>(null);
  const lensCanvasRef = useRef<HTMLCanvasElement>(null);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const birdRef = useRef<BirdCanvas | null>(null);
  const lensKeyRef = useRef("");
  // Scroll-driven flight state, plus the time-based ease into a glide.
  const flightRef = useRef({
    progress: -1,
    movedAt: 0,
    rest: 0,
    restAt: 0,
    lastPhase: Number.NaN,
    blur: -1,
    idleFrame: 0,
  });

  // Draws the flying bird for a progress; returns false when it is not shown.
  const drawFlight = (p: number) => {
    const canvas = birdCanvasRef.current;
    if (!canvas) return false;
    const flight = flightRef.current;
    const visible = !prefersReducedMotion() && p > 0 && p < FLIGHT_END;
    if (!visible) {
      if (canvas.width !== 0) {
        // Release the backing store while the bird is off stage.
        canvas.width = 0;
        canvas.height = 0;
        canvas.style.display = "none";
        birdRef.current = null;
      }
      return false;
    }

    const { width: vw, height: vh } = getStageSize();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.round(vw * ratio);
    const height = Math.round(vh * ratio);
    let bird = birdRef.current;
    if (!bird || canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.display = "";
      const context = canvas.getContext("2d");
      if (!context) return false;
      const glow = bird?.glow ?? document.createElement("canvas");
      glow.width = Math.max(1, Math.round(width / 6));
      glow.height = Math.max(1, Math.round(height / 6));
      bird = { canvas, context, glow };
      birdRef.current = bird;
    }

    const frame = flightAt(p, vw, vh, flight.rest);
    const { context } = bird;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    // The bird comes out of the light: a soft bloom around it while it is
    // still far away in the shaft.
    const bloom = range(p, 0, 0.025) * (1 - smoothstep(0.03, 0.2, p));
    if (bloom > 0.01) {
      const [x, y, z] = frame.transform.position;
      const { focal, centreX, centreY } = frame.camera;
      const sx = centreX + (focal * x) / z;
      const sy = centreY - (focal * y) / z;
      const radius = vh * 0.18;
      const tint = readTheme() === "dark" ? "170, 210, 255" : "255, 226, 160";
      const light = context.createRadialGradient(sx, sy, 0, sx, sy, radius);
      light.addColorStop(0, `rgba(${tint}, ${(0.3 * bloom).toFixed(3)})`);
      light.addColorStop(0.4, `rgba(${tint}, ${(0.1 * bloom).toFixed(3)})`);
      light.addColorStop(1, `rgba(${tint}, 0)`);
      context.fillStyle = light;
      context.fillRect(sx - radius, sy - radius, radius * 2, radius * 2);
    }

    // Motion blur spans the part of the wingbeat covered since the last frame.
    const swept = Number.isNaN(flight.lastPhase)
      ? 0
      : Math.min(0.3, Math.abs(frame.phase - flight.lastPhase));
    const direction = frame.phase >= flight.lastPhase ? 1 : -1;
    flight.lastPhase = frame.phase;
    const ghosts =
      swept > 0.02 && frame.flapping > 0.3
        ? [0.45, 0.9].map((share) => ({
            ...frame.state,
            pose: flapPose(frame.phase - direction * swept * share),
          }))
        : [];

    drawBird(context, frame.state, frame.transform, frame.camera, {
      palette: BIRD_PALETTES[readTheme()],
      ghosts,
      glowCanvas: bird.glow,
      glow: frame.glow,
      opacity: frame.opacity,
    });

    // Depth of field: the bird softens as it rushes past the lens.
    const size = birdScreenSize(frame.transform, frame.camera);
    const blur = Math.round(smoothstep(650, 1700, size) * 60) / 10;
    if (blur !== flight.blur) {
      flight.blur = blur;
      canvas.style.filter = blur > 0 ? `blur(${blur}px)` : "";
    }
    return true;
  };

  // Eases the wings into a glide once scrolling pauses.
  const settle = (now: number) => {
    const flight = flightRef.current;
    flight.idleFrame = 0;
    const flying = flight.progress > 0 && flight.progress < FLIGHT_END;
    if (!flying || prefersReducedMotion()) return;
    const elapsed = now - flight.restAt;
    flight.restAt = now;
    if (now - flight.movedAt > REST_DELAY && flight.rest < 1) {
      flight.rest = Math.min(1, flight.rest + elapsed / REST_DURATION);
      drawFlight(flight.progress);
    }
    if (flight.rest < 1) flight.idleFrame = requestAnimationFrame(settle);
  };

  useEffect(() => {
    const flight = flightRef.current;
    return () => cancelAnimationFrame(flight.idleFrame);
  }, []);

  // Paints the close-up wing for the current viewport and theme.
  const prepareLens = (vw: number, vh: number, scale: number) => {
    const lens = lensCanvasRef.current;
    if (!lens) return;
    const theme = readTheme();
    const key = `${vw}x${vh}:${theme}`;
    if (lensKeyRef.current === key) return;
    lensKeyRef.current = key;
    paintLensWing(lens, BIRD_PALETTES[theme], scale);
    const { uMin, uMax, vMin, vMax } = LENS_WING_BOUNDS;
    lens.style.width = `${((uMax - uMin) * scale).toFixed(1)}px`;
    lens.style.height = `${((vMax - vMin) * scale).toFixed(1)}px`;
  };

  useScene(sectionRef, (frame) => {
    const reduced = prefersReducedMotion();
    const p = resolveProgress(frame, reduced);
    const { width: vw, height: vh } = getStageSize();
    const minSide = Math.min(vw, vh);
    const diagonal = Math.hypot(vw, vh);
    const [passStart, passEnd] = PORTAL_BEATS.pass;

    // --- The bird flying toward the camera.
    const flight = flightRef.current;
    if (p !== flight.progress) {
      flight.progress = p;
      flight.movedAt = performance.now();
      flight.rest = Math.max(0, flight.rest - 0.34);
    }
    if (drawFlight(p) && !flight.idleFrame) {
      flight.restAt = performance.now();
      flight.idleFrame = requestAnimationFrame(settle);
    }

    // --- The near wing passing the lens: its trailing edge is the wipe. It
    // enters briskly, right as the bird rushes out over the top of the frame,
    // then slows as it uncovers the new world.
    const sweep = range(p, passStart, passEnd);
    const wipe = reduced
      ? p >= STILL_PROGRESS - 0.001
        ? 1
        : 0
      : sweep - (0.45 * Math.sin(2 * Math.PI * sweep)) / (2 * Math.PI);
    world.wipe = wipe;
    const edge = getTrailingEdge(wipe, vw, vh);

    const lens = lensCanvasRef.current;
    if (lens) {
      const { wingDepth } = getWipeMetrics(vw, vh);
      const scale = wingDepth / (LENS_WING_LEADING - LENS_WING_TRAILING);
      // Paint ahead of time, while the bird is still far away.
      if (!reduced && frame.near && p > 0.2) prepareLens(vw, vh, scale);
      const visible = !reduced && wipe > 0 && wipe < 1;
      lens.style.display = visible ? "" : "none";
      if (visible) {
        prepareLens(vw, vh, scale);
        const along = WIPE_DIRECTION;
        const across = { x: along.y, y: -along.x };
        // Local (0, 0) of the wing, placed so v = TRAILING lies on the edge.
        const centreProjection = edge - LENS_WING_TRAILING * scale;
        const viewProjection = (vw / 2) * along.x + (vh / 2) * along.y;
        const cx = vw / 2 + (centreProjection - viewProjection) * along.x;
        const cy = vh / 2 + (centreProjection - viewProjection) * along.y;
        const { uMin, vMin } = LENS_WING_BOUNDS;
        const ox = cx + (across.x * uMin + along.x * vMin) * scale;
        const oy = cy + (across.y * uMin + along.y * vMin) * scale;
        lens.style.transform = `matrix(${across.x.toFixed(4)}, ${across.y.toFixed(4)}, ${along.x.toFixed(4)}, ${along.y.toFixed(4)}, ${ox.toFixed(1)}, ${oy.toFixed(1)})`;
      }
    }

    // --- The bird's head in close-up, and the dolly into its eye.
    // The still (reduced-motion) composition keeps the eye above the question.
    const eyeX = (reduced ? 0.56 : splineKeyframes(p, EYE_X)) * vw;
    const eyeY = (reduced ? 0.4 : splineKeyframes(p, EYE_Y)) * vh;
    const nearRadius = minSide * 0.06;
    const focusRadius = minSide * (reduced ? 0.16 : 0.085);
    const throughRadius = diagonal;
    const eyeRadius =
      p < 0.6
        ? expLerp(
            nearRadius,
            focusRadius,
            easeInOutSine(range(p, passStart, 0.6)),
          )
        : expLerp(focusRadius, throughRadius, Math.pow(range(p, 0.6, 1), 1.7));

    // The head close-up is drawn by the world shader around the eye; the
    // jungle video above it still covers everything the wing has not passed.
    world.strange = p >= passStart ? 1 : 0;
    world.head = p >= passStart && p < 0.97 ? 1 : 0;
    world.iris = p >= passStart && p < 0.995 ? 1 : 0;
    world.eyeX = eyeX;
    world.eyeY = eyeY;
    world.eyeR = eyeRadius;
    world.pupil = reduced
      ? 0
      : -0.28 * bump(p, 0.5, 0.66) + easeInOutSine(range(p, 0.7, 0.97));
    world.tunnel = reduced ? 0 : easeInCubic(range(p, 0.82, 1));
    world.neural = reduced
      ? p >= 1
        ? 1
        : 0.25 * Number(p >= STILL_PROGRESS)
      : smoothstep(0.64, 0.93, p);

    // The navigation steps aside while the bird has the stage.
    const immersive = !reduced && p > 0.03 && p < 0.97 ? "true" : "false";
    if (document.documentElement.dataset.immersive !== immersive) {
      document.documentElement.dataset.immersive = immersive;
    }

    // --- The question waiting inside.
    const question = questionRef.current;
    if (question) {
      const t = reduced ? 1 : easeOutCubic(range(p, 0.86, 0.95));
      question.style.opacity = t.toFixed(3);
      question.style.top = reduced ? "80%" : "";
      question.style.transform = `translate3d(-50%, -50%, 0) scale(${(1.08 - 0.08 * t).toFixed(3)})`;
      question.style.filter =
        t < 0.999 ? `blur(${((1 - t) * 8).toFixed(2)}px)` : "";
    }
  });

  return (
    <section
      id="portal"
      ref={sectionRef}
      className="chapter chapter-portal"
      aria-labelledby="portal-question"
    >
      <div className="chapter-scene portal-scene">
        <canvas
          ref={birdCanvasRef}
          className="portal-layer portal-bird"
          aria-hidden="true"
          width={0}
          height={0}
          style={{ display: "none" }}
        />
        <canvas
          ref={lensCanvasRef}
          className="portal-lens"
          aria-hidden="true"
          width={0}
          height={0}
          style={{ display: "none" }}
        />
        <p id="portal-question" ref={questionRef} className="portal-question">
          <FormattedMessage id="neuralQuestion" />
        </p>
      </div>
    </section>
  );
};

export default PortalChapter;
