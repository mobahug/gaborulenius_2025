import Button from "@mui/material/Button";
import EmailIcon from "@mui/icons-material/Email";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { BRANCH_ASPECT, paintBranch, perchPoint } from "../bird/branch";
import { BIRD_PALETTES, drawBird } from "../bird/drawBird";
import { createFlightCamera } from "../bird/flight";
import { FOLDED, LANDING_START, landingAt } from "../bird/landing";
import { prefersReducedMotion } from "../device";
import { range } from "../math";
import { requestSceneFrame } from "../scrollTimeline";
import { getStageSize } from "../stageSize";
import { useScene } from "../useScene";
import { pinnedArrival } from "../worldDirector";
import "./chapters.css";

// Drawing scale of the perched bird: pixels per centimetre, relative to the
// branch box width.
const PIXELS_PER_CM = 2.9 / 300;

const readTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/** Where the branch sits: reaching in from the right edge. */
const branchBox = (vw: number, vh: number) => {
  const wide = vw >= 900;
  const width = wide ? Math.min(vw * 0.46, 560) : vw * 0.66;
  const top = wide ? vh * 0.33 - width * 0.09 : vh * 0.36 - width * 0.09;
  return { left: vw - width, top, width, height: width * BRANCH_ASPECT };
};

type Stage = {
  context: CanvasRenderingContext2D;
  branch: HTMLCanvasElement;
  glow: HTMLCanvasElement;
  key: string;
};

/**
 * "The Clearing": every line has lain down into a quiet horizon. The bird
 * comes back over the viewer's shoulder and settles on a branch facing the
 * low sun, and the journey resolves with an open invitation.
 */
const ContactChapter = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const motionRef = useRef({ progress: 0, idle: 0, frame: 0, last: 0 });

  // Paints the stage: the branch, then the bird for the current progress.
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width: vw, height: vh } = getStageSize();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const theme = readTheme();
    const box = branchBox(vw, vh);
    const key = `${vw}x${vh}@${ratio}:${theme}`;
    let stage = stageRef.current;
    if (!stage || stage.key !== key) {
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = Math.round(vw * ratio);
      canvas.height = Math.round(vh * ratio);
      const branch = stage?.branch ?? document.createElement("canvas");
      paintBranch(branch, box.width, theme);
      const glow = stage?.glow ?? document.createElement("canvas");
      glow.width = Math.max(1, Math.round(canvas.width / 6));
      glow.height = Math.max(1, Math.round(canvas.height / 6));
      stage = { context, branch, glow, key };
      stageRef.current = stage;
    }

    const { context } = stage;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.drawImage(stage.branch, box.left, box.top, box.width, box.height);

    const reduced = prefersReducedMotion();
    const { progress, idle } = motionRef.current;
    if (!reduced && progress <= LANDING_START) return;
    const camera = createFlightCamera(vw, vh);
    const [px, py] = perchPoint(box.width);
    const perch = {
      x: box.left + px,
      y: box.top + py,
      depth: camera.focal / (PIXELS_PER_CM * box.width),
    };
    const frame = landingAt(progress, perch, camera, { time: idle }, reduced);
    drawBird(context, frame.state, frame.transform, frame.camera, {
      palette: BIRD_PALETTES[theme],
      glowCanvas: stage.glow,
      glow: 0.8,
      // Against the low sun: a silhouette with only a hint of its blue.
      sheen: 0.4,
      translucency: 0.45,
      opacity: frame.opacity,
      perch: frame.standing ? { y: perch.y } : undefined,
    });
  };

  // Once settled, small signs of life (breathing, a glance, a tail flick)
  // while the clearing is on screen.
  const animateIdle = (now: number) => {
    const motion = motionRef.current;
    motion.frame = 0;
    if (prefersReducedMotion() || motion.progress < FOLDED) return;
    const section = sectionRef.current;
    if (!section || section.getBoundingClientRect().bottom < 0) return;
    // About 30 frames a second is plenty for such slow motion.
    if (now - motion.last > 32) {
      motion.idle += Math.min(0.1, (now - (motion.last || now)) / 1000);
      motion.last = now;
      draw();
    }
    motion.frame = requestAnimationFrame(animateIdle);
  };

  useScene(sectionRef, (frame) => {
    const motion = motionRef.current;
    // The clearing arrives first; the bird comes in while the scene is held.
    motion.progress = range(pinnedArrival(frame), 0.3, 1);
    if (!frame.near) return;
    draw();
    if (motion.progress >= FOLDED && !motion.frame && !prefersReducedMotion()) {
      motion.last = 0;
      motion.frame = requestAnimationFrame(animateIdle);
    }
  });

  useEffect(() => {
    const motion = motionRef.current;
    // A theme change repaints on the next scene frame.
    const theme = new MutationObserver(requestSceneFrame);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      theme.disconnect();
      cancelAnimationFrame(motion.frame);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="chapter chapter-contact"
      aria-labelledby="contact-heading"
    >
      <canvas ref={canvasRef} className="contact-stage" aria-hidden="true" />
      <div className="contact-scene">
        <div className="contact-copy text-scrim">
          <h2 id="contact-heading" className="chapter-title contact-title">
            <FormattedMessage id="contactHeading" />
          </h2>
          <p className="chapter-lead">
            <FormattedMessage id="contactIntro" />
          </p>
          <div className="contact-actions">
            <Button
              variant="contained"
              component="a"
              href="mailto:gaborulenius@gmail.com"
              startIcon={<EmailIcon />}
            >
              <FormattedMessage id="contactBtnEmail" />
            </Button>
            <Button
              variant="contained"
              component="a"
              href="https://www.linkedin.com/in/g%C3%A0bor-horv%C3%A0th-ulenius-07526719a/"
              target="_blank"
              rel="me noopener noreferrer"
              startIcon={<LinkedInIcon />}
            >
              <FormattedMessage id="contactBtnLinkedIn" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactChapter;
