import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import React, { useLayoutEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  explorerCapabilities,
  explorerScreenshots,
} from "../../components/projects/explorerProjectData";
import { assetUrl } from "../../utils/assets";
import { usePinnedLayout, useReducedMotion } from "../device";
import { easeOutCubic, range } from "../math";
import { useScene } from "../useScene";
import {
  EXPLORER_TRACK_VW,
  explorerPanPx,
  explorerWalk,
  pinnedArrival,
} from "../worldDirector";
import "./chapters.css";

const ExplorerProjectDialog = React.lazy(
  () => import("../../components/projects/ExplorerProjectDialog"),
);
const ExplorerCarousel = React.lazy(
  () => import("../../components/projects/ExplorerCarousel"),
);

// Trail across the map, in a 2800 × 1000 box that spans 280vw × 100vh. It
// starts just right of the legend where the pan begins (620 → 0.62 vw) and
// ends where the pan leaves it (2560 → 0.78 vw), so the walker covers all of
// it: nothing is walked before the pan starts, all of it by the end.
const TRACK_UNITS = 2800;
const TRAIL =
  "M620 560C700 520 800 430 920 440S1150 640 1290 620S1520 470 1660 470S1900 650 2030 640S2270 500 2400 500S2520 560 2560 575";
const ARTIFACTS = [
  { src: "explorer/map-tracking.webp", x: 790, side: -1 },
  { src: "explorer/measure-distance.webp", x: 1120, side: 1 },
  { src: "explorer/log-type-picker.webp", x: 1450, side: -1 },
  { src: "explorer/log-details-weather.webp", x: 1780, side: 1 },
  { src: "explorer/expeditions-list.webp", x: 2110, side: -1 },
  { src: "explorer/profile-summary.webp", x: 2430, side: 1 },
].map((artifact) => ({
  ...artifact,
  screenshot: explorerScreenshots.find((shot) => shot.src === artifact.src)!,
}));

type TrailSample = { x: number; y: number; length: number };

/**
 * "The Field": the neural filaments have multiplied into contour lines.
 * The map pans east along a GPS trail and the app's screens lie along it
 * like field notes waiting to be picked up.
 */
const ExplorerChapter = () => {
  const intl = useIntl();
  const theme = useTheme();
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down("md"));
  // The pinned, panning composition is desktop-only and skipped for reduced motion.
  const reducedMotion = useReducedMotion();
  const wide = usePinnedLayout() && !reducedMotion;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoaded, setDialogLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const samplesRef = useRef<TrailSample[]>([]);

  // Sample the trail once so the marker can ride it and the drawn part can
  // end exactly at the marker.
  useLayoutEffect(() => {
    const trail = trailRef.current;
    if (!trail || !wide) return;
    const total = trail.getTotalLength();
    const samples: TrailSample[] = [];
    for (let index = 0; index <= 200; index += 1) {
      const length = (index / 200) * total;
      const point = trail.getPointAtLength(length);
      samples.push({ x: point.x, y: point.y, length: length / total });
    }
    samplesRef.current = samples;
  }, [wide]);

  useScene(sectionRef, (frame) => {
    // The world (contour morph and map pan) is driven by the world director;
    // this only moves the DOM that sits on the map.
    if (!wide) return;
    const { vw, vh } = frame.viewport;
    const q = pinnedArrival(frame);

    const legend = legendRef.current;
    if (legend) {
      const t = easeOutCubic(range(q, 0.3, 0.46));
      legend.style.opacity = t.toFixed(3);
      legend.style.transform = `translate3d(${((1 - t) * -40).toFixed(1)}px, 0, 0)`;
    }

    // Pan east once the map has formed, in step with the shader's map.
    const trackWidth = (EXPLORER_TRACK_VW / 100) * vw;
    const unit = trackWidth / TRACK_UNITS;
    const panPx = explorerPanPx(q, vw);

    // The walker rides the trail in step with the pan: at the start of the
    // trail when the pan begins, at its end when the pan ends.
    const samples = samplesRef.current;
    let walkerX = vw * 0.62;
    if (samples.length) {
      const position = explorerWalk(q) * (samples.length - 1);
      const index = Math.min(Math.floor(position), samples.length - 2);
      const t = position - index;
      const from = samples[index];
      const to = samples[index + 1];
      walkerX = (from.x + (to.x - from.x) * t) * unit - panPx;
      const walkerY = ((from.y + (to.y - from.y) * t) / 1000) * vh;
      const marker = markerRef.current;
      if (marker) {
        marker.style.transform = `translate3d(${walkerX.toFixed(1)}px, ${walkerY.toFixed(1)}px, 0)`;
        marker.style.opacity = range(q, 0.36, 0.44).toFixed(3);
      }
      const trail = trailRef.current;
      if (trail) {
        trail.style.strokeDashoffset = (
          1 -
          (from.length + (to.length - from.length) * t)
        ).toFixed(4);
      }
    }

    const track = trackRef.current;
    if (track) {
      track.style.transform = `translate3d(${(-panPx).toFixed(1)}px, 0, 0)`;
      const mapFormed = range(q, 0.34, 0.46);
      track
        .querySelectorAll<HTMLElement>(".explorer-artifact")
        .forEach((element, index) => {
          const screenX = ARTIFACTS[index].x * unit - panPx;
          const fromLegend = range(screenX, vw * 0.33, vw * 0.46);
          const arrive = range(screenX, vw * 1.05, vw * 0.82);
          // The screen the walker is passing lights up.
          const near =
            1 - Math.min(1, Math.abs(screenX - walkerX) / (vw * 0.16));
          element.style.opacity = (fromLegend * arrive * mapFormed).toFixed(3);
          element.style.setProperty("--near", near.toFixed(3));
        });
    }
  });

  const capabilities = (
    <ul className="explorer-capabilities">
      {explorerCapabilities.map(({ icon, titleId }) => (
        <li key={titleId}>
          <span className="explorer-capability-icon" aria-hidden="true">
            {icon}
          </span>
          <FormattedMessage id={titleId} />
        </li>
      ))}
    </ul>
  );

  const details = (
    <Button
      variant="contained"
      startIcon={<InfoOutlinedIcon />}
      onClick={() => {
        setDialogLoaded(true);
        setDialogOpen(true);
      }}
      className="explorer-details"
    >
      <FormattedMessage id="projectExplorerButtonDetails" />
    </Button>
  );

  return (
    <article
      ref={sectionRef}
      className={`chapter chapter-explorer${wide ? " chapter-explorer--wide" : ""} reveal-guard`}
      aria-labelledby="explorer-heading"
    >
      {wide ? (
        <div className="chapter-scene explorer-scene">
          <div ref={trackRef} className="explorer-track">
            <svg
              className="explorer-trail"
              viewBox={`0 0 ${TRACK_UNITS} 1000`}
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d={TRAIL} className="explorer-trail-ghost" />
              <path
                ref={trailRef}
                d={TRAIL}
                pathLength={1}
                className="explorer-trail-line"
              />
            </svg>
            {ARTIFACTS.map(({ src, x, side, screenshot }) => (
              <figure
                key={src}
                className={`explorer-artifact explorer-artifact--${side < 0 ? "above" : "below"}`}
                style={{ left: `${(x / TRACK_UNITS) * EXPLORER_TRACK_VW}vw` }}
              >
                <img
                  src={assetUrl(src)}
                  alt={intl.formatMessage({ id: screenshot.altId })}
                  width={397}
                  height={844}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <FormattedMessage id={screenshot.titleId} />
                </figcaption>
              </figure>
            ))}
          </div>
          <div ref={markerRef} className="explorer-marker" aria-hidden="true" />
          <div ref={legendRef} className="explorer-legend reveal-item">
            <h3 id="explorer-heading" className="chapter-title">
              <FormattedMessage id="projectExplorerTitle" />
            </h3>
            <p className="chapter-meta explorer-tag">
              <FormattedMessage id="projectExplorerTag" />
            </p>
            <p className="explorer-summary">
              <FormattedMessage id="projectExplorerSummary" />
            </p>
            {capabilities}
            {details}
          </div>
        </div>
      ) : (
        <div className="explorer-stack">
          <div className="text-scrim">
            <h3 id="explorer-heading" className="chapter-title">
              <FormattedMessage id="projectExplorerTitle" />
            </h3>
            <p className="chapter-meta explorer-tag">
              <FormattedMessage id="projectExplorerTag" />
            </p>
            <p className="explorer-summary">
              <FormattedMessage id="projectExplorerSummary" />
            </p>
          </div>
          <div className="explorer-carousel">
            <React.Suspense
              fallback={<div className="explorer-carousel-placeholder" />}
            >
              <ExplorerCarousel />
            </React.Suspense>
          </div>
          {capabilities}
          {details}
        </div>
      )}
      {dialogLoaded ? (
        <React.Suspense fallback={null}>
          <ExplorerProjectDialog
            fullScreen={fullScreenDialog}
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
          />
        </React.Suspense>
      ) : null}
    </article>
  );
};

export default ExplorerChapter;
