import React from "react";
import { TransitionProps } from "@mui/material/transitions";
import Slide from "@mui/material/Slide";

export const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// TODO: Uncomments once needed

// const shorten = (url: string) => {
//   try {
//     const u = new URL(url);
//     const path = u.pathname.split("/").filter(Boolean).slice(0, 2).join("/");
//     return path ? `${u.host}/${path}…` : u.host;
//   } catch {
//     return url;
//   }
// };
