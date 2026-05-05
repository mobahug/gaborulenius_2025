import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import { FormattedMessage } from "react-intl";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import LinkThumbnail from "../LinkThumbnail";
import { AnimatedReveal } from "../AnimatedReveal";
import { assetUrl } from "../../utils/assets";

const META_ITEMS = [
  {
    id: "aboutExperience",
    icon: <WorkIcon />,
  },
  {
    id: "aboutEducation",
    icon: <SchoolIcon />,
  },
  {
    id: "aboutLocation",
    icon: <LocationOnIcon />,
  },
];

const AboutSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AnimatedReveal>
      <Paper
        component="section"
        aria-labelledby="about-heading"
        sx={{ width: { xs: "100%", md: "80%" }, mx: "auto" }}
      >
        <AnimatedReveal order={1}>
          <Typography
            id="about-heading"
            variant="h4"
            component="h2"
            gutterBottom
          >
            <FormattedMessage id="aboutHeading" />
          </Typography>
        </AnimatedReveal>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AnimatedReveal order={2}>
              <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                <FormattedMessage
                  id="aboutBody"
                  values={{
                    b: (chunks: React.ReactNode) => (
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 600,
                          color:
                            theme.palette.mode === "dark"
                              ? darkColors.accent
                              : lightColors.accent,
                        }}
                      >
                        {chunks}
                      </Box>
                    ),
                  }}
                />
              </Typography>
            </AnimatedReveal>
            <AnimatedReveal order={4}>
              <List>
                {META_ITEMS.map(({ id, icon }) => (
                  <ListItem key={id} disablePadding>
                    <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <FormattedMessage id={id} />
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AnimatedReveal>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AnimatedReveal order={3}>
              <LinkThumbnail
                id="linkThumbnailTitleGabor"
                descriptionId="linkThumbnailDescriptionGabor"
                image={assetUrl("profile2-small.webp")}
                urlEN="https://careers.tieto.com/career-story/2025-5/gabor-horvath-ulenius-a-non-traditional-journey-into-coding"
                urlFI="https://careers.tieto.com/career-story/2025-5/gabor-horvath-ulenius-a-non-traditional-journey-into-coding"
                readingMinutes={3}
                isArticle={true}
                date="05.2025"
                height={isMobile ? 140 : 210}
              />
            </AnimatedReveal>
          </Grid>
        </Grid>
      </Paper>
    </AnimatedReveal>
  );
};

export default AboutSection;
