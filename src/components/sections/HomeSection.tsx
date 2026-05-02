import {
  useMediaQuery,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { fadeUp } from "../sectionMotion";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const HomeSection = ({ innerRef }: { innerRef: React.Ref<HTMLDivElement> }) => {
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
        id="home"
        aria-labelledby="home-heading"
        ref={innerRef}
        sx={{ width: { xs: "100%", md: "80%" }, mx: "auto" }}
      >
        <motion.div custom={1} variants={fadeUp}>
          <Typography
            id="home-heading"
            variant="h4"
            component="h2"
            gutterBottom
          >
            <FormattedMessage
              id="homeGreeting"
              values={{
                name: (
                  <Box component="span" sx={{ color: "primary.main" }}>
                    Gábor Ulenius
                  </Box>
                ),
              }}
            />
          </Typography>
        </motion.div>
        <motion.div custom={2} variants={fadeUp}>
          <Typography variant="body1" sx={{ mb: 4 }}>
            <FormattedMessage id="homeSubtitle" />
          </Typography>
        </motion.div>
        <motion.div custom={3} variants={fadeUp}>
          <Stack
            direction={isSmallScreen ? "column" : "row"}
            spacing={4}
            justifyContent="flex-end"
          >
            <Button
              variant="contained"
              href="#projects"
              startIcon={<SearchIcon />}
            >
              <FormattedMessage id="homeBtnExplore" />
            </Button>
            <Button
              variant="contained"
              component="a"
              href="/gaborulenius/Gabor_Ulenius_-_Full_Stack_Developer.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download
              startIcon={<FileDownloadIcon />}
            >
              <FormattedMessage id="homeBtnDownloadCv" />
            </Button>
          </Stack>
        </motion.div>
      </Paper>
    </motion.div>
  );
};

export default HomeSection;
