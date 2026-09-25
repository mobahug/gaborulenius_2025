/**
 * Size of the fixed background stage in CSS pixels. DOM choreography that
 * has to line up with the shader (the bird's eye, the wing wipe, the map
 * trail) uses this instead of `window.innerWidth/innerHeight`, which can
 * differ by the scrollbar width or the mobile browser chrome.
 */
let stageSize = { width: 0, height: 0 };

export const setStageSize = (width: number, height: number) => {
  stageSize = { width, height };
};

export const getStageSize = () =>
  stageSize.width > 0
    ? stageSize
    : {
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      };
