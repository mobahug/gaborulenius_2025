import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";
import { TimelineEvent } from "../../contexts";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import AnimatedReveal from "../AnimatedReveal";

type TimelineBlockProps = {
  titleId: string;
  events: TimelineEvent[];
  onClick: (evt: TimelineEvent) => void;
  isSmallScreen: boolean;
};

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  titleId,
  events,
  onClick,
  isSmallScreen,
}) => {
  const theme = useTheme();
  return (
    <AnimatedReveal>
      <AnimatedReveal order={1}>
        <Typography
          id={`${titleId}-heading`}
          variant="h4"
          component="h2"
          gutterBottom
        >
          <FormattedMessage id={titleId} />
        </Typography>
      </AnimatedReveal>

      <Timeline
        position={isSmallScreen ? "right" : "alternate"}
        sx={{
          padding: 0,
          "& .MuiTimelineItem-root:before": {
            display: isSmallScreen ? "none" : undefined,
          },
        }}
      >
        {events.map((evt, i) => (
          <AnimatedReveal
            key={evt.titleId}
            component={TimelineItem}
            order={i + 2}
          >
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  boxShadow: `0 0 8px ${alpha(theme.palette.mode === "dark" ? darkColors.accent : lightColors.accent, 0.5)}`,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? darkColors.btnBg
                      : lightColors.btnBg,
                  color:
                    theme.palette.mode === "dark"
                      ? darkColors.textLight
                      : lightColors.textLight,
                  border: `2px solid ${
                    theme.palette.mode === "dark"
                      ? darkColors.accent
                      : lightColors.accent
                  }`,
                }}
                variant="outlined"
              >
                {evt.icon}
              </TimelineDot>
              {i < events.length - 1 && (
                <TimelineConnector
                  sx={{
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? darkColors.dividerBg
                        : lightColors.dividerBg,
                  }}
                />
              )}
            </TimelineSeparator>

            <TimelineContent
              onClick={() => onClick(evt)}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,.04)",
                  borderRadius: 0.5,
                  boxShadow: "0 2px 8px rgba(0,0,0,.25)",
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700 }}
                gutterBottom
              >
                <FormattedMessage id={evt.titleId} />{" "}
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </Typography>
              <Box
                component="time"
                dateTime={evt.whenId}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  color: "primary.main",
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: 18 }} />
                <Box component="span" sx={{ fontSize: "0.9rem" }}>
                  <FormattedMessage id={evt.whenId} />
                </Box>
              </Box>
            </TimelineContent>
          </AnimatedReveal>
        ))}
      </Timeline>
    </AnimatedReveal>
  );
};
