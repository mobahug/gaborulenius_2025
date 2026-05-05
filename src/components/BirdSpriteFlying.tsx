import React from "react";
import { styled, keyframes } from "@mui/material/styles";
import { assetUrl } from "../utils/assets";

const FRAME_COUNT = 8;
const FRAME_W = 32;
const FRAME_H = 32;
const SHEET_W = FRAME_COUNT * FRAME_W;
const flap = keyframes`
  from { background-position: 0 0; }
  to   { background-position: -${SHEET_W}px 0; }
`;

const breathe = keyframes`
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-2px); }
`;

const Sprite = styled("div")(({ theme }) => {
  return {
    width: FRAME_W,
    height: FRAME_H,
    position: "absolute",
    bottom: "100%",
    right: theme.spacing(1),
    marginBottom: "-3px",
    pointerEvents: "none",
    willChange: "background-position, transform",

    backgroundImage: `url("${assetUrl("BirdSpriteBigFlying.png")}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${SHEET_W}px ${FRAME_H}px`,

    animation: `
      ${flap}    1s steps(${FRAME_COUNT})    infinite normal,
      ${breathe} 2s   ease-in-out            infinite normal
    `,
  };
});

const BirdSpriteFlying: React.FC = () => <Sprite />;

export default BirdSpriteFlying;
