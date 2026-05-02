import React, { useState, useEffect, ReactElement, useRef } from "react";
import { Slide } from "@mui/material";
import { COVER_THRESHOLD } from "./navConstants";

type ShowAfterCoverProps = { children: ReactElement };

const ShowAfterCover: React.FC<ShowAfterCoverProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updateVisible = () => {
      const nextVisible = window.scrollY > COVER_THRESHOLD;

      if (visibleRef.current === nextVisible) {
        return;
      }

      visibleRef.current = nextVisible;
      setVisible(nextVisible);
    };

    const onScroll = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        updateVisible();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateVisible();
    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Slide
      direction="down"
      in={visible}
      timeout={{ enter: 300, exit: 300 }}
      appear={false}
    >
      {children}
    </Slide>
  );
};

export default ShowAfterCover;
