import CssBaseline from "@mui/material/CssBaseline";
import { Provider as JotaiProvider } from "jotai";
import App from "./App";
import Seo from "./components/Seo";
import { SelectedThemeProvider } from "./components/SelectedThemeProvider";
import { I18nWrapper } from "./i18n/i18nWrapper";
import JourneyStage from "./journey/JourneyStage";

const AppShell = () => (
  <JotaiProvider>
    <I18nWrapper>
      <SelectedThemeProvider>
        <Seo />
        <JourneyStage />
        <CssBaseline />
        <App />
      </SelectedThemeProvider>
    </I18nWrapper>
  </JotaiProvider>
);

export default AppShell;
