import { Box } from "@mui/material";
import CoverSection from "./components/CoverSection";
import Hero from "./components/Hero";
import Leaves from "./components/Leaves";
import Fireflies from "./components/Fireflies";
import { useLeavesEffect } from "./hooks/useLeavesEffect";
import { useFireflyEffect } from "./hooks/useFireflyEffect";
import NavBar from "./components/navbar/NavBar";

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
      {firefliesEnabled && <Fireflies />}
      {leavesEnabled && <Leaves />}
    </Box>
  );
};
export default App;
