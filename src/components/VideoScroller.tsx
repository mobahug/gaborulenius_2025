import {
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import ScrollyVideoCore from "scrolly-video/dist/ScrollyVideo.js";
import { Theme, useThemeToggle } from "../hooks/useThemeToggle";
import { getVideoSrc } from "./videoSources";

type ScrollyVideoInstance = InstanceType<typeof ScrollyVideoCore>;

type ScrollyVideoLayer = {
  theme: Theme;
  src: string;
};

const getScrollVideoPercentage = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (maxScroll <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, window.scrollY / maxScroll));
};

export const VideoScroller = () => {
  const { selectedTheme } = useThemeToggle();
  const videoPercentageRef = useRef(getScrollVideoPercentage());
  const lightContainerRef = useRef<HTMLDivElement | null>(null);
  const darkContainerRef = useRef<HTMLDivElement | null>(null);
  const lightVideoRef = useRef<ScrollyVideoInstance | null>(null);
  const darkVideoRef = useRef<ScrollyVideoInstance | null>(null);
  const layers = useMemo<ScrollyVideoLayer[]>(
    () => [
      { theme: "light", src: getVideoSrc("light") },
      { theme: "dark", src: getVideoSrc("dark") },
    ],
    [],
  );

  const setLayerPercentage = useCallback((percentage: number) => {
    lightVideoRef.current?.setVideoPercentage(percentage, { jump: true });
    darkVideoRef.current?.setVideoPercentage(percentage, { jump: true });
  }, []);

  const updateVideoPercentage = useCallback(
    (force = false) => {
      const nextPercentage = getScrollVideoPercentage();

      if (
        !force &&
        Math.abs(nextPercentage - videoPercentageRef.current) < 0.001
      ) {
        return;
      }

      videoPercentageRef.current = nextPercentage;
      setLayerPercentage(nextPercentage);
    },
    [setLayerPercentage],
  );

  useEffect(() => {
    const createLayer = (
      container: HTMLDivElement | null,
      src: string,
      instanceRef: MutableRefObject<ScrollyVideoInstance | null>,
    ) => {
      if (!container) {
        return;
      }

      instanceRef.current?.destroy();

      const instance = new ScrollyVideoCore({
        src,
        scrollyVideoContainer: container,
        sticky: false,
        full: true,
        cover: true,
        trackScroll: false,
        lockScroll: false,
        onReady: () => {
          instance.setVideoPercentage(videoPercentageRef.current, {
            jump: true,
          });
        },
      });
      instanceRef.current = instance;
    };

    createLayer(lightContainerRef.current, getVideoSrc("light"), lightVideoRef);
    createLayer(darkContainerRef.current, getVideoSrc("dark"), darkVideoRef);
    updateVideoPercentage(true);

    return () => {
      lightVideoRef.current?.destroy();
      darkVideoRef.current?.destroy();
      lightVideoRef.current = null;
      darkVideoRef.current = null;
    };
  }, [updateVideoPercentage]);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const requestVideoPercentageUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        updateVideoPercentage();
      });
    };

    const requestForcedVideoPercentageUpdate = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        updateVideoPercentage(true);
      });
    };

    updateVideoPercentage(true);
    window.addEventListener("scroll", requestVideoPercentageUpdate, {
      passive: true,
    });
    window.addEventListener("resize", requestForcedVideoPercentageUpdate);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("scroll", requestVideoPercentageUpdate);
      window.removeEventListener("resize", requestForcedVideoPercentageUpdate);
    };
  }, [updateVideoPercentage]);

  return (
    <div aria-hidden="true" style={{ height: "100vh", pointerEvents: "none" }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {layers.map(({ theme }) => (
          <div
            key={theme}
            ref={theme === "dark" ? darkContainerRef : lightContainerRef}
            style={{
              position: "absolute",
              inset: 0,
              opacity: selectedTheme === theme ? 1 : 0,
              transition: "opacity 450ms ease",
              pointerEvents: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
};
