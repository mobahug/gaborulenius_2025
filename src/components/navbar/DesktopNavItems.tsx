import React from "react";
import {
  Box,
  IconButton,
  Avatar,
  Link as MuiLink,
  alpha,
  useTheme,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import { FormattedMessage } from "react-intl";
import { navLinks } from "./navConstants";
import { LanguageToggle } from "./LanguageToggle";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import { useActiveNavLink } from "../../hooks/useActiveNavLink";

type DesktopNavItemsProps = {
  selectedThemeVariant: "light" | "dark";
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
};

const DesktopNavItems: React.FC<DesktopNavItemsProps> = ({
  selectedThemeVariant,
  onToggleTheme,
  onOpenSettings,
  isPlayingAudio,
  onToggleAudio,
}) => {
  const theme = useTheme();
  const { currentActiveSectionId, requestActiveSection } = useActiveNavLink();
  const activeColor =
    theme.palette.mode === "dark" ? darkColors.accent : lightColors.accent;
  const activeHoverColor =
    theme.palette.mode === "dark"
      ? darkColors.accentHover
      : lightColors.accentHover;
  const inactiveColor =
    theme.palette.mode === "dark"
      ? darkColors.textLight
      : lightColors.textLight;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
      <LanguageToggle />
      {navLinks.map(({ id, href }) => {
        const isActive = currentActiveSectionId === href;
        return (
          <MuiLink
            key={id}
            href={href}
            underline="none"
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              requestActiveSection(href);
            }}
            sx={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: isActive ? activeColor : inactiveColor,
              position: "relative",
              transition: "color 0.18s ease, background-color 0.18s ease",
              "&:hover": {
                color: activeHoverColor,
                backgroundColor: alpha(activeColor, 0.08),
              },
              "&:focus-visible": {
                outline: `2px solid ${alpha(activeColor, 0.55)}`,
                outlineOffset: 3,
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 4,
                left: 12,
                width: "calc(100% - 24px)",
                height: 2,
                borderRadius: 1,
                backgroundColor: activeColor,
                transform: isActive ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "center",
                transition: "transform 0.18s ease",
              },
            }}
          >
            <FormattedMessage id={id} />
          </MuiLink>
        );
      })}
      <IconButton color="inherit" onClick={onToggleTheme}>
        {selectedThemeVariant === "dark" ? (
          <LightModeOutlinedIcon />
        ) : (
          <DarkModeOutlinedIcon />
        )}
      </IconButton>
      <MuiLink underline="none">
        <Box
          sx={{
            position: "relative",
            width: 35,
            height: 35,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <Avatar
            src="/gaborulenius/profile-small.webp"
            alt="Profile"
            sx={{
              width: 35,
              height: 35,
              border: `2px solid ${theme.palette.mode === "dark" ? darkColors.accent : lightColors.accent}`,
            }}
          />
          <IconButton
            onClick={onOpenSettings}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              bgcolor: "rgba(0,0,0,0)",
              transition: "background-color 0.3s, opacity 0.5s",
              opacity: 0,
              "&:hover": { bgcolor: "rgba(0,0,0,0.5)", opacity: 1 },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </MuiLink>
      <IconButton color="inherit" onClick={onToggleAudio}>
        {isPlayingAudio ? (
          <PauseCircleOutlineIcon sx={{ fontSize: 32 }} />
        ) : (
          <PlayCircleOutlineIcon sx={{ fontSize: 32 }} />
        )}
      </IconButton>
    </Box>
  );
};

export default DesktopNavItems;
