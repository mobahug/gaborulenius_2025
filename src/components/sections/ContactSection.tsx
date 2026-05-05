import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";
import EmailIcon from "@mui/icons-material/Email";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AnimatedReveal from "../AnimatedReveal";

const ContactSection = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <AnimatedReveal>
      <Paper
        component="section"
        aria-labelledby="contact-heading"
        sx={{
          minWidth: isSmallScreen ? null : 700,
          width: { xs: "100%", md: "80%" },
          mx: "auto",
        }}
      >
        <AnimatedReveal order={1}>
          <Typography
            id="contact-heading"
            variant="h4"
            component="h2"
            gutterBottom
          >
            <FormattedMessage id="contactHeading" />
          </Typography>
        </AnimatedReveal>
        <AnimatedReveal order={2}>
          <Typography variant="body1" pb={4}>
            <FormattedMessage id="contactIntro" />
          </Typography>
        </AnimatedReveal>
        <AnimatedReveal order={4}>
          <Stack
            direction={isSmallScreen ? "column" : "row"}
            spacing={4}
            justifyContent="flex-end"
          >
            <Button
              variant="contained"
              component="a"
              href="mailto:gaborulenius@gmail.com"
              startIcon={<EmailIcon />}
            >
              <FormattedMessage id="contactBtnEmail" />
            </Button>
            <Button
              variant="contained"
              component="a"
              href="https://www.linkedin.com/in/g%C3%A0bor-horv%C3%A0th-ulenius-07526719a/"
              target="_blank"
              rel="me noopener noreferrer"
              startIcon={<LinkedInIcon />}
            >
              <FormattedMessage id="contactBtnLinkedIn" />
            </Button>
          </Stack>
        </AnimatedReveal>
      </Paper>
    </AnimatedReveal>
  );
};

export default ContactSection;
