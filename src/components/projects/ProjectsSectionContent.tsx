import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
  type UIEventHandler,
} from "react";
import { FormattedMessage } from "react-intl";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import AnimatedReveal from "../AnimatedReveal";
import ExplorerProjectDialog from "./ExplorerProjectDialog";
import ExplorerProjectPanel from "./ExplorerProjectPanel";
import HobbyScrollHint from "./HobbyScrollHint";
import ProjectTabPanel from "./ProjectTabPanel";
import WorkProjectsPanel from "./WorkProjectsPanel";

const ProjectsSectionContent = () => {
  const theme = useTheme();
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down("md"));
  const hobbyPanelRef = useRef<HTMLDivElement | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [showHobbyScrollHint, setShowHobbyScrollHint] = useState(false);
  const accent =
    theme.palette.mode === "dark" ? darkColors.accent : lightColors.accent;

  const updateHobbyScrollHint = useCallback(() => {
    const panel = hobbyPanelRef.current;
    if (!panel || tabIndex !== 1) {
      setShowHobbyScrollHint(false);
      return;
    }

    const canScroll = panel.scrollHeight - panel.clientHeight > 12;
    const isAtTop = panel.scrollTop <= 8;
    setShowHobbyScrollHint(canScroll && isAtTop);
  }, [tabIndex]);

  const handleTabChange = (_event: SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

  const handleHobbyPanelScroll: UIEventHandler<HTMLDivElement> = () => {
    updateHobbyScrollHint();
  };

  const handleHobbyScrollHintClick = () => {
    const panel = hobbyPanelRef.current;
    if (!panel) {
      return;
    }

    setShowHobbyScrollHint(false);
    panel.scrollTo({
      top: panel.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const frameId = window.requestAnimationFrame(updateHobbyScrollHint);
    window.addEventListener("resize", updateHobbyScrollHint);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateHobbyScrollHint);
    };
  }, [updateHobbyScrollHint]);

  return (
    <>
      <AnimatedReveal>
        <Paper
          component="section"
          aria-labelledby="projects-heading"
          sx={{
            width: { xs: "100%", md: "80%" },
            height: { xs: "min(640px, calc(100svh - 48px))", sm: 640 },
            mx: "auto",
            pt: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="Project tabs"
            centered
            variant="fullWidth"
            sx={{ p: 2 }}
          >
            <Tab
              label={<FormattedMessage id="projectTabWork" />}
              id="projects-tab-0"
              aria-controls="projects-tabpanel-0"
            />
            <Tab
              label={<FormattedMessage id="projectTabHobby" />}
              id="projects-tab-1"
              aria-controls="projects-tabpanel-1"
            />
          </Tabs>
          <Box
            sx={{
              px: { xs: 0, sm: 2 },
              display: "flex",
              flex: 1,
              minHeight: 0,
              position: "relative",
              flexDirection: "column",
            }}
          >
            <AnimatedReveal order={1}>
              <Typography id="projects-heading" variant="h4" component="h2">
                <FormattedMessage id="projectHeading" />
              </Typography>
            </AnimatedReveal>
            <ProjectTabPanel value={tabIndex} index={0}>
              <WorkProjectsPanel accent={accent} />
            </ProjectTabPanel>
            <ProjectTabPanel
              value={tabIndex}
              index={1}
              panelRef={hobbyPanelRef}
              onScroll={handleHobbyPanelScroll}
            >
              <ExplorerProjectPanel
                onDetailsClick={() => setExplorerOpen(true)}
              />
            </ProjectTabPanel>
            {showHobbyScrollHint ? (
              <HobbyScrollHint
                accent={accent}
                onClick={handleHobbyScrollHintClick}
              />
            ) : null}
          </Box>
        </Paper>
      </AnimatedReveal>
      <ExplorerProjectDialog
        fullScreen={fullScreenDialog}
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
      />
    </>
  );
};

export default ProjectsSectionContent;
