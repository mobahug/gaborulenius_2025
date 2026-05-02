import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import BirdSpriteFlying from "./BirdSpriteFlying";
import BirdSpriteIdle from "./BirdSpriteIdle";

export type SectionInfo = {
  id: string;
  ref: React.RefObject<HTMLDivElement>;
};

const FLY_DURATION = 1.5;
const IDLE_DELAY = 1000;
const FRAME_H = 32;

export default function BirdManager({ sections }: { sections: SectionInfo[] }) {
  const controls = useAnimation();
  const [mode, setMode] = useState<"flying" | "idle">("idle");
  const [target, setTarget] = useState<{ x: number; y: number }>({
    x: -1000,
    y: -1000,
  });

  const modeRef = useRef(mode);
  const targetRef = useRef(target);
  const idleTimer = useRef<number | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updatePosition = () => {
      if (idleTimer.current !== null) {
        window.clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }

      if (modeRef.current !== "flying") {
        modeRef.current = "flying";
        setMode("flying");
      }

      let bestTop: number = Infinity;
      let bestRect: DOMRect | undefined;

      sections.forEach(({ ref }) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top >= 0 && r.top < bestTop && r.top < window.innerHeight) {
          bestTop = r.top;
          bestRect = r;
        }
      });

      if (bestRect) {
        const nextTarget = {
          x: bestRect.right - FRAME_H,
          y: bestRect.top - FRAME_H,
        };

        if (
          targetRef.current.x !== nextTarget.x ||
          targetRef.current.y !== nextTarget.y
        ) {
          targetRef.current = nextTarget;
          setTarget(nextTarget);
        }
      }

      idleTimer.current = window.setTimeout(() => {
        modeRef.current = "idle";
        setMode("idle");
      }, IDLE_DELAY);
    };

    const onScroll = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        updatePosition();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updatePosition();
    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("scroll", onScroll);
      if (idleTimer.current !== null) {
        window.clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    };
  }, [sections]);

  useEffect(() => {
    if (mode === "flying") {
      controls.start({
        x: target.x,
        y: target.y,
        transition: { duration: FLY_DURATION, ease: "easeInOut" },
      });
    } else {
      controls.set({ x: target.x, y: target.y });
    }
  }, [mode, target.x, target.y, controls]);

  return (
    <motion.div
      initial={false}
      animate={controls}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 199,
      }}
    >
      {mode === "flying" ? <BirdSpriteFlying /> : <BirdSpriteIdle />}
    </motion.div>
  );
}
