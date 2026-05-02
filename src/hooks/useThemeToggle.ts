import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { useAtom } from "jotai";

export type Theme = "light" | "dark";

const getInitialFallbackTheme = (): Theme => {
  if (typeof window !== "undefined") {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  }
  return "light";
};

const localStorageJSON = createJSONStorage<Theme>(() => localStorage);

const themeAtom = atomWithStorage<Theme>(
  "theme",
  getInitialFallbackTheme(),
  localStorageJSON,
  { getOnInit: true },
);

export const useThemeToggle = () => {
  const [selectedTheme, setSelectedTheme] = useAtom(themeAtom);

  return {
    selectedTheme,
    toggleTheme: () =>
      setSelectedTheme((prev) => (prev === "light" ? "dark" : "light")),
  };
};
