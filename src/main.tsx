import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline } from "@mui/material";
import App from "./App";
import { Provider as JotaiProvider } from "jotai";
import { I18nWrapper } from "./i18n/i18nWrapper";
import { SelectedThemeProvider } from "./components/SelectedThemeProvider";
import Seo from "./components/Seo";
import DeferredVideoScroller from "./components/DeferredVideoScroller";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
  </React.StrictMode>,
);
