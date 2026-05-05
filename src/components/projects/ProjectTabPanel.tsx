import { Box } from "@mui/material";
import type { ReactNode, Ref, UIEventHandler } from "react";

type ProjectTabPanelProps = {
  children?: ReactNode;
  index: number;
  onScroll?: UIEventHandler<HTMLDivElement>;
  panelRef?: Ref<HTMLDivElement>;
  value: number;
};

const ProjectTabPanel = ({
  children,
  value,
  index,
  onScroll,
  panelRef,
  ...other
}: ProjectTabPanelProps) => {
  const isActive = value === index;

  return (
    <Box
      ref={panelRef}
      role="tabpanel"
      hidden={!isActive}
      id={`projects-tabpanel-${index}`}
      aria-labelledby={`projects-tab-${index}`}
      onScroll={onScroll}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: isActive ? "auto" : "hidden",
        pr: { xs: 0, sm: 1 },
        scrollbarGutter: "stable",
      }}
      {...other}
    >
      {children}
    </Box>
  );
};

export default ProjectTabPanel;
