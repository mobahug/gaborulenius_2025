import React from "react";
import Box from "@mui/material/Box";
import CoverSection from "./components/CoverSection";
import Hero from "./components/Hero";
import { useLeavesEffect } from "./hooks/useLeavesEffect";
import { useFireflyEffect } from "./hooks/useFireflyEffect";
import NavBar from "./components/navbar/NavBar";

const Leaves = React.lazy(() => import("./components/Leaves"));
const Fireflies = React.lazy(() => import("./components/Fireflies"));

const App: React.FC = () => {
  const { leavesEnabled } = useLeavesEffect();
  const { firefliesEnabled } = useFireflyEffect();

  return (
    <Box id="scrolly-container" sx={{ position: "relative" }}>
      <NavBar />
      <Box
        component="main"
        id="main-content"
        sx={{ position: "relative", zIndex: 2 }}
      >
        <CoverSection />
        <Hero />
      </Box>
      <React.Suspense fallback={null}>
        {firefliesEnabled ? <Fireflies /> : null}
        {leavesEnabled ? <Leaves /> : null}
      </React.Suspense>
    </Box>
  );
};
export default App;
