import type { Ref } from "react";
import ProjectsSectionContent from "../projects/ProjectsSectionContent";

const ProjectsSection = ({ innerRef }: { innerRef: Ref<HTMLDivElement> }) => {
  return <ProjectsSectionContent innerRef={innerRef} />;
};

export default ProjectsSection;
