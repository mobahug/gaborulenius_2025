import React from "react";
import ReactDOM from "react-dom/client";
import CoverSection from "./components/CoverSection";

// Lazy boundary for the rest of the app so the cover (LCP element) can
// paint without waiting for MUI/emotion/react-intl/jotai/theme code to
// download, parse and evaluate.
const AppShell = React.lazy(() => import("./AppShell"));

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <CoverSection />
    <React.Suspense fallback={null}>
      <AppShell />
    </React.Suspense>
  </React.StrictMode>,
);
