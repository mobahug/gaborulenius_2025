import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import OpenInNewIcon from "@mui/icons-material/Launch";
import { useAtomValue } from "jotai";
import { FormattedMessage } from "react-intl";
import { projects } from "../../contexts";
import { localeAtom } from "../../hooks/localeAtom";
import AnimatedReveal from "../AnimatedReveal";

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
          <ListItem
            key={id}
            disablePadding
            alignItems="flex-start"
            sx={{ borderRadius: 1 }}
          >
            <AnimatedReveal order={i + 2} style={{ width: "100%" }}>
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
                <Box sx={{ p: 2 }}>{itemContent}</Box>
              )}
            </AnimatedReveal>
          </ListItem>
        );
      })}
    </List>
  );
};

export default WorkProjectsPanel;
