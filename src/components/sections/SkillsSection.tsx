import { Paper, Typography, Stack, Box, Chip, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import { categories } from "../../contexts";
import { fadeUp } from "../sectionMotion";

const SkillsSection = ({
  innerRef,
}: {
  innerRef: React.Ref<HTMLDivElement>;
}) => {
  const theme = useTheme();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Paper
        component="section"
        id="skills-tools"
        aria-labelledby="skills-heading"
        ref={innerRef}
        sx={{ width: { xs: "100%", md: "80%" }, mx: "auto" }}
      >
        <motion.div custom={1} variants={fadeUp}>
          <Typography
            id="skills-heading"
            variant="h4"
            component="h2"
            gutterBottom
          >
            <FormattedMessage id="skillsToolsHeading" />
          </Typography>
        </motion.div>
        <Stack spacing={4}>
          {categories.map((cat, idx) => (
            <motion.div key={cat.id} custom={idx + 2} variants={fadeUp}>
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
            </motion.div>
          ))}
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default SkillsSection;
