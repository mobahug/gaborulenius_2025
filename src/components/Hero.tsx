import { useMemo, useRef } from "react";
import { Container, Stack } from "@mui/material";
import BirdManager, { SectionInfo } from "./BirdManager";
import { useBirdEffect } from "../hooks/useBirdEffect";
import React from "react";
import { useActiveNavScrollSpy } from "../hooks/useActiveNavLink";
import HomeSection from "./sections/HomeSection";
import AboutSection from "./sections/AboutSection";
import ProjectsSection from "./sections/ProjectsSection";
import QualificationSection from "./sections/QualificationSection";
import SkillsSection from "./sections/SkillsSection";
import ContactSection from "./sections/ContactSection";

const Footer = React.lazy(() => import("./Footer"));

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
    [aboutRef, contactRef, experienceRef, homeRef, projectsRef, skillsRef],
  );

  useActiveNavScrollSpy(navSectionRefs);

  return (
    <>
      <Container maxWidth="md" sx={{ px: 0, position: "relative" }}>
        {birdEnabled ? <BirdManager sections={sections} /> : null}
        <Stack direction="column" spacing={40} sx={{ alignItems: "center" }}>
          <HomeSection innerRef={homeRef} />
          <AboutSection innerRef={aboutRef} />
          <ProjectsSection innerRef={projectsRef} />
          <QualificationSection innerRef={experienceRef} />
          <SkillsSection innerRef={skillsRef} />
          <ContactSection innerRef={contactRef} />
        </Stack>
      </Container>
      <React.Suspense fallback={null}>
        <Footer innerRef={footRef} />
      </React.Suspense>
    </>
  );
}
