import { ThemeProvider } from "@emotion/react";
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

  return <ThemeProvider theme={selectedMuiTheme}>{children}</ThemeProvider>;
};
