import React from "react";
import Box from "@mui/material/Box";
import { styled, keyframes } from "@mui/system";
import type { SxProps, Theme } from "@mui/material/styles";
import { useThemeToggle } from "../hooks/useThemeToggle";
import { assetUrl } from "../utils/assets";

const fall1 = keyframes`
  0%   { transform: translate3d(300px, 0, 0)   rotate(0deg);   opacity: 0.7; }
  100% { transform: translate3d(-350px, 100vh, 0) rotate(90deg);  opacity: 0; }
`;
const fall2 = keyframes`
  0%   { transform: translate3d(0, 0, 0)      rotate(90deg);  opacity: 0.7; }
  100% { transform: translate3d(-400px, 100vh, 0) rotate(0deg);  opacity: 0; }
`;
const fall3 = keyframes`
  0%   { transform: translate3d(0, 0, 0)      rotate(-20deg); opacity: 0.7; }
  100% { transform: translate3d(-230px, 100vh, 0) rotate(-70deg);opacity: 0; }
`;

const LEAF_ANIMATIONS = [fall1, fall2, fall3];
const LEAF_COUNT = 10;

const LeavesContainer = styled(Box)(() => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  pointerEvents: "none",
  overflow: "hidden",
}));

type LeafProps = {
  animation: ReturnType<typeof keyframes>;
  left: number;
  size: number;
  delay: number;
  duration: number;
};
const LeafImg = styled("img", {
  shouldForwardProp: (prop) =>
    !["animation", "left", "size", "delay", "duration"].includes(
      prop as string,
    ),
})<LeafProps>(({ animation, left, size, delay, duration }) => ({
  position: "absolute",
  top: "-50px",
  left: `${left}vw`,
  width: `${size}px`,
  opacity: 0.7,
  pointerEvents: "none",
  animation: `${animation} ${duration}s infinite ease-in-out`,
  animationDelay: `${delay}s`,
}));

export type LeavesProps = {
  sx?: SxProps<Theme>;
};
const Leaves: React.FC<LeavesProps> = ({ sx }) => {
  const { selectedTheme } = useThemeToggle();
  const leaves = React.useMemo(
    () =>
      Array.from({ length: LEAF_COUNT }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 12 + Math.random() * 8,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 5,
        animation: LEAF_ANIMATIONS[i % LEAF_ANIMATIONS.length],
      })),
    [],
  );

  return (
    <LeavesContainer sx={sx}>
      {leaves.map(({ id, animation, left, size, delay, duration }) => (
        <LeafImg
          key={id}
          src={
            selectedTheme === "dark"
              ? assetUrl("dark-leaf-small.webp")
              : assetUrl("light-leaf-small.webp")
          }
          aria-hidden="true"
          animation={animation}
          left={left}
          size={size}
          delay={delay}
          duration={duration}
          alt=""
        />
      ))}
    </LeavesContainer>
  );
};

export default Leaves;
