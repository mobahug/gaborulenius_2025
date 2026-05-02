import {
  useMediaQuery,
  Paper,
  Typography,
  Stack,
  Button,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { fadeUp } from "../sectionMotion";
import EmailIcon from "@mui/icons-material/Email";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const ContactSection = ({
  innerRef,
}: {
  innerRef: React.Ref<HTMLDivElement>;
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Paper
        component="section"
        id="contact"
        aria-labelledby="contact-heading"
        ref={innerRef}
        sx={{
          minWidth: isSmallScreen ? null : 700,
          width: { xs: "100%", md: "80%" },
          mx: "auto",
        }}
      >
        <motion.div custom={1} variants={fadeUp}>
          <Typography
            id="contact-heading"
            variant="h4"
            component="h2"
            gutterBottom
          >
            <FormattedMessage id="contactHeading" />
          </Typography>
        </motion.div>
        <motion.div custom={2} variants={fadeUp}>
          <Typography variant="body1" pb={4}>
            <FormattedMessage id="contactIntro" />
          </Typography>
        </motion.div>
        <motion.div custom={4} variants={fadeUp}>
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
        </motion.div>
      </Paper>
    </motion.div>
  );
};

export default ContactSection;
