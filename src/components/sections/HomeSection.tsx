import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { AnimatedReveal } from "../AnimatedReveal";
import { assetUrl } from "../../utils/assets";

const HomeSection = ({ innerRef }: { innerRef: React.Ref<HTMLDivElement> }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <AnimatedReveal>
      <Paper
        component="section"
        id="home"
        aria-labelledby="home-heading"
        ref={innerRef}
        sx={{ width: { xs: "100%", md: "80%" }, mx: "auto" }}
      >
        <AnimatedReveal order={1}>
          <Typography
            id="home-heading"
            variant="h4"
            component="h2"
            gutterBottom
          >
            <FormattedMessage id="homeGreeting" />
          </Typography>
        </AnimatedReveal>
        <AnimatedReveal order={2}>
          <Typography variant="body1" sx={{ mb: 4 }}>
            <FormattedMessage id="homeSubtitle" />
          </Typography>
        </AnimatedReveal>
        <AnimatedReveal order={3}>
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
              href={assetUrl("Gabor_Ulenius_-_Full_Stack_Developer.pdf")}
              target="_blank"
              rel="noopener noreferrer"
              download
              startIcon={<FileDownloadIcon />}
            >
              <FormattedMessage id="homeBtnDownloadCv" />
            </Button>
          </Stack>
        </AnimatedReveal>
      </Paper>
    </AnimatedReveal>
  );
};

export default HomeSection;
