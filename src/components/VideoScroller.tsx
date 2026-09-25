import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefCallback,
} from "react";
import { Theme, useThemeToggle } from "../hooks/useThemeToggle";
import { setJungleVideo } from "../journey/jungleVideo";
import { onAfterSceneFrame } from "../journey/scrollTimeline";
import { world } from "../journey/worldState";
import { getVideoSrc } from "./videoSources";

type VideoLayer = {
  theme: Theme;
  src: string;
};

const SEEK_DELTA_SECONDS = 0.008;
const PROGRESS_DELTA = 0.0005;

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

/**
 * The jungle walk. The video is scrubbed by `world.video`, which the stage
 * director maps from the cover to the moment the bird's wing passes the lens
 * in the portal. After that the jungle is gone and the video is no longer
 * seeked.
 */
export const VideoScroller = () => {
  const { selectedTheme } = useThemeToggle();
  const [mountedThemes, setMountedThemes] = useState<Theme[]>([selectedTheme]);
  const [visibleTheme, setVisibleTheme] = useState(selectedTheme);
  const selectedThemeRef = useRef(selectedTheme);
  const progressRef = useRef(world.video);
  const videoRefs = useRef<Partial<Record<Theme, HTMLVideoElement | null>>>({});
  const layers = useMemo<VideoLayer[]>(
    () => [
      { theme: "light", src: getVideoSrc("light") },
      { theme: "dark", src: getVideoSrc("dark") },
    ],
    [],
  );

  const updateVideo = useCallback((force = false) => {
    const nextProgress = world.video;
    if (
      !force &&
      Math.abs(nextProgress - progressRef.current) < PROGRESS_DELTA
    ) {
      return;
    }
    progressRef.current = nextProgress;
    const activeVideo = videoRefs.current[selectedThemeRef.current] ?? null;
    seekVideo(activeVideo, nextProgress, force);
  }, []);

  const markReady = useCallback((theme: Theme) => {
    if (selectedThemeRef.current !== theme) return;
    setVisibleTheme(theme);
    setJungleVideo(videoRefs.current[theme] ?? null);
    document.documentElement.dataset.videoReady = "true";
  }, []);

  const setVideoRef = useCallback(
    (theme: Theme): RefCallback<HTMLVideoElement> =>
      (video) => {
        videoRefs.current[theme] = video;
        seekVideo(video, progressRef.current, true);
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
    // flips visibleTheme once that frame is ready, avoiding a one-frame flash
    // of the previously-cached frame.
    const targetVideo = videoRefs.current[selectedTheme];
    if (targetVideo) {
      seekVideo(targetVideo, progressRef.current, true);
      const targetTime = Math.min(
        Math.max(targetVideo.duration * progressRef.current, 0),
        Math.max(targetVideo.duration - 0.02, 0),
      );
      if (
        targetVideo.readyState >= 2 &&
        Math.abs(targetVideo.currentTime - targetTime) < SEEK_DELTA_SECONDS
      ) {
        markReady(selectedTheme);
      }
    }

    const frameId = window.requestAnimationFrame(() => {
      updateVideo(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [markReady, selectedTheme, updateVideo]);

  useEffect(() => onAfterSceneFrame(() => updateVideo()), [updateVideo]);

  useEffect(
    () => () => {
      setJungleVideo(null);
    },
    [],
  );

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
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
            onLoadedMetadata={() => updateVideo(true)}
            onLoadedData={() => {
              updateVideo(true);
              markReady(theme);
            }}
            onSeeked={() => markReady(theme)}
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
