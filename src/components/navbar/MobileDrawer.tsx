import React from "react";
import {
  SwipeableDrawer,
  List,
  ListItemButton,
  ListItem,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Stack,
  FormControlLabel,
  Switch,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { FormattedMessage } from "react-intl";
import { navLinks } from "./navConstants";
import { useThemeToggle } from "../../hooks/useThemeToggle";
import { useBirdEffect } from "../../hooks/useBirdEffect";
import { useLeavesEffect } from "../../hooks/useLeavesEffect";
import { LanguageToggle } from "./LanguageToggle";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import { useFireflyEffect } from "../../hooks/useFireflyEffect";
import { useActiveNavLink } from "../../hooks/useActiveNavLink";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
};

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  onOpen,
  isPlayingAudio,
  onToggleAudio,
}) => {
  const theme = useTheme();
  const { toggleTheme } = useThemeToggle();
  const { birdEnabled, toggleBirdEffects } = useBirdEffect();
  const { leavesEnabled, toggleLeavesEffects } = useLeavesEffect();
  const { firefliesEnabled, toggleFireflyEffects } = useFireflyEffect();
  const { currentActiveSectionId, requestActiveSection } = useActiveNavLink();

  const isDark = theme.palette.mode === "dark";
  const drawerBackgroundColor = isDark
    ? darkColors.drawerBg
    : lightColors.drawerBg;
  const textColor = isDark ? darkColors.textLight : lightColors.textLight;
  const headingColor = isDark
    ? darkColors.textHeading
    : lightColors.textHeading;
  const accentColor = isDark ? darkColors.accent : lightColors.accent;
  const dividerColor = isDark
    ? alpha(darkColors.dividerBg, 0.5)
    : alpha(lightColors.dividerBg, 0.7);

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen
      swipeAreaWidth={0}
      transitionDuration={{ enter: 350, exit: 300 }}
      ModalProps={{
        BackdropProps: {
          sx: {
            backgroundColor: alpha(
              isDark ? darkColors.overlayBg : lightColors.overlayBg,
              0.6,
            ),
            backdropFilter: "blur(4px)",
          },
        },
      }}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            bgcolor: drawerBackgroundColor,
            color: textColor,
            borderTopLeftRadius: theme.spacing(2.5),
            borderBottomLeftRadius: theme.spacing(2.5),
            boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.37)}`,
            p: theme.spacing(2, 0),
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2, mb: 1 }}>
        <IconButton
          onClick={onClose}
          aria-label="Close navigation menu"
          sx={{
            color: textColor,
          }}
        >
          <CloseIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      {/* Navigation List */}
      <List disablePadding sx={{ px: 1.5 }}>
        {navLinks.map(({ id, href }) => {
          const isActive = currentActiveSectionId === href;

          return (
            <ListItem key={id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component="a"
                href={href}
                selected={isActive}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  requestActiveSection(href);
                  onClose();
                }}
                sx={{
                  py: 1.25,
                  px: 2,
                  borderRadius: 0.5,
                  transition:
                    "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: alpha(accentColor, 0.12),
                    color: accentColor,
                  },
                  "&.Mui-selected": {
                    backgroundColor: alpha(accentColor, 0.16),
                    boxShadow: `inset 3px 0 0 ${accentColor}`,
                    color: accentColor,
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: alpha(accentColor, 0.2),
                  },
                  "&.Mui-focusVisible": {
                    backgroundColor: alpha(accentColor, 0.2),
                    boxShadow: `0 0 0 2px ${alpha(accentColor, 0.5)} inset`,
                  },
                }}
              >
                <ListItemText
                  primary={<FormattedMessage id={id} />}
                  slotProps={{
                    primary: {
                      fontWeight: 500,
                      fontSize: "1rem",
                      color: "inherit",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ bgcolor: dividerColor, mx: 2.5, my: 2 }} />

      {/* Social Icons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          px: 2.5,
          my: 1,
        }}
      >
        {[
          {
            href: "mailto:gaborulenius@gmail.com",
            label: "Email",
            icon: <EmailRoundedIcon />,
          },
          {
            href: "https://www.linkedin.com/in/g%C3%A0bor-horv%C3%A0th-ulenius-07526719a/",
            label: "LinkedIn",
            icon: <LinkedInIcon />,
          },
          {
            href: "https://github.com/mobahug",
            label: "GitHub",
            icon: <GitHubIcon />,
          },
        ].map((social) => (
          <IconButton
            key={social.label}
            component="a"
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            sx={{
              color: alpha(textColor, 0.7),
              transition: "color 0.2s ease, transform 0.2s ease",
              "&:hover": {
                color: accentColor,
                transform: "scale(1.15)",
              },
            }}
          >
            {social.icon}
          </IconButton>
        ))}
      </Box>

      <Divider sx={{ bgcolor: dividerColor, mx: 2.5, my: 2 }} />

      {/* Settings Section */}
      <Stack spacing={2} sx={{ px: 3.5 }}>
        <Typography variant="h6" sx={{ color: headingColor }}>
          <FormattedMessage id="headingSettings" />
        </Typography>

        {/* Theme & Language Controls */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ color: alpha(textColor, 0.8) }}>
              Mode:
            </Typography>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              aria-label="Toggle theme"
              sx={{ "&:hover": { color: accentColor } }}
            >
              {theme.palette.mode === "dark" ? (
                <LightModeOutlinedIcon />
              ) : (
                <DarkModeOutlinedIcon />
              )}
            </IconButton>
          </Stack>
          <IconButton color="inherit" onClick={onToggleAudio}>
            {isPlayingAudio ? (
              <PauseCircleOutlineIcon sx={{ fontSize: 32 }} />
            ) : (
              <PlayCircleOutlineIcon sx={{ fontSize: 32 }} />
            )}
          </IconButton>
          <LanguageToggle size="small" />
        </Stack>
        {/* Effects Section */}
        <Stack sx={{ px: 1 }}>
          <Typography variant="subtitle1" sx={{ color: headingColor }}>
            <FormattedMessage id="headingEffects" defaultMessage="Effects" />
          </Typography>
          <Stack spacing={1}>
            {[
              {
                labelId: "labelBird",
                checked: birdEnabled,
                onChange: toggleBirdEffects,
                disabled: false,
              },
              {
                labelId: "labelLeaves",
                checked: leavesEnabled,
                onChange: toggleLeavesEffects,
                disabled: false,
              },
              {
                labelId: "labelFireflies",
                checked: firefliesEnabled,
                onChange: toggleFireflyEffects,
                disabled: theme.palette.mode === "light",
              },
            ].map((effect) => (
              <FormControlLabel
                key={effect.labelId}
                control={
                  <Switch
                    checked={effect.checked}
                    onChange={effect.onChange}
                    disabled={effect.disabled}
                    color="primary"
                  />
                }
                label={<FormattedMessage id={effect.labelId} />}
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "0.9rem",
                  },
                  justifyContent: "space-between",
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </SwipeableDrawer>
  );
};

export default MobileDrawer;
