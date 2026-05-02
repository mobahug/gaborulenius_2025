import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/Launch";
import { motion } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { projects } from "../../contexts";
import { fadeUp } from "../sectionMotion";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import { useAtomValue } from "jotai";
import { localeAtom } from "../../hooks/localeAtom";

const ProjectsSection = ({
  innerRef,
}: {
  innerRef: React.Ref<HTMLDivElement>;
}) => {
  const theme = useTheme();
  const locale = useAtomValue(localeAtom);
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Paper
        component="section"
        id="projects"
        aria-labelledby="projects-heading"
        ref={innerRef}
        sx={{ width: { xs: "100%", md: "80%" }, mx: "auto" }}
      >
        <motion.div custom={1} variants={fadeUp}>
          <Typography
            id="projects-heading"
            variant="h4"
            component="h2"
            gutterBottom
          >
            <FormattedMessage id="projectHeading" />
          </Typography>
        </motion.div>
        <List disablePadding>
          {projects.map(({ id, hrefEN, hrefFI }, i) => {
            const href = locale === "fi" ? hrefFI : hrefEN;
            const itemContent = (
              <ListItemText
                primary={
                  <Typography variant="body1">
                    <FormattedMessage id={id} />
                  </Typography>
                }
                secondary={
                  !href && (
                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage id="noLinkAvailable" />
                    </Typography>
                  )
                }
              />
            );

            return (
              <motion.div key={id} custom={i + 2} variants={fadeUp}>
                {href ? (
                  <ListItemButton
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    alignItems="flex-start"
                    sx={{
                      borderRadius: 1,
                      transition: "background .25s, box-shadow .25s",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,.04)",
                        boxShadow: "0 2px 8px rgba(0,0,0,.25)",
                      },
                    }}
                  >
                    {itemContent}
                    <OpenInNewIcon
                      sx={{
                        ml: 1,
                        fontSize: 20,
                        color:
                          theme.palette.mode === "dark"
                            ? darkColors.accent
                            : lightColors.accent,
                        flexShrink: 0,
                      }}
                    />
                  </ListItemButton>
                ) : (
                  <ListItem alignItems="flex-start" sx={{ borderRadius: 1 }}>
                    {itemContent}
                  </ListItem>
                )}
              </motion.div>
            );
          })}
        </List>
      </Paper>
    </motion.div>
  );
};

export default ProjectsSection;
