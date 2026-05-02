import React, { useRef, useEffect } from "react";
import { Box, Typography, Avatar, Link, useTheme } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { colors as lightColors } from "../colors";
import { colors as darkColors } from "../colorsDark";
import { FormattedMessage } from "react-intl";

const CoverSection: React.FC = () => {
  const theme = useTheme();
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updateCover = () => {
      if (coverRef.current) {
        const scrollY = window.scrollY;
        const fadeOutPoint = 300;
        const opacity = Math.max(0, 1 - scrollY / fadeOutPoint);
        const cover = coverRef.current;

        cover.style.opacity = opacity.toString();
        cover.style.pointerEvents = opacity === 0 ? "none" : "auto";
        cover.style.display = opacity === 0 ? "none" : "flex";
      }
    };

    const handleScroll = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        updateCover();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateCover();
    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box
      ref={coverRef}
      id="cover"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "100vh",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        bgcolor:
          theme.palette.mode === "dark"
            ? darkColors.glassBg
            : lightColors.glassBg,
        backdropFilter: "blur(20px)",
        color:
          theme.palette.mode === "dark"
            ? darkColors.textLight
            : lightColors.textLight,
        px: 2,
        transition: "opacity 0.5s ease-out",
      }}
    >
      <Box sx={{ maxWidth: 600 }}>
        <Avatar
          alt="Gabor Ulenius"
          src="/gaborulenius/profile-small.webp"
          sx={{
            width: { xs: 140, sm: 150, md: 160 },
            height: { xs: 140, sm: 150, md: 160 },
            mb: 5,
            mx: "auto",
            borderRadius: "50%",
            border: `4px solid ${
              theme.palette.mode === "dark"
                ? darkColors.accent
                : lightColors.accent
            }`,
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.5)",
          }}
        />
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            color:
              theme.palette.mode === "dark"
                ? darkColors.textHeading
                : lightColors.textHeading,
            mb: 2,
          }}
        >
          <FormattedMessage
            id="coverGreeting"
            values={{ name: "Gábor" }}
          />
        </Typography>
        <Link
          href="#home"
          underline="none"
          sx={{
            mt: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            color:
              theme.palette.mode === "dark"
                ? darkColors.accentHover
                : lightColors.accentHover,
            animation: "bounce 2s infinite",
            textDecoration: "none",
          }}
        >
          <ExpandMoreIcon
            sx={{
              color:
                theme.palette.mode === "dark"
                  ? darkColors.accentHover
                  : lightColors.accentHover,
            }}
            fontSize="large"
          />
          <Typography
            variant="h5"
            color={
              theme.palette.mode === "dark"
                ? darkColors.accentHover
                : lightColors.accentHover
            }
          >
            <FormattedMessage id="coverScroll" />
          </Typography>
        </Link>
        <style>
          {`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(8px); }
            }
          `}
        </style>
      </Box>
    </Box>
  );
};

export default CoverSection;
