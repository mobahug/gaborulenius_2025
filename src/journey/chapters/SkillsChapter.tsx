import { useLayoutEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { categories } from "../../contexts";
import { prefersReducedMotion } from "../device";
import { range } from "../math";
import { useScene } from "../useScene";
import "./chapters.css";

const scatter = (index: number, salt: number) => {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
};

// Where each tool starts before it settles: a fixed, pseudo-random scatter.
const CHIP_SCATTER = new Map<string, React.CSSProperties>();
categories
  .flatMap((category) =>
    category.items.map((skill) => `${category.id}-${skill}`),
  )
  .forEach((key, index) => {
    const angle = scatter(index, 1) * Math.PI * 2;
    const distance = 18 + scatter(index, 2) * 30;
    CHIP_SCATTER.set(key, {
      "--dx": `${(Math.cos(angle) * distance).toFixed(2)}vw`,
      "--dy": `${(Math.sin(angle) * distance * 0.6).toFixed(2)}vh`,
      "--spin": `${((scatter(index, 3) - 0.5) * 50).toFixed(1)}deg`,
      "--delay": (scatter(index, 4) * 0.4).toFixed(3),
    } as React.CSSProperties);
  });

/**
 * "Seeds": the network's nodes have come loose and drift like pollen. As
 * each group of tools rises into view, its scattered chips fly in and
 * settle into place.
 */
const SkillsChapter = () => {
  const sectionRef = useRef<HTMLElement>(null);
  // Each group's offset from the top of the section, so the scroll scene can
  // place it without reading layout on every frame.
  const offsetsRef = useRef<number[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const measure = () => {
      const top = section.getBoundingClientRect().top;
      offsetsRef.current = Array.from(
        section.querySelectorAll<HTMLElement>(".skills-group"),
        (group) => group.getBoundingClientRect().top - top,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useScene(sectionRef, (frame) => {
    const reduced = prefersReducedMotion();
    const { vh, y } = frame.viewport;
    sectionRef.current
      ?.querySelectorAll<HTMLElement>(".skills-group")
      .forEach((group, index) => {
        // Assembles between entering at the bottom and reaching mid-screen.
        const top = frame.top + (offsetsRef.current[index] ?? 0) - y;
        const assembly = reduced ? 1 : range(vh - top, vh * 0.02, vh * 0.5);
        group.style.setProperty("--assembly", assembly.toFixed(4));
      });
  });

  return (
    <section
      ref={sectionRef}
      className="chapter chapter-skills"
      aria-labelledby="skills-heading"
    >
      <div className="skills-layout">
        <h2 id="skills-heading" className="chapter-title">
          <FormattedMessage id="skillsToolsHeading" />
        </h2>
        {categories.map((category) => (
          <div key={category.id} className="skills-group">
            <h3 className="skills-group-title">
              <FormattedMessage id={category.id} />
            </h3>
            <ul className="skills-list">
              {category.items.map((skill) => (
                <li
                  key={`${category.id}-${skill}`}
                  className="skills-chip"
                  style={CHIP_SCATTER.get(`${category.id}-${skill}`)}
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillsChapter;
