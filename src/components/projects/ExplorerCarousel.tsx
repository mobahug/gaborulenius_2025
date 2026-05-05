import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useCallback, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { assetUrl } from "../../utils/assets";
import { explorerScreenshots } from "./explorerProjectData";

const screenshotAspectRatio = "397 / 844";

const ExplorerCarousel = ({ large = false }: { large?: boolean }) => {
  const intl = useIntl();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeScreenshot = explorerScreenshots[activeIndex];

  const scrollToIndex = useCallback((index: number) => {
    const nextIndex =
      (index + explorerScreenshots.length) % explorerScreenshots.length;
    setActiveIndex(nextIndex);
    scrollerRef.current?.scrollTo({
      left: scrollerRef.current.clientWidth * nextIndex,
      behavior: "smooth",
    });
  }, []);

  const handleScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) {
      return;
    }

    const nextIndex = Math.round(scroller.scrollLeft / scroller.clientWidth);
    if (
      nextIndex !== activeIndex &&
      nextIndex >= 0 &&
      nextIndex < explorerScreenshots.length
    ) {
      setActiveIndex(nextIndex);
    }
  }, [activeIndex]);

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: large ? 440 : 300,
          mx: "auto",
        }}
      >
        <Box
          ref={scrollerRef}
          role="region"
          aria-label={intl.formatMessage({
            id: "projectExplorerGalleryLabel",
          })}
          onScroll={handleScroll}
          sx={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            borderRadius: "12px",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {explorerScreenshots.map(({ src, altId }, index) => (
            <Box
              key={src}
              sx={{
                minWidth: "100%",
                display: "flex",
                justifyContent: "center",
                scrollSnapAlign: "center",
                px: 1,
              }}
            >
              <Box
                component="img"
                src={assetUrl(src)}
                alt={intl.formatMessage({ id: altId })}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                width={397}
                height={844}
                sx={{
                  width: large
                    ? { xs: 188, sm: 245, md: 284 }
                    : { xs: 179, sm: 202 },
                  maxWidth: "100%",
                  height: "auto",
                  aspectRatio: screenshotAspectRatio,
                  objectFit: "contain",
                  borderRadius: "12px",
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              />
            </Box>
          ))}
        </Box>
        <IconButton
          aria-label={intl.formatMessage({
            id: "projectExplorerGalleryPrevious",
          })}
          onClick={() => scrollToIndex(activeIndex - 1)}
          sx={{
            position: "absolute",
            left: { xs: 0, sm: 0 },
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            backgroundColor: "rgba(0,0,0,.45)",
            backdropFilter: "blur(8px)",
            "&:hover": { backgroundColor: "rgba(0,0,0,.6)" },
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton
          aria-label={intl.formatMessage({
            id: "projectExplorerGalleryNext",
          })}
          onClick={() => scrollToIndex(activeIndex + 1)}
          sx={{
            position: "absolute",
            right: { xs: 0, sm: 0 },
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            backgroundColor: "rgba(0,0,0,.45)",
            backdropFilter: "blur(8px)",
            "&:hover": { backgroundColor: "rgba(0,0,0,.6)" },
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
      <Typography
        variant="caption"
        component="p"
        sx={{ display: "block", textAlign: "center", mt: 2 }}
      >
        <FormattedMessage id={activeScreenshot.titleId} />
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        justifyContent="center"
        sx={{ mt: 2 }}
      >
        {explorerScreenshots.map((screenshot, index) => {
          const isActive = index === activeIndex;
          return (
            <Box
              key={screenshot.src}
              component="button"
              type="button"
              aria-label={intl.formatMessage(
                { id: "projectExplorerGalleryGoTo" },
                {
                  title: intl.formatMessage({ id: screenshot.titleId }),
                },
              )}
              aria-current={isActive ? "true" : undefined}
              onClick={() => scrollToIndex(index)}
              sx={{
                width: isActive ? 22 : 8,
                height: 8,
                p: 0,
                border: 0,
                borderRadius: 99,
                cursor: "pointer",
                backgroundColor: isActive ? "primary.main" : "text.secondary",
                opacity: isActive ? 1 : 0.45,
                transition: "width .2s ease, opacity .2s ease",
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

export default ExplorerCarousel;
