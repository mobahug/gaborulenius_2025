import {
  Box,
  useMediaQuery,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { TimelineEvent, highlightedEvents, allEvents } from "../../contexts";
import { Transition } from "../Sections";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import CloseIcon from "@mui/icons-material/Close";
import { TimelineBlock } from "./TimelineBlock";

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

const QualificationSection = ({
  innerRef,
}: {
  innerRef: React.Ref<HTMLDivElement>;
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null,
  );
  const [tabIndex, setTabIndex] = useState(0);

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
        id="experience"
        aria-label="Experience and qualifications"
        ref={innerRef}
        sx={{ pt: 0, width: { xs: "100%", md: "80%" }, mx: "auto" }}
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
