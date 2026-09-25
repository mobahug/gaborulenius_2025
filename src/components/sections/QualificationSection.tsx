import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { TimelineEvent, highlightedEvents, allEvents } from "../../contexts";
import { Transition } from "../Sections";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import CloseIcon from "@mui/icons-material/Close";
import { TimelineBlock } from "./TimelineBlock";
import { prefersReducedMotion } from "../../journey/device";
import { clamp } from "../../journey/math";
import { useScene } from "../../journey/useScene";

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`qualification-tabpanel-${index}`}
      aria-labelledby={`qualification-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const QualificationSection = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null,
  );
  const [tabIndex, setTabIndex] = useState(0);
  const trailRef = useRef<HTMLElement>(null);

  // "The Trail": the path between waypoints lights up to the middle of the
  // screen, and each waypoint glows once the walker has reached it.
  useScene(trailRef, (frame) => {
    const section = trailRef.current;
    if (!section) return;
    const reduced = prefersReducedMotion();
    const line = frame.viewport.vh * 0.58;
    const fills = Array.from(
      section.querySelectorAll<HTMLElement>(".trail-fill"),
    );
    const dots = Array.from(
      section.querySelectorAll<HTMLElement>(".trail-dot"),
    );
    const fillRects = fills.map((fill) =>
      fill.parentElement!.getBoundingClientRect(),
    );
    const dotRects = dots.map((dot) => dot.getBoundingClientRect());
    fills.forEach((fill, index) => {
      const rect = fillRects[index];
      const amount = reduced
        ? 1
        : clamp((line - rect.top) / Math.max(1, rect.height));
      fill.style.transform = `scaleY(${amount.toFixed(3)})`;
    });
    dots.forEach((dot, index) => {
      const rect = dotRects[index];
      const reached = reduced || rect.top + rect.height / 2 < line;
      dot.classList.toggle("trail-dot--reached", reached);
    });
  });

  const handleOpen = (evt: TimelineEvent) => {
    setSelectedEvent(evt);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

  return (
    <>
      <Paper
        component="section"
        ref={trailRef}
        aria-label="Experience and qualifications"
        className="trail-panel"
        sx={{
          pt: 0,
          width: { xs: "100%", md: "80%" },
          mx: "auto",
          borderRadius: "14px",
          background:
            theme.palette.mode === "dark"
              ? "rgba(4, 12, 18, 0.74)"
              : "rgba(10, 18, 12, 0.72)",
          backdropFilter: "none",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.45)",
          "&:hover": { transform: "none" },
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="Qualification Tabs"
          centered
          variant="fullWidth"
          sx={{
            p: 2,
          }}
        >
          <Tab
            label={<FormattedMessage id="qualificationTabHighlights" />}
            id="qualification-tab-0"
            aria-controls="qualification-tabpanel-0"
          />
          <Tab
            label={<FormattedMessage id="qualificationTabTimeline" />}
            id="qualification-tab-1"
            aria-controls="qualification-tabpanel-1"
          />
        </Tabs>
        <TabPanel value={tabIndex} index={0}>
          <TimelineBlock
            titleId="qualificationHeadingHighlights"
            events={highlightedEvents}
            onClick={handleOpen}
            isSmallScreen={isSmallScreen}
          />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <TimelineBlock
            titleId="qualificationHeadingTimeline"
            events={allEvents}
            onClick={handleOpen}
            isSmallScreen={isSmallScreen}
          />
        </TabPanel>
      </Paper>
      <QualificationDialog
        open={open}
        onClose={handleClose}
        event={selectedEvent}
      />
    </>
  );
};

type QualificationDialogProps = {
  open: boolean;
  onClose: () => void;
  event: TimelineEvent | null;
};

const QualificationDialog: React.FC<QualificationDialogProps> = ({
  open,
  onClose,
  event,
}) => {
  const theme = useTheme();
  const intl = useIntl();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
      slotProps={{
        transition: { timeout: { appear: 600, enter: 600, exit: 600 } },
        paper: {
          sx: {
            pt: 2,
            pb: 0,
            maxWidth: "750px",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        },
      }}
      aria-labelledby="qualification-dialog-title"
    >
      <DialogTitle
        id="qualification-dialog-title"
        component="h3"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          p: 0,
          pb: 5,
          color:
            theme.palette.mode === "dark"
              ? darkColors.textHeading
              : lightColors.textHeading,
        }}
      >
        <FormattedMessage id={event?.titleId} />
        <IconButton
          onClick={onClose}
          aria-label={intl.formatMessage({ id: "buttonClose" })}
          sx={{
            top: 2,
            right: -5,
            color:
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 0 }}>
        <DialogContentText
          component="div"
          sx={{
            color:
              theme.palette.mode === "dark"
                ? darkColors.textLight
                : lightColors.textLight,
          }}
        >
          {event?.details}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ py: 4 }}>
        <Button variant="contained" onClick={onClose}>
          <FormattedMessage id="buttonClose" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QualificationSection;
