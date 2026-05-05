import React, { useMemo, useRef } from "react";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import type { SectionInfo } from "./BirdManager";
import { useBirdEffect } from "../hooks/useBirdEffect";
import { useActiveNavScrollSpy } from "../hooks/useActiveNavLink";
import { DeferredSection } from "./DeferredSection";
import HomeSection from "./sections/HomeSection";

const BirdManager = React.lazy(() => import("./BirdManager"));
const AboutSection = React.lazy(() => import("./sections/AboutSection"));
const ProjectsSection = React.lazy(() => import("./sections/ProjectsSection"));
const QualificationSection = React.lazy(
  () => import("./sections/QualificationSection"),
);
const SkillsSection = React.lazy(() => import("./sections/SkillsSection"));
const ContactSection = React.lazy(() => import("./sections/ContactSection"));
const Footer = React.lazy(() => import("./Footer"));

const DEFERRED_SECTION_HEIGHTS = {
  about: { mobile: 700, tablet: 560, desktop: 520 },
  projects: { mobile: 680, tablet: 660, desktop: 660 },
  experience: { mobile: 860, tablet: 780, desktop: 720 },
  skills: { mobile: 920, tablet: 780, desktop: 700 },
  contact: { mobile: 460, tablet: 360, desktop: 340 },
  footer: { mobile: 520, tablet: 380, desktop: 320 },
} as const;

export default function Hero() {
  const homeRef = useRef<HTMLDivElement>(null!);
  const aboutRef = useRef<HTMLDivElement>(null!);
  const projectsRef = useRef<HTMLDivElement>(null!);
  const experienceRef = useRef<HTMLDivElement>(null!);
  const skillsRef = useRef<HTMLDivElement>(null!);
  const contactRef = useRef<HTMLDivElement>(null!);
  const footRef = useRef<HTMLDivElement>(null!);

  const sections: SectionInfo[] = useMemo(
    () => [
      { id: "home", ref: homeRef },
      { id: "about", ref: aboutRef },
      { id: "projects", ref: projectsRef },
      { id: "experience", ref: experienceRef },
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
      aboutRef,
      projectsRef,
      experienceRef,
      skillsRef,
      contactRef,
    ],
    [],
  );

  useActiveNavScrollSpy(navSectionRefs);

  return (
    <>
      <Container maxWidth="md" sx={{ px: 0, position: "relative" }}>
        {birdEnabled ? (
          <React.Suspense fallback={null}>
            <BirdManager sections={sections} />
          </React.Suspense>
        ) : null}
        <Stack direction="column" spacing={40} sx={{ alignItems: "center" }}>
          <HomeSection innerRef={homeRef} />
          <DeferredSection
            id="about"
            innerRef={aboutRef}
            minHeights={DEFERRED_SECTION_HEIGHTS.about}
          >
            <AboutSection />
          </DeferredSection>
          <DeferredSection
            id="projects"
            innerRef={projectsRef}
            minHeights={DEFERRED_SECTION_HEIGHTS.projects}
          >
            <ProjectsSection />
          </DeferredSection>
          <DeferredSection
            id="experience"
            innerRef={experienceRef}
            minHeights={DEFERRED_SECTION_HEIGHTS.experience}
          >
            <QualificationSection />
          </DeferredSection>
          <DeferredSection
            id="skills"
            innerRef={skillsRef}
            minHeights={DEFERRED_SECTION_HEIGHTS.skills}
          >
            <SkillsSection />
          </DeferredSection>
          <DeferredSection
            id="contact"
            innerRef={contactRef}
            minHeights={DEFERRED_SECTION_HEIGHTS.contact}
          >
            <ContactSection />
          </DeferredSection>
        </Stack>
      </Container>
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
