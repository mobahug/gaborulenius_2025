import React from "react";
import Box from "@mui/material/Box";
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
        <Hero />
      </Box>
      <React.Suspense fallback={null}>
        {firefliesEnabled ? (
          <div className="journey-ambient--fireflies">
            <Fireflies />
          </div>
        ) : null}
        {leavesEnabled ? (
          <div className="journey-ambient--leaves">
            <Leaves />
          </div>
        ) : null}
      </React.Suspense>
    </Box>
  );
};
export default App;
