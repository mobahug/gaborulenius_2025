import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { assetUrl } from "../../utils/assets";
import { prefersReducedMotion } from "../device";
import { clamp, easeOutCubic, range } from "../math";
import { useScene } from "../useScene";
import "./chapters.css";

type IntroChapterProps = {
  innerRef: React.RefObject<HTMLElement>;
};

/**
 * "The Sentence": the cover's greeting continues. Each word surfaces out of
 * the mist as the walk continues, then the subtitle and actions settle.
 */
const IntroChapter = ({ innerRef }: IntroChapterProps) => {
  const intl = useIntl();
  const wordsRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const words = intl.formatMessage({ id: "homeGreeting" }).split(" ");

  useScene(innerRef, (frame) => {
    const { viewport, top, height } = frame;
    const reduced = prefersReducedMotion();
    // Progress across the scene entering the viewport and its pinned range.
    const travel = viewport.vh + Math.max(1, height - viewport.vh);
    const q = clamp((viewport.y - (top - viewport.vh)) / travel);

    const wordElements =
      wordsRef.current?.querySelectorAll<HTMLElement>(".intro-word");
    const count = wordElements?.length ?? 0;
    wordElements?.forEach((element, index) => {
      const start = 0.22 + (index / Math.max(1, count)) * 0.36;
      const t = reduced ? 1 : easeOutCubic(range(q, start, start + 0.16));
      element.style.opacity = t.toFixed(3);
      element.style.transform = `translate3d(0, ${((1 - t) * 0.45).toFixed(3)}em, 0) scale(${(0.94 + 0.06 * t).toFixed(3)})`;
      element.style.filter =
        t < 0.999 ? `blur(${((1 - t) * 10).toFixed(2)}px)` : "";
    });

    const reveal = (element: HTMLElement | null, start: number) => {
      if (!element) return;
      const t = reduced ? 1 : easeOutCubic(range(q, start, start + 0.14));
      element.style.opacity = t.toFixed(3);
      element.style.transform = `translate3d(0, ${((1 - t) * 24).toFixed(1)}px, 0)`;
    };
    reveal(subtitleRef.current, 0.6);
    reveal(actionsRef.current, 0.68);
  });

  return (
    <section
      id="home"
      ref={innerRef}
      className="chapter chapter-intro reveal-guard"
      aria-labelledby="home-heading"
    >
      <div className="chapter-scene intro-scene">
        <div className="intro-copy text-scrim">
          <h2 id="home-heading" ref={wordsRef} className="intro-sentence">
            {words.map((word, index) => (
              <span key={`${word}-${index}`}>
                <span className="intro-word reveal-item">{word}</span>
                {index < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h2>
          <p ref={subtitleRef} className="intro-subtitle reveal-item">
            <FormattedMessage id="homeSubtitle" />
          </p>
          <div ref={actionsRef} className="intro-actions reveal-item">
            <Button
              variant="contained"
              href="#projects"
              startIcon={<SearchIcon />}
            >
              <FormattedMessage id="homeBtnExplore" />
            </Button>
            <Button
              variant="contained"
              component="a"
              href={assetUrl("Gabor_Ulenius_-_Full_Stack_Developer.pdf")}
              target="_blank"
              rel="noopener noreferrer"
              download
              startIcon={<FileDownloadIcon />}
            >
              <FormattedMessage id="homeBtnDownloadCv" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroChapter;
