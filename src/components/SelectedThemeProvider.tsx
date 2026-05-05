import { ThemeProvider } from "@mui/material/styles";
import { useEffect, useMemo } from "react";
import darkTheme from "../darkTheme";
import { useSetFirefliesEnabled } from "../hooks/useFireflyEffect";
import { useThemeToggle } from "../hooks/useThemeToggle";
import theme from "../theme";

type SelectedThemeProviderProps = {
  children: React.ReactNode;
};

export const SelectedThemeProvider = ({
  children,
}: SelectedThemeProviderProps) => {
  const { selectedTheme } = useThemeToggle();
  const setFirefliesEnabled = useSetFirefliesEnabled();

  const selectedMuiTheme = useMemo(
    () => (selectedTheme === "dark" ? darkTheme : theme),
    [selectedTheme],
  );

  useEffect(() => {
    setFirefliesEnabled(selectedTheme === "dark");
  }, [selectedTheme, setFirefliesEnabled]);

  // Mirror the active theme onto <html data-theme> so non-MUI surfaces
  // (e.g. the pre-React cover section) can style themselves without
  // pulling in jotai/MUI.
  useEffect(() => {
    document.documentElement.dataset.theme = selectedTheme;
  }, [selectedTheme]);

  return <ThemeProvider theme={selectedMuiTheme}>{children}</ThemeProvider>;
};
