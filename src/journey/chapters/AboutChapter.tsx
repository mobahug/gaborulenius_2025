import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useRef } from "react";
import { FormattedMessage } from "react-intl";
import { colors as lightColors } from "../../colors";
import { colors as darkColors } from "../../colorsDark";
import LinkThumbnail from "../../components/LinkThumbnail";
import { useThemeToggle } from "../../hooks/useThemeToggle";
import { assetUrl } from "../../utils/assets";
import { isWideLayout, prefersReducedMotion } from "../device";
import { easeInOutSine, range } from "../math";
import { useScene } from "../useScene";
import "./chapters.css";

const META_ITEMS = [
  { id: "aboutExperience", icon: <WorkIcon /> },
  { id: "aboutEducation", icon: <SchoolIcon /> },
  { id: "aboutLocation", icon: <LocationOnIcon /> },
];

/**
 * "Clearing of self": the text sits in the clearing while the story card is
 * discovered behind a painted leaf that slides past the camera.
 */
const AboutChapter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { selectedTheme } = useThemeToggle();
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLImageElement>(null);
  const accent =
    theme.palette.mode === "dark" ? darkColors.accent : lightColors.accent;

  useScene(sectionRef, (frame) => {
    if (prefersReducedMotion()) return;
    const { pass, viewport } = frame;
    const copy = copyRef.current;
    const card = cardRef.current;
    const leaf = leafRef.current;
    if (copy) {
      copy.style.transform = `translate3d(0, ${((0.5 - pass) * 60).toFixed(1)}px, 0)`;
    }
    if (card) {
      // The card sits deeper in the scene, so it drifts less.
      card.style.transform = `translate3d(0, ${((0.5 - pass) * 150).toFixed(1)}px, 0)`;
    }
    if (leaf) {
      // On wide screens the leaf lifts away up and to the right; on narrow
      // screens the text sits above the card, so it slides out sideways.
      const wide = isWideLayout();
      const part = easeInOutSine(
        range(pass, wide ? 0.22 : 0.3, wide ? 0.62 : 0.6),
      );
      const x = part * viewport.vw * (wide ? 0.2 : 0.75);
      const y = wide
        ? -part * viewport.vh * 0.42 + (0.5 - pass) * 240
        : part * 40;
      leaf.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(-38 + part * 26).toFixed(2)}deg) scale(${(1 + part * 0.35).toFixed(3)})`;
    }
  });

  return (
    <section
      ref={sectionRef}
      className="chapter chapter-about"
      aria-labelledby="about-heading"
    >
      <div className="about-layout">
        <div ref={copyRef} className="about-copy text-scrim">
          <h2 id="about-heading" className="chapter-title">
            <FormattedMessage id="aboutHeading" />
          </h2>
          <p className="chapter-lead about-body">
            <FormattedMessage
              id="aboutBody"
              values={{
                b: (chunks: React.ReactNode) => (
                  <Box component="span" sx={{ fontWeight: 650, color: accent }}>
                    {chunks}
                  </Box>
                ),
              }}
            />
          </p>
          <ul className="about-meta">
            {META_ITEMS.map(({ id, icon }) => (
              <li key={id}>
                <span className="about-meta-icon" aria-hidden="true">
                  {icon}
                </span>
                <FormattedMessage id={id} />
              </li>
            ))}
          </ul>
        </div>
        <div className="about-story">
          <div ref={cardRef} className="about-card">
            <LinkThumbnail
              id="linkThumbnailTitleGabor"
              descriptionId="linkThumbnailDescriptionGabor"
              image={assetUrl("profile2-small.webp")}
              urlEN="https://careers.tieto.com/career-story/2025-5/gabor-horvath-ulenius-a-non-traditional-journey-into-coding"
              urlFI="https://careers.tieto.com/career-story/2025-5/gabor-horvath-ulenius-a-non-traditional-journey-into-coding"
              readingMinutes={3}
              isArticle={true}
              date="05.2025"
              height={isMobile ? 160 : 240}
            />
          </div>
          <img
            ref={leafRef}
            className="about-leaf"
            src={assetUrl(
              selectedTheme === "dark" ? "dark-leaf.webp" : "light-leaf.webp",
            )}
            alt=""
            aria-hidden="true"
            width={408}
            height={953}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutChapter;
