import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import { categories } from "../../contexts";
import AnimatedReveal from "../AnimatedReveal";

const SkillsSection = () => {
  const theme = useTheme();
  return (
    <AnimatedReveal>
      <Paper
        component="section"
        aria-labelledby="skills-heading"
        sx={{ width: { xs: "100%", md: "80%" }, mx: "auto" }}
      >
        <AnimatedReveal order={1}>
          <Typography
            id="skills-heading"
            variant="h4"
            component="h2"
            gutterBottom
          >
            <FormattedMessage id="skillsToolsHeading" />
          </Typography>
        </AnimatedReveal>
        <Stack spacing={4}>
          {categories.map((cat, idx) => (
            <AnimatedReveal key={cat.id} order={idx + 2}>
              <Typography
                variant="h6"
                sx={{
                  color:
                    theme.palette.mode === "dark"
                      ? darkColors.textLight
                      : lightColors.textLight,
                  mb: 2,
                }}
              >
                <FormattedMessage id={cat.id} />
              </Typography>
              <Box
                component="ul"
                sx={{
                  listStyle: "none",
                  p: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                {cat.items.map((skill) => (
                  <Box component="li" key={skill}>
                    <Chip
                      label={skill}
                      size="medium"
                      clickable
                      sx={{
                        border: `1px solid ${
                          theme.palette.mode === "dark"
                            ? darkColors.glassBorder
                            : lightColors.glassBorder
                        }`,
                        bgcolor: "rgba(255,255,255,0.1)",
                        color:
                          theme.palette.mode === "dark"
                            ? darkColors.accent
                            : lightColors.accent,
                        transition: "background 0.3s",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </AnimatedReveal>
          ))}
        </Stack>
      </Paper>
    </AnimatedReveal>
  );
};

export default SkillsSection;
