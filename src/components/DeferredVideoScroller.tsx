import React from "react";

const VIDEO_WORK_IDLE_TIMEOUT_MS = 2500;

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
  const [shouldRenderVideo, setShouldRenderVideo] = React.useState(false);

  React.useEffect(() => {
    if (shouldRenderVideo) {
      return;
    }

    const windowWithIdleCallback = window as BrowserWindowWithIdleCallback;
    let idleCallbackHandle: number | null = null;
    let timeoutId: number | null = null;
    let renderRequested = false;

    const requestDeferredVideoWork = () => {
      if (renderRequested) {
        return;
      }

      renderRequested = true;
      setShouldRenderVideo(true);
    };

    window.addEventListener("scroll", requestDeferredVideoWork, {
      once: true,
      passive: true,
    });

    if (windowWithIdleCallback.requestIdleCallback) {
      idleCallbackHandle = windowWithIdleCallback.requestIdleCallback(
        requestDeferredVideoWork,
        { timeout: VIDEO_WORK_IDLE_TIMEOUT_MS },
      );
    } else {
      timeoutId = window.setTimeout(
        requestDeferredVideoWork,
        VIDEO_WORK_IDLE_TIMEOUT_MS,
      );
    }

    return () => {
      window.removeEventListener("scroll", requestDeferredVideoWork);

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
