import Button from "@mui/material/Button";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { prefersReducedMotion } from "../device";
import { range } from "../math";
import { useScene } from "../useScene";
import "./chapters.css";

const REPOSITORY_URL = "https://github.com/mobahug/neural-decompiler";
const STACK = [
  "Python",
  "PyTorch",
  "TransformerLens",
  "Pythia",
  "pytest",
  "uv",
];

// Pythia-70M has six transformer layers. The diagram is an abstract picture
// of tracing one behaviour through them, not a result.
const LAYERS = 6;
const NODES = 7;
const TRACE = [1, 3, 2, 4, 3, 5];
const layerY = (layer: number) => 70 + layer * 76;
const nodeX = (node: number) => 34 + node * 44;
const TRACE_POINTS = TRACE.map((node, layer) => [nodeX(node), layerY(layer)]);
const TRACE_PATH = `M${nodeX(TRACE[0])} 18L${TRACE_POINTS.map(([x, y]) => `${x} ${y}`).join("L")}L${nodeX(TRACE[LAYERS - 1])} ${layerY(LAYERS - 1) + 52}`;

const connections = (() => {
  const lines: string[] = [];
  for (let layer = 0; layer < LAYERS - 1; layer += 1) {
    for (let node = 0; node < NODES; node += 1) {
      [-1, 1].forEach((step) => {
        const next = node + step * ((node + layer) % 2 === 0 ? 1 : 2);
        if (next < 0 || next >= NODES) return;
        lines.push(
          `M${nodeX(node)} ${layerY(layer)}L${nodeX(next)} ${layerY(layer + 1)}`,
        );
      });
    }
  }
  return lines.join("");
})();

/**
 * "Inside": the Neural Decompiler research project. The camera keeps
 * flying through the neural sheets while the text scrolls, and a small
 * diagram traces one behaviour down through the model's layers.
 */
const NeuralChapter = () => {
  const intl = useIntl();
  const sectionRef = useRef<HTMLElement>(null);
  const traceRef = useRef<SVGPathElement>(null);
  const nodesRef = useRef<SVGGElement>(null);

  useScene(sectionRef, (frame) => {
    const reduced = prefersReducedMotion();
    const trace = traceRef.current;
    if (trace) {
      const drawn = reduced ? 1 : range(frame.pass, 0.28, 0.7);
      trace.style.strokeDashoffset = (1 - drawn).toFixed(4);
      nodesRef.current
        ?.querySelectorAll<SVGCircleElement>(".neural-trace-node")
        .forEach((node, index) => {
          node.classList.toggle(
            "neural-trace-node--lit",
            drawn >= (index + 0.5) / (LAYERS + 1),
          );
        });
    }
  });

  return (
    <article
      ref={sectionRef}
      className="chapter chapter-neural"
      aria-labelledby="neural-heading"
    >
      <div className="neural-layout">
        <div className="neural-copy text-scrim">
          <h3 id="neural-heading" className="chapter-title">
            <FormattedMessage id="neuralTitle" />
          </h3>
          <p className="chapter-meta neural-tag">
            <FormattedMessage id="neuralTag" />
          </p>
          <p className="chapter-lead">
            <FormattedMessage id="neuralSummary" />
          </p>
          <p className="chapter-lead neural-case">
            <FormattedMessage id="neuralCaseStudy" />
          </p>
          <h4 className="neural-subheading">
            <FormattedMessage id="neuralMethodHeading" />
          </h4>
          <ul className="neural-method">
            {["neuralMethod1", "neuralMethod2", "neuralMethod3"].map((id) => (
              <li key={id}>
                <FormattedMessage id={id} />
              </li>
            ))}
          </ul>
          <ul
            className="neural-stack"
            aria-label={intl.formatMessage({
              id: "projectExplorerStackHeading",
            })}
          >
            {STACK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button
            variant="contained"
            component="a"
            href={REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<GitHubIcon />}
            className="neural-link"
          >
            <FormattedMessage id="neuralRepoLink" />
          </Button>
        </div>
        <div className="neural-diagram" aria-hidden="true">
          <svg viewBox="0 0 340 520" focusable="false">
            <path d={connections} className="neural-connections" />
            {Array.from({ length: LAYERS }, (_, layer) => (
              <g key={layer}>
                <line
                  x1={20}
                  x2={320}
                  y1={layerY(layer)}
                  y2={layerY(layer)}
                  className="neural-layer-line"
                />
                <text
                  x={318}
                  y={layerY(layer) - 10}
                  className="neural-layer-label"
                >
                  {`L${layer}`}
                </text>
                {Array.from({ length: NODES }, (_, node) => (
                  <circle
                    key={node}
                    cx={nodeX(node)}
                    cy={layerY(layer)}
                    r={3}
                    className="neural-node"
                  />
                ))}
              </g>
            ))}
            <path
              ref={traceRef}
              d={TRACE_PATH}
              pathLength={1}
              className="neural-trace"
            />
            <g ref={nodesRef}>
              <circle
                cx={nodeX(TRACE[0])}
                cy={18}
                r={5}
                className="neural-trace-node"
              />
              {TRACE_POINTS.map(([x, y]) => (
                <circle
                  key={`${x}-${y}`}
                  cx={x}
                  cy={y}
                  r={5}
                  className="neural-trace-node"
                />
              ))}
            </g>
            <text x={nodeX(TRACE[0]) + 12} y={22} className="neural-token">
              “three …”
            </text>
            <text
              x={nodeX(TRACE[LAYERS - 1]) + 12}
              y={layerY(LAYERS - 1) + 56}
              className="neural-token"
            >
              “… apples”
            </text>
          </svg>
        </div>
      </div>
    </article>
  );
};

export default NeuralChapter;
