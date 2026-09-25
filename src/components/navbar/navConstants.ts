export const COVER_FADE_MIN_PX = 300;
export const COVER_FADE_VIEWPORT_RATIO = 0.85;

export const getCoverFadeThreshold = () =>
  Math.max(COVER_FADE_MIN_PX, window.innerHeight * COVER_FADE_VIEWPORT_RATIO);

// Returns 1 while cover should be fully visible, 0 once it should be fully hidden.
// Cover is fully gone the moment the home section's TOP reaches viewport center.
export const getCoverVisibility = () => {
  const viewportHeight = window.innerHeight;
  const viewportCenter = viewportHeight / 2;
  const homeEl = document.getElementById("home");

  if (!homeEl) {
    const fadeOutPoint = getCoverFadeThreshold();
    return Math.max(0, 1 - window.scrollY / fadeOutPoint);
  }

  const rect = homeEl.getBoundingClientRect();
  const distance = rect.top - viewportCenter;
  // Short, snappy fade: cover goes from full to gone over ~25% of viewport height.
  const fadeRange = viewportHeight * 0.25;
  return Math.min(1, Math.max(0, distance / fadeRange));
};

export const navLinks = [
  { id: "navHome", href: "#home" },
  { id: "navAbout", href: "#about" },
  { id: "navExperience", href: "#experience" },
  { id: "navProjects", href: "#projects" },
  { id: "navSkills", href: "#skills" },
  { id: "navContact", href: "#contact" },
];

export type TabKey = "effects" | "appearance" | "language";

export const tabConfig: { key: TabKey; id: string }[] = [
  { key: "effects", id: "tabsEffects" },
  { key: "appearance", id: "tabsAppearance" },
  { key: "language", id: "tabsLanguage" },
];
