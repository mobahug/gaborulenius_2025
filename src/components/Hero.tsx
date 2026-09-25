import React, { useMemo, useRef } from "react";
import Container from "@mui/material/Container";
import { FormattedMessage } from "react-intl";
import type { SectionInfo } from "./BirdManager";
import { useBirdEffect } from "../hooks/useBirdEffect";
import { useActiveNavScrollSpy } from "../hooks/useActiveNavLink";
import { DeferredSection } from "./DeferredSection";
import IntroChapter from "../journey/chapters/IntroChapter";
import PortalChapter from "../journey/chapters/PortalChapter";

const BirdManager = React.lazy(() => import("./BirdManager"));
const AboutChapter = React.lazy(
  () => import("../journey/chapters/AboutChapter"),
);
const QualificationSection = React.lazy(
  () => import("./sections/QualificationSection"),
);
const NeuralChapter = React.lazy(
  () => import("../journey/chapters/NeuralChapter"),
);
const ExplorerChapter = React.lazy(
  () => import("../journey/chapters/ExplorerChapter"),
);
const WorkChapter = React.lazy(() => import("../journey/chapters/WorkChapter"));
const SkillsChapter = React.lazy(
  () => import("../journey/chapters/SkillsChapter"),
);
const ContactChapter = React.lazy(
  () => import("../journey/chapters/ContactChapter"),
);
const Footer = React.lazy(() => import("./Footer"));

// Placeholder heights while a chapter's code has not loaded yet. Pinned
// desktop chapters have fixed heights, so their placeholders are exact.
const DEFERRED_SECTION_HEIGHTS = {
  about: { mobile: 1100, tablet: 900, desktop: 820 },
  experience: { mobile: 1000, tablet: 900, desktop: 900 },
  neural: { mobile: 2200, tablet: 1900, desktop: 1500 },
  explorer: { mobile: 1500, tablet: 1500, desktop: "360vh" },
  work: { mobile: 1400, tablet: 1300, desktop: "300vh" },
  skills: { mobile: 1700, tablet: 1400, desktop: 1100 },
  contact: { mobile: "165vh", tablet: "165vh", desktop: "185vh" },
  footer: { mobile: 520, tablet: 380, desktop: 320 },
} as const;

/**
 * The page as one journey: each chapter changes its mechanics while the
 * fixed stage behind them turns the jungle into neural filaments, contour
 * lines, network routes, drifting seeds and finally a quiet horizon.
 */
export default function Hero() {
  const homeRef = useRef<HTMLElement>(null!);
  const aboutRef = useRef<HTMLDivElement>(null!);
  const experienceRef = useRef<HTMLDivElement>(null!);
  const projectsRef = useRef<HTMLElement>(null!);
  const skillsRef = useRef<HTMLDivElement>(null!);
  const contactRef = useRef<HTMLDivElement>(null!);
  const footRef = useRef<HTMLDivElement>(null!);

  const sections: SectionInfo[] = useMemo(
    () => [
      { id: "home", ref: homeRef as React.RefObject<HTMLDivElement> },
      { id: "about", ref: aboutRef },
      { id: "experience", ref: experienceRef },
      { id: "projects", ref: projectsRef as React.RefObject<HTMLDivElement> },
      { id: "skills", ref: skillsRef },
      { id: "contact", ref: contactRef },
      { id: "footer", ref: footRef },
    ],
    [],
  );

  const { birdEnabled } = useBirdEffect();
  const navSectionRefs = useMemo(
    () => [
      homeRef,
      aboutRef as React.RefObject<HTMLElement>,
      experienceRef as React.RefObject<HTMLElement>,
      projectsRef,
      skillsRef as React.RefObject<HTMLElement>,
      contactRef as React.RefObject<HTMLElement>,
    ],
    [],
  );

  useActiveNavScrollSpy(navSectionRefs);

  return (
    <>
      {birdEnabled ? (
        <React.Suspense fallback={null}>
          <BirdManager sections={sections} />
        </React.Suspense>
      ) : null}
      <IntroChapter innerRef={homeRef} />
      <DeferredSection
        id="about"
        innerRef={aboutRef}
        minHeights={DEFERRED_SECTION_HEIGHTS.about}
      >
        <AboutChapter />
      </DeferredSection>
      <Container maxWidth="md" sx={{ px: 0, position: "relative", py: "12vh" }}>
        <DeferredSection
          id="experience"
          innerRef={experienceRef}
          minHeights={DEFERRED_SECTION_HEIGHTS.experience}
        >
          <QualificationSection />
        </DeferredSection>
      </Container>
      <PortalChapter />
      <section
        id="projects"
        ref={projectsRef}
        className="chapter-projects"
        aria-labelledby="projects-heading"
      >
        <h2 id="projects-heading" className="sr-only">
          <FormattedMessage id="projectHeading" />
        </h2>
        <DeferredSection
          id="neural-decompiler"
          minHeights={DEFERRED_SECTION_HEIGHTS.neural}
        >
          <NeuralChapter />
        </DeferredSection>
        <DeferredSection
          id="explorer"
          minHeights={DEFERRED_SECTION_HEIGHTS.explorer}
        >
          <ExplorerChapter />
        </DeferredSection>
        <DeferredSection id="work" minHeights={DEFERRED_SECTION_HEIGHTS.work}>
          <WorkChapter />
        </DeferredSection>
      </section>
      <DeferredSection
        id="skills"
        innerRef={skillsRef}
        minHeights={DEFERRED_SECTION_HEIGHTS.skills}
      >
        <SkillsChapter />
      </DeferredSection>
      <DeferredSection
        id="contact"
        innerRef={contactRef}
        minHeights={DEFERRED_SECTION_HEIGHTS.contact}
      >
        <ContactChapter />
      </DeferredSection>
      <DeferredSection
        id="footer"
        innerRef={footRef}
        minHeights={DEFERRED_SECTION_HEIGHTS.footer}
      >
        <Footer />
      </DeferredSection>
    </>
  );
}
