import OpenInNewIcon from "@mui/icons-material/Launch";
import { useAtomValue } from "jotai";
import { useRef } from "react";
import { FormattedMessage } from "react-intl";
import { projects } from "../../contexts";
import { localeAtom } from "../../hooks/localeAtom";
import {
  prefersReducedMotion,
  usePinnedLayout,
  useReducedMotion,
} from "../device";
import { easeOutCubic, range } from "../math";
import { useScene } from "../useScene";
import { pinnedArrival } from "../worldDirector";
import "./chapters.css";

const NODE_LABELS: Record<string, string> = {
  projectHusDatalakeTitle: "workNodeHus",
  projectMedicalPocTitle: "workNodePoc",
  projectIctDaysTitle: "workNodeIct",
  projectAnyhauTitle: "workNodeAnyhau",
};

// Horizontal positions (percent of the scene) of each node on the backbone.
// The title sits on the backbone's left end, so the first card hangs below
// it and cards alternate from there.
const NODE_X = [37, 53, 69, 85];
const BACKBONE_START = 4;
const BACKBONE_END = 96;

/**
 * "Topology": the map's routes have stepped into orthogonal traces. The
 * work projects attach to one backbone like services on a network; each
 * card unfolds when the signal reaches its branch.
 */
const WorkChapter = () => {
  const locale = useAtomValue(localeAtom);
  const reducedMotion = useReducedMotion();
  const wide = usePinnedLayout() && !reducedMotion;
  const sectionRef = useRef<HTMLElement>(null);
  const backboneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useScene(sectionRef, (frame) => {
    const reduced = prefersReducedMotion();
    const section = sectionRef.current;
    if (!section) return;
    const { viewport } = frame;
    const nodes = Array.from(
      section.querySelectorAll<HTMLElement>(".work-node"),
    );

    if (!wide || reduced) {
      // Each card unfolds as it rises into the lower half of the screen.
      const rects = nodes.map((node) => node.getBoundingClientRect());
      nodes.forEach((node, index) => {
        const reveal = reduced
          ? 1
          : easeOutCubic(
              range(
                viewport.vh - rects[index].top,
                viewport.vh * 0.1,
                viewport.vh * 0.45,
              ),
            );
        node.style.setProperty("--reveal", reveal.toFixed(3));
        node.style.setProperty("--branch", reveal.toFixed(3));
      });
      return;
    }

    const q = pinnedArrival(frame);

    const title = titleRef.current;
    if (title) {
      const t = easeOutCubic(range(q, 0.3, 0.42));
      title.style.opacity = t.toFixed(3);
      title.style.transform = `translate3d(0, ${((1 - t) * 20).toFixed(1)}px, 0)`;
    }

    // The signal runs along the backbone from left to right.
    const head = range(q, 0.38, 0.9);
    const headX = BACKBONE_START + head * (BACKBONE_END - BACKBONE_START);
    if (backboneRef.current) {
      backboneRef.current.style.transform = `scaleX(${head.toFixed(4)})`;
    }
    nodes.forEach((node, index) => {
      const reached = range(headX, NODE_X[index] - 1, NODE_X[index] + 5);
      const branch = easeOutCubic(reached);
      const reveal = easeOutCubic(
        range(headX, NODE_X[index] + 2, NODE_X[index] + 11),
      );
      node.style.setProperty("--branch", branch.toFixed(3));
      node.style.setProperty("--reveal", reveal.toFixed(3));
    });
  });

  const cards = projects.map(({ id, hrefEN, hrefFI }, index) => {
    const href = locale === "fi" ? hrefFI : hrefEN;
    const position = index % 2 === 0 ? "below" : "above";
    return (
      <li
        key={id}
        className={`work-node work-node--${position}`}
        style={wide ? { left: `${NODE_X[index]}%` } : undefined}
      >
        <span className="work-branch" aria-hidden="true" />
        <span className="work-dot" aria-hidden="true" />
        <div className="work-card reveal-item">
          <h4 className="work-card-title">
            <FormattedMessage id={NODE_LABELS[id]} />
          </h4>
          <p className="work-card-body">
            <FormattedMessage id={id} />
          </p>
          {href ? (
            <a
              className="work-card-link"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FormattedMessage id="buttonReadMore" />
              <OpenInNewIcon aria-hidden="true" />
            </a>
          ) : (
            <p className="work-card-note">
              <FormattedMessage id="noLinkAvailable" />
            </p>
          )}
        </div>
      </li>
    );
  });

  return (
    <article
      ref={sectionRef}
      className={`chapter chapter-work${wide ? " chapter-work--wide" : ""} reveal-guard`}
      aria-labelledby="work-heading"
    >
      {wide ? (
        <div className="chapter-scene work-scene">
          <h3
            id="work-heading"
            ref={titleRef}
            className="chapter-title work-title reveal-item"
          >
            <FormattedMessage id="projectWorkHeading" />
          </h3>
          <div className="work-backbone-track" aria-hidden="true">
            <div ref={backboneRef} className="work-backbone" />
          </div>
          <ol className="work-nodes">{cards}</ol>
        </div>
      ) : (
        <div className="work-stack">
          <h3 id="work-heading" className="chapter-title work-title">
            <FormattedMessage id="projectWorkHeading" />
          </h3>
          <ol className="work-nodes">{cards}</ol>
        </div>
      )}
    </article>
  );
};

export default WorkChapter;
