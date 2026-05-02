import { useMemo, useRef } from "react";
import { Container, Stack } from "@mui/material";
import BirdManager, { SectionInfo } from "./BirdManager";
import { useBirdEffect } from "../hooks/useBirdEffect";
import React from "react";
import { useActiveNavScrollSpy } from "../hooks/useActiveNavLink";

const HomeSection = React.lazy(() => import("./sections/HomeSection"));
const AboutSection = React.lazy(() => import("./sections/AboutSection"));
const ProjectsSection = React.lazy(() => import("./sections/ProjectsSection"));
const QualificationSection = React.lazy(
  () => import("./sections/QualificationSection"),
);
const SkillsSection = React.lazy(() => import("./sections/SkillsSection"));
const ContactSection = React.lazy(() => import("./sections/ContactSection"));
const Footer = React.lazy(() => import("./Footer"));

export default function Hero() {
  const homeRef = useRef<HTMLDivElement>(null!);
  const aboutRef = useRef<HTMLDivElement>(null!);
  const projectsRef = useRef<HTMLDivElement>(null!);
  const experienceRef = useRef<HTMLDivElement>(null!);
  const skillsRef = useRef<HTMLDivElement>(null!);
  const contactRef = useRef<HTMLDivElement>(null!);
  const footRef = useRef<HTMLDivElement>(null!);

  const sections: SectionInfo[] = [
    { id: "home", ref: homeRef },
    { id: "about", ref: aboutRef },
    { id: "projects", ref: projectsRef },
    { id: "experience", ref: experienceRef },
    { id: "skills", ref: skillsRef },
    { id: "contact", ref: contactRef },
    { id: "footer", ref: footRef },
  ];

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
      <Footer innerRef={footRef} />
    </>
  );
}
