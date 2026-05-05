import type { Theme } from "../hooks/useThemeToggle";
import { assetUrl } from "../utils/assets";

export const getVideoSrc = (selectedTheme: Theme) =>
  selectedTheme === "dark"
    ? assetUrl("gemini-jungle-dark-scrub.mp4")
    : assetUrl("gemini-jungle-light-scrub.mp4");

export const getAlternateVideoSrc = (selectedTheme: Theme) =>
  getVideoSrc(selectedTheme === "dark" ? "light" : "dark");
