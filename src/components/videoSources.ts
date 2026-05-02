import type { Theme } from "../hooks/useThemeToggle";

export const getVideoSrc = (selectedTheme: Theme) =>
  selectedTheme === "dark"
    ? "/gaborulenius/gemini-jungle-dark.mp4"
    : "/gaborulenius/gemini-jungle-light.mp4";

export const getAlternateVideoSrc = (selectedTheme: Theme) =>
  getVideoSrc(selectedTheme === "dark" ? "light" : "dark");
