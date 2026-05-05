import CssBaseline from "@mui/material/CssBaseline";
import { Provider as JotaiProvider } from "jotai";
import App from "./App";
import DeferredVideoScroller from "./components/DeferredVideoScroller";
import Seo from "./components/Seo";
import { SelectedThemeProvider } from "./components/SelectedThemeProvider";
import { I18nWrapper } from "./i18n/i18nWrapper";

const AppShell = () => (
  <JotaiProvider>
    <I18nWrapper>
      <SelectedThemeProvider>
        <Seo />
        <DeferredVideoScroller />
        <CssBaseline />
        <App />
      </SelectedThemeProvider>
    </I18nWrapper>
  </JotaiProvider>
);

export default AppShell;
