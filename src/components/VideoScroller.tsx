import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefCallback,
} from "react";
import { Theme, useThemeToggle } from "../hooks/useThemeToggle";
import { getVideoSrc } from "./videoSources";

type VideoLayer = {
  theme: Theme;
  src: string;
};

const SEEK_DELTA_SECONDS = 0.008;
const SCROLL_DELTA = 0.001;

const getScrollVideoPercentage = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (maxScroll <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, window.scrollY / maxScroll));
};

const seekVideo = (
  video: HTMLVideoElement | null,
  percentage: number,
  force = false,
) => {
  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
    return;
  }

  const targetTime = Math.min(
    Math.max(video.duration * percentage, 0),
    Math.max(video.duration - 0.02, 0),
  );

  if (!force && Math.abs(video.currentTime - targetTime) < SEEK_DELTA_SECONDS) {
    return;
  }

  try {
    video.currentTime = targetTime;
  } catch {
    /* ignore transient seek failures (e.g. mid-load) */
  }
};

export const VideoScroller = () => {
  const { selectedTheme } = useThemeToggle();
  const [mountedThemes, setMountedThemes] = useState<Theme[]>([selectedTheme]);
  const [visibleTheme, setVisibleTheme] = useState(selectedTheme);
  const selectedThemeRef = useRef(selectedTheme);
  const videoPercentageRef = useRef(getScrollVideoPercentage());
  const videoRefs = useRef<Partial<Record<Theme, HTMLVideoElement | null>>>({});
  const layers = useMemo<VideoLayer[]>(
    () => [
      { theme: "light", src: getVideoSrc("light") },
      { theme: "dark", src: getVideoSrc("dark") },
    ],
    [],
  );

  const updateVideoPercentage = useCallback((force = false) => {
    const nextPercentage = getScrollVideoPercentage();

    if (
      !force &&
      Math.abs(nextPercentage - videoPercentageRef.current) < SCROLL_DELTA
    ) {
      return;
    }

    videoPercentageRef.current = nextPercentage;
    const activeVideo = videoRefs.current[selectedThemeRef.current] ?? null;
    seekVideo(activeVideo, nextPercentage, force);
  }, []);

  const setVideoRef = useCallback(
    (theme: Theme): RefCallback<HTMLVideoElement> =>
      (video) => {
        videoRefs.current[theme] = video;
        seekVideo(video, videoPercentageRef.current, true);
      },
    [],
  );

  useEffect(() => {
    selectedThemeRef.current = selectedTheme;
    setMountedThemes((themes) =>
      themes.includes(selectedTheme) ? themes : [...themes, selectedTheme],
    );

    // Force-seek the now-active video to the current scroll position so the
    // next frame it renders matches what the user sees. The `seeked` listener
    // on the <video> element will flip visibleTheme once that frame is ready,
    // avoiding a one-frame flash of the previously-cached frame.
    const targetVideo = videoRefs.current[selectedTheme];
    if (targetVideo) {
      seekVideo(targetVideo, videoPercentageRef.current, true);
      // If the video is already at the target frame, seeked won't fire — flip immediately.
      const targetTime = Math.min(
        Math.max(targetVideo.duration * videoPercentageRef.current, 0),
        Math.max(targetVideo.duration - 0.02, 0),
      );
      if (
        targetVideo.readyState >= 2 &&
        Math.abs(targetVideo.currentTime - targetTime) < SEEK_DELTA_SECONDS
      ) {
        setVisibleTheme(selectedTheme);
      }
    }

    const frameId = window.requestAnimationFrame(() => {
      updateVideoPercentage(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [selectedTheme, updateVideoPercentage]);

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
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {layers
        .filter(({ theme }) => mountedThemes.includes(theme))
        .map(({ theme, src }) => (
          <video
            key={theme}
            ref={setVideoRef(theme)}
            src={src}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={() => updateVideoPercentage(true)}
            onLoadedData={() => {
              updateVideoPercentage(true);
              if (selectedThemeRef.current === theme) {
                setVisibleTheme(theme);
              }
            }}
            onSeeked={() => {
              if (selectedThemeRef.current === theme) {
                setVisibleTheme(theme);
              }
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: visibleTheme === theme ? 1 : 0,
              transition: "opacity 450ms ease",
              pointerEvents: "none",
            }}
          />
        ))}
    </div>
  );
};
