import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/Launch";
import { useAtomValue } from "jotai";
import { motion } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { projects } from "../../contexts";
import { localeAtom } from "../../hooks/localeAtom";
import { fadeUp } from "../sectionMotion";

type WorkProjectsPanelProps = {
  accent: string;
};

const WorkProjectsPanel = ({ accent }: WorkProjectsPanelProps) => {
  const locale = useAtomValue(localeAtom);

  return (
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
          <motion.div
            key={id}
            initial={false}
            animate="visible"
            custom={i + 2}
            variants={fadeUp}
          >
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
                    color: accent,
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
  );
};

export default WorkProjectsPanel;
