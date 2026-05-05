import React from "react";
import { styled, keyframes } from "@mui/material/styles";
import { assetUrl } from "../utils/assets";

const FRAME_COUNT = 2;
const FRAME_WIDTH = 38;
const FRAME_HEIGHT = 32;
const TOTAL_WIDTH = FRAME_COUNT * FRAME_WIDTH;

const flap = keyframes`
  100% { background-position: -${TOTAL_WIDTH}px 0; }
`;

const breathe = keyframes`
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-1px); }
`;

const Sprite = styled("div")((props) => {
  const { theme } = props;
  return {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    backgroundImage: `url("${assetUrl("BirdSpriteBigIdle.png")}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `auto 100%`,
    willChange: "background-position, transform",
    position: "absolute",
    bottom: "100%",
    right: theme.spacing(1),
    marginBottom: "-35px",
    pointerEvents: "none",

    animation: `
      ${flap}    1s   steps(${FRAME_COUNT}) infinite,
      ${breathe} 2s   ease-in-out           infinite
    `,
  };
});

const BirdSpriteIdle: React.FC = () => <Sprite />;

export default BirdSpriteIdle;
