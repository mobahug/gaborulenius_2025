import React from "react";
import { useThemeToggle } from "../hooks/useThemeToggle";
import { getAlternateVideoSrc, getVideoSrc } from "./videoSources";

const SELECTED_VIDEO_PREFETCH_LINK_ID = "selected-theme-video-prefetch";
const ALTERNATE_VIDEO_PREFETCH_LINK_ID = "alternate-theme-video-prefetch";

type BrowserWindowWithIdleCallback = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const VideoScroller = React.lazy(() =>
  import("./VideoScroller").then((module) => ({
    default: module.VideoScroller,
  })),
);

const DeferredVideoScroller = () => {
  const { selectedTheme } = useThemeToggle();
  const [shouldRenderVideo, setShouldRenderVideo] = React.useState(false);
  const videoSrc = React.useMemo(
    () => getVideoSrc(selectedTheme),
    [selectedTheme],
  );
  const alternateVideoSrc = React.useMemo(
    () => getAlternateVideoSrc(selectedTheme),
    [selectedTheme],
  );

  React.useEffect(() => {
    const existingLink = document.getElementById(
      SELECTED_VIDEO_PREFETCH_LINK_ID,
    ) as HTMLLinkElement | null;
    const prefetchLink = existingLink ?? document.createElement("link");

    prefetchLink.id = SELECTED_VIDEO_PREFETCH_LINK_ID;
    prefetchLink.rel = "prefetch";
    prefetchLink.href = videoSrc;

    if (!existingLink) {
      document.head.appendChild(prefetchLink);
    }
  }, [videoSrc]);

  React.useEffect(() => {
    return () => {
      document.getElementById(SELECTED_VIDEO_PREFETCH_LINK_ID)?.remove();
      document.getElementById(ALTERNATE_VIDEO_PREFETCH_LINK_ID)?.remove();
    };
  }, []);

  React.useEffect(() => {
    const windowWithIdleCallback = window as BrowserWindowWithIdleCallback;
    let idleCallbackHandle: number | null = null;
    let timeoutId: number | null = null;

    const prefetchAlternateVideo = () => {
      const existingLink = document.getElementById(
        ALTERNATE_VIDEO_PREFETCH_LINK_ID,
      ) as HTMLLinkElement | null;
      const prefetchLink = existingLink ?? document.createElement("link");

      prefetchLink.id = ALTERNATE_VIDEO_PREFETCH_LINK_ID;
      prefetchLink.rel = "prefetch";
      prefetchLink.href = alternateVideoSrc;

      if (!existingLink) {
        document.head.appendChild(prefetchLink);
      }
    };

    if (windowWithIdleCallback.requestIdleCallback) {
      idleCallbackHandle = windowWithIdleCallback.requestIdleCallback(
        prefetchAlternateVideo,
        { timeout: 4000 },
      );
    } else {
      timeoutId = window.setTimeout(prefetchAlternateVideo, 4000);
    }

    return () => {
      if (
        idleCallbackHandle !== null &&
        windowWithIdleCallback.cancelIdleCallback
      ) {
        windowWithIdleCallback.cancelIdleCallback(idleCallbackHandle);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [alternateVideoSrc]);

  React.useEffect(() => {
    if (shouldRenderVideo) {
      return;
    }

    const windowWithIdleCallback = window as BrowserWindowWithIdleCallback;
    let idleCallbackHandle: number | null = null;
    let timeoutId: number | null = null;
    let renderRequested = false;

    const requestVideoRender = () => {
      if (renderRequested) {
        return;
      }

      renderRequested = true;
      setShouldRenderVideo(true);
    };

    window.addEventListener("scroll", requestVideoRender, {
      once: true,
      passive: true,
    });

    if (windowWithIdleCallback.requestIdleCallback) {
      idleCallbackHandle = windowWithIdleCallback.requestIdleCallback(
        requestVideoRender,
        { timeout: 2500 },
      );
    } else {
      timeoutId = window.setTimeout(requestVideoRender, 2500);
    }

    return () => {
      window.removeEventListener("scroll", requestVideoRender);

      if (
        idleCallbackHandle !== null &&
        windowWithIdleCallback.cancelIdleCallback
      ) {
        windowWithIdleCallback.cancelIdleCallback(idleCallbackHandle);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [shouldRenderVideo]);

  if (!shouldRenderVideo) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <VideoScroller />
    </React.Suspense>
  );
};

export default DeferredVideoScroller;
