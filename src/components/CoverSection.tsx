import React, { useRef, useEffect, useState } from "react";
import { colors as lightColors } from "../colors";
import { colors as darkColors } from "../colorsDark";
import { getCoverVisibility } from "./navbar/navConstants";
import { assetUrl } from "../utils/assets";

// Plain-DOM cover greetings. Avoids pulling react-intl into the LCP path.
const GREETINGS: Record<string, string> = {
  en: "Hi, I'm Gábor",
  fi: "Hei, olen Gábor",
};
const SCROLL_LABELS: Record<string, string> = {
  en: "Scroll Down",
  fi: "Vieritä alas",
};

const readDocumentLocale = (): string => {
  if (typeof document === "undefined") return "en";
  const value = document.documentElement.dataset.locale;
  return value === "fi" ? "fi" : "en";
};

const CoverSection: React.FC = () => {
  const coverRef = useRef<HTMLElement>(null);
  // Track <html data-locale> so the cover updates when the user toggles
  // language. The attribute is set both by the inline pre-React script in
  // index.html (initial paint) and by I18nWrapper (after React mounts).
  const [locale, setLocale] = useState<string>(readDocumentLocale);
  const greeting = GREETINGS[locale] ?? GREETINGS.en;
  const scrollLabel = SCROLL_LABELS[locale] ?? SCROLL_LABELS.en;

  useEffect(() => {
    const root = document.documentElement;
    // Sync once after mount in case I18nWrapper updated the attribute
    // between the initial render and this effect running.
    setLocale(readDocumentLocale());

    const observer = new MutationObserver(() => {
      setLocale(readDocumentLocale());
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-locale"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updateCover = () => {
      if (!coverRef.current) return;

      const cover = coverRef.current;
      const opacity = getCoverVisibility();

      cover.style.opacity = opacity.toString();
      cover.style.pointerEvents = opacity === 0 ? "none" : "auto";
      cover.style.display = opacity === 0 ? "none" : "flex";
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
    <>
      <section
        ref={coverRef}
        id="cover"
        className="cover-section"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "100svh",
          minHeight: "100vh",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          backgroundColor: lightColors.glassBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          color: lightColors.textLight,
          paddingLeft: 16,
          paddingRight: 16,
          transition: "opacity 0.5s ease-out",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 600 }}>
          <img
            alt="Gábor Ulenius"
            src={assetUrl("profile-160.webp")}
            srcSet={`${assetUrl("profile-160.webp")} 160w, ${assetUrl(
              "profile-320.webp",
            )} 320w`}
            sizes="(max-width: 600px) 140px, (max-width: 900px) 150px, 160px"
            width={160}
            height={160}
            decoding="async"
            // @ts-expect-error fetchpriority is valid HTML but not in React's typings yet
            fetchpriority="high"
            loading="eager"
            className="cover-avatar"
          />
          <h1 className="cover-greeting">{greeting}</h1>
          <a href="#home" className="cover-scroll" aria-label={scrollLabel}>
            <svg
              className="cover-scroll-icon"
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
            </svg>
            <span className="cover-scroll-label">{scrollLabel}</span>
          </a>
        </div>
        <style>{`
          .cover-avatar {
            display: block;
            width: 140px;
            height: 140px;
            margin: 0 auto 40px auto;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid ${lightColors.accent};
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
            background-color: ${lightColors.glassBg};
          }
          @media (min-width: 600px) {
            .cover-avatar { width: 150px; height: 150px; }
          }
          @media (min-width: 900px) {
            .cover-avatar { width: 160px; height: 160px; }
          }
          .cover-greeting {
            margin: 0 0 16px 0;
            font-size: 2rem;
            font-weight: 600;
            line-height: 1.2;
            color: ${lightColors.textHeading};
          }
          @media (min-width: 600px) { .cover-greeting { font-size: 2.5rem; } }
          @media (min-width: 900px) { .cover-greeting { font-size: 3rem; } }
          .cover-scroll {
            margin-top: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: ${lightColors.accentHover};
            text-decoration: none;
            animation: cover-bounce 2s infinite;
          }
          .cover-scroll-icon { color: ${lightColors.accentHover}; }
          .cover-scroll-label {
            font-size: 1.5rem;
            font-weight: 400;
            line-height: 1.334;
            color: ${lightColors.accentHover};
          }
          @keyframes cover-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(8px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .cover-scroll { animation: none; }
          }
          html[data-theme="dark"] .cover-section {
            color: ${darkColors.textLight} !important;
            background-color: ${darkColors.glassBg} !important;
          }
          html[data-theme="dark"] .cover-avatar {
            border-color: ${darkColors.accent};
            background-color: ${darkColors.glassBg};
          }
          html[data-theme="dark"] .cover-greeting { color: ${darkColors.textHeading}; }
          html[data-theme="dark"] .cover-scroll,
          html[data-theme="dark"] .cover-scroll-icon,
          html[data-theme="dark"] .cover-scroll-label { color: ${darkColors.accentHover}; }
        `}</style>
      </section>
      <div
        aria-hidden="true"
        style={{ height: "100svh", minHeight: "100vh" }}
      />
    </>
  );
};

export default CoverSection;
