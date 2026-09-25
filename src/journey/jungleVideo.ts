/**
 * The currently visible jungle video element. The world shader samples it as
 * a texture for the "strange jungle" moment of the portal.
 */
let activeVideo: HTMLVideoElement | null = null;
let version = 0;

export const setJungleVideo = (video: HTMLVideoElement | null) => {
  if (video === activeVideo) return;
  activeVideo = video;
  version += 1;
};

export const getJungleVideo = () => activeVideo;

/** Changes whenever the active video element changes (e.g. theme switch). */
export const getJungleVideoVersion = () => version;
