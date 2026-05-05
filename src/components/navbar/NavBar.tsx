import React, { useState, useEffect, useRef, useCallback } from "react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import { useThemeToggle } from "../../hooks/useThemeToggle";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import { assetUrl } from "../../utils/assets";

const ShowAfterCover = React.lazy(() => import("./ShowAfterCover"));
const SettingsDialog = React.lazy(() => import("./SettingsDialog"));
const MobileDrawer = React.lazy(() => import("./MobileDrawer"));
const DesktopNavItems = React.lazy(() => import("./DesktopNavItems"));

export const NavBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileDrawerLoaded, setMobileDrawerLoaded] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [settingsDialogLoaded, setSettingsDialogLoaded] = useState(false);
  const { selectedTheme, toggleTheme } = useThemeToggle();

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioSrcRef = useRef<string | null>(null);

  const toggleMobileDrawer = (open: boolean) => () => {
    if (open) {
      setMobileDrawerLoaded(true);
    }
    setMobileDrawerOpen(open);
  };
  const handleOpenSettings = () => {
    setSettingsDialogLoaded(true);
    setSettingsDialogOpen(true);
  };
  const handleCloseSettings = () => setSettingsDialogOpen(false);

  const getAudioSrc = useCallback(
    () =>
      selectedTheme === "dark"
        ? assetUrl("jungle-music-night.mp3")
        : assetUrl("jungle-music.mp3"),
    [selectedTheme],
  );

  const ensureAudio = useCallback(() => {
    const newSrc = getAudioSrc();
    const audio = audioRef.current ?? new Audio();

    if (!audioRef.current) {
      audio.loop = true;
      audio.preload = "none";
      audioRef.current = audio;
    }

    if (audioSrcRef.current !== newSrc) {
      audio.pause();
      audio.src = newSrc;
      audioSrcRef.current = newSrc;
    }

    return audio;
  }, [getAudioSrc]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const audio = ensureAudio();

    if (isPlaying) {
      audio.play().catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });
    }
  }, [ensureAudio, isPlaying]);

  const handlePlayPause = () => {
    const audio = ensureAudio();

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          if (err.name !== "AbortError") console.error(err);
        });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <React.Suspense fallback={null}>
        <ShowAfterCover>
          <AppBar
            position="fixed"
            elevation={0}
            sx={{
              px: 2,
              borderRadius: 0,
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              backdropFilter: "blur(10px)",
              height: isMobile ? "72px" : "64px",
              py: 0,
              justifyContent: "center",
            }}
          >
            <Toolbar
              disableGutters
              sx={{
                minHeight: "72px",
                px: 1.5,
                py: 0,
                justifyContent: isMobile ? "space-between" : "center",
              }}
            >
              {isMobile ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <MuiLink href="#home" underline="none">
                    <Avatar
                      src={assetUrl("profile-160.webp")}
                      alt="Profile"
                      sx={{
                        width: 44,
                        height: 44,
                        border: `2px solid ${theme.palette.mode === "dark" ? darkColors.accent : lightColors.accent}`,
                      }}
                    />
                  </MuiLink>
                  <IconButton color="inherit" onClick={handlePlayPause}>
                    {isPlaying ? (
                      <PauseCircleOutlineIcon fontSize="large" />
                    ) : (
                      <PlayCircleOutlineIcon fontSize="large" />
                    )}
                  </IconButton>
                  <IconButton
                    color="inherit"
                    onClick={toggleMobileDrawer(true)}
                  >
                    <MenuIcon fontSize="large" />
                  </IconButton>
                </Box>
              ) : (
                <React.Suspense fallback={null}>
                  <DesktopNavItems
                    selectedThemeVariant={selectedTheme}
                    onToggleTheme={toggleTheme}
                    onOpenSettings={handleOpenSettings}
                    isPlayingAudio={isPlaying}
                    onToggleAudio={handlePlayPause}
                  />
                </React.Suspense>
              )}
            </Toolbar>
          </AppBar>
        </ShowAfterCover>
      </React.Suspense>
      {mobileDrawerLoaded ? (
        <React.Suspense fallback={null}>
          <MobileDrawer
            open={mobileDrawerOpen}
            onClose={toggleMobileDrawer(false)}
            onOpen={toggleMobileDrawer(true)}
            isPlayingAudio={isPlaying}
            onToggleAudio={handlePlayPause}
          />
        </React.Suspense>
      ) : null}
      {settingsDialogLoaded ? (
        <React.Suspense fallback={null}>
          <SettingsDialog
            open={settingsDialogOpen}
            onClose={handleCloseSettings}
          />
        </React.Suspense>
      ) : null}
    </>
  );
};

export default NavBar;
