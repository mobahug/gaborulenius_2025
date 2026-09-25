import React, { useEffect, useRef, useState } from "react";
import { colors as lightColors } from "../colors";
import { colors as darkColors } from "../colorsDark";
import { assetUrl } from "../utils/assets";
import { frondPath } from "../journey/foliage";
import type { BananaLeafSpec } from "../journey/foliage/bananaLeaf";
import { JUNGLE_LQIP_DARK, JUNGLE_LQIP_LIGHT } from "../journey/lqip";
import { clamp, easeInCubic, range } from "../journey/math";
import { registerScene } from "../journey/scrollTimeline";
import {
  getQualityTier,
  hasFinePointer,
  isWideLayout,
  prefersReducedMotion,
} from "../journey/device";

// Plain-DOM cover. It stays outside MUI/react-intl so the LCP avatar and the
// heading paint before the rest of the app has loaded.
const GREETINGS: Record<string, string> = {
  en: "Hi, I'm Gábor",
  fi: "Hei, olen Gábor",
};
const SKIP_LABELS: Record<string, string> = {
  en: "Skip to content",
  fi: "Siirry sisältöön",
};

const readDocumentLocale = (): string => {
  if (typeof document === "undefined") return "en";
  const value = document.documentElement.dataset.locale;
  return value === "fi" ? "fi" : "en";
};

const readDocumentTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

type Exit = { x: number; y: number; scale: number };

/** A layer that walks past the camera as the visitor scrolls. */
type Layer = {
  id: string;
  rotate: number;
  mirror?: boolean;
  exit: Exit;
  wideOnly?: boolean;
};

/** Canopy fronds: procedural silhouettes. */
type Fern = Layer & {
  path: string;
  box: { x: number; y: number; width: number; height: number };
  origin: [number, number];
};

/**
 * Banana leaves painted procedurally on canvas: the near ones in shade and
 * out of focus, the high one lit through by the sun. Each canvas box is set
 * in CSS; the spec positions the leaf inside its box.
 */
type BananaLayer = Layer & {
  spec: BananaLeafSpec;
  /** Overrides for the narrow (phone) composition. */
  narrow?: Partial<BananaLeafSpec>;
  /** Sway amplitude (deg), period (s) and delay (s). */
  sway: [number, number, number];
};

const BANANA_LEAVES: BananaLayer[] = [
  {
    // Deeper in the shade behind the near leaf, and further out of focus.
    id: "leaf-rear",
    rotate: 0,
    exit: { x: 0.4, y: 0.45, scale: 1.35 },
    sway: [0.8, 9.5, -3],
    wideOnly: true,
    spec: {
      baseX: 0.92,
      baseY: 1.1,
      angle: -0.42,
      bend: -0.95,
      length: 0.8,
      halfWidth: 0.13,
      tears: 10,
      seed: 41,
      backlight: 0.22,
      shade: 0.78,
      turn: 0.35,
      blur: 3.5,
    },
  },
  {
    id: "leaf-high",
    rotate: 0,
    exit: { x: 0.34, y: -0.5, scale: 1.4 },
    sway: [1.4, 7.5, -2],
    spec: {
      baseX: 1.02,
      baseY: -0.1,
      angle: -2.45,
      bend: -0.7,
      length: 0.95,
      halfWidth: 0.18,
      tears: 8,
      seed: 29,
      backlight: 0.95,
      turn: 0.1,
      blur: 1.2,
    },
  },
  {
    id: "leaf-near",
    rotate: 0,
    exit: { x: 0.5, y: 0.5, scale: 1.5 },
    sway: [1, 8.5, -5],
    spec: {
      baseX: 0.97,
      baseY: 1.08,
      angle: -0.8,
      bend: -0.6,
      length: 0.72,
      halfWidth: 0.12,
      tears: 14,
      seed: 11,
      backlight: 0.3,
      shade: 0.6,
      turn: 0.25,
      blur: 1.2,
    },
    narrow: { angle: -0.74, length: 0.74, halfWidth: 0.15, tears: 12, blur: 1 },
  },
  {
    id: "leaf-low",
    rotate: 0,
    exit: { x: -0.5, y: 0.4, scale: 1.5 },
    sway: [1.2, 6.5, -1],
    wideOnly: true,
    spec: {
      baseX: 0.05,
      baseY: 1.08,
      angle: 0.72,
      bend: 0.55,
      length: 0.66,
      halfWidth: 0.12,
      tears: 12,
      seed: 3,
      backlight: 0.26,
      shade: 0.65,
      turn: 0.3,
      blur: 1.6,
    },
  },
];

const FERN_LENGTH = 1000;
const LEAFLET_LENGTH = 300;

const fern = (
  id: string,
  seed: number,
  bend: number,
  rotate: number,
  exit: Exit,
  options: Partial<Fern> = {},
): Fern => {
  const x = Math.min(-LEAFLET_LENGTH, bend * FERN_LENGTH - LEAFLET_LENGTH);
  const right = Math.max(LEAFLET_LENGTH, bend * FERN_LENGTH + LEAFLET_LENGTH);
  const box = {
    x,
    y: -FERN_LENGTH - LEAFLET_LENGTH * 0.4,
    width: right - x,
    height: FERN_LENGTH + LEAFLET_LENGTH * 0.9,
  };
  return {
    id,
    path: frondPath({
      length: FERN_LENGTH,
      leaflets: 15,
      leafletLength: LEAFLET_LENGTH,
      leafletWidth: 56,
      bend,
      seed,
    }),
    box,
    origin: [
      (-x / box.width) * 100,
      ((FERN_LENGTH + LEAFLET_LENGTH * 0.4) / box.height) * 100,
    ],
    rotate,
    exit,
    ...options,
  };
};

const FERNS: Fern[] = [
  fern(
    "fern-left",
    71,
    0.28,
    -156,
    { x: -0.32, y: -0.42, scale: 1.6 },
    {
      mirror: true,
      wideOnly: true,
    },
  ),
];

type Pollen = {
  x: number;
  y: number;
  z: number;
  phase: number;
  alpha: number;
};

const createPollen = (count: number): Pollen[] =>
  Array.from({ length: count }, (_, index) => {
    const seed = Math.sin(index * 12.9898) * 43758.5453;
    const random = (offset: number) => {
      const value = Math.sin(seed + offset * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };
    return {
      x: random(1),
      y: random(2),
      z: 0.25 + random(3) * 0.75,
      phase: random(4) * Math.PI * 2,
      alpha: 0.3 + random(5) * 0.6,
    };
  });

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const whenIdle = (callback: () => void, timeout: number) => {
  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(callback, { timeout });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }
  const handle = window.setTimeout(callback, Math.min(timeout, 1200));
  return () => window.clearTimeout(handle);
};

const CoverSection: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const shaftRef = useRef<HTMLDivElement>(null);
  const pollenRef = useRef<HTMLCanvasElement>(null);
  const layerRefs = useRef<Record<string, HTMLElement | null>>({});

  // Track <html data-locale> so the cover updates when the user toggles
  // language. The attribute is set both by the inline pre-React script in
  // index.html (initial paint) and by I18nWrapper (after React mounts).
  const [locale, setLocale] = useState<string>(readDocumentLocale);
  const greeting = GREETINGS[locale] ?? GREETINGS.en;
  const skipLabel = SKIP_LABELS[locale] ?? SKIP_LABELS.en;

  useEffect(() => {
    const root = document.documentElement;
    setLocale(readDocumentLocale());
    const observer = new MutationObserver(() => {
      setLocale(readDocumentLocale());
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-locale"],
    });
    return () => observer.disconnect();
  }, []);

  // Scroll + pointer choreography: the camera walks forward, the foreground
  // passes it, and the greeting is left behind in the mist.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const reduced = prefersReducedMotion();
    const finePointer = hasFinePointer() && !reduced;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let progress = 0;
    let viewport = { vw: window.innerWidth, vh: window.innerHeight };
    let pointerFrame: number | null = null;
    const layers: Layer[] = [...BANANA_LEAVES, ...FERNS];

    const apply = () => {
      const walk = reduced ? 0 : easeInCubic(progress);
      const { vw, vh } = viewport;

      // Everything in the scene is gone by the time it scrolls away, so its
      // edge never shows as a seam over the walk behind it.
      const leave = reduced ? 1 : 1 - range(progress, 0.72, 0.98);
      layers.forEach((spec) => {
        const element = layerRefs.current[spec.id];
        if (!element) return;
        const x = spec.exit.x * vw * walk + pointer.x * 34;
        const y = spec.exit.y * vh * walk + pointer.y * 22;
        const scale = 1 + (spec.exit.scale - 1) * walk;
        element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${spec.rotate}deg) scale(${spec.mirror ? -scale : scale}, ${scale})`;
        element.style.setProperty("--leave", leave.toFixed(3));
      });

      const copy = copyRef.current;
      if (copy) {
        const fade = reduced ? 0 : range(progress, 0.3, 0.84);
        const lift = reduced ? 0 : progress;
        copy.style.transform = `translate3d(${(pointer.x * 10).toFixed(1)}px, ${(pointer.y * 8 - lift * vh * 0.05).toFixed(1)}px, 0) scale(${(1 + 0.3 * walk).toFixed(3)})`;
        copy.style.opacity = (1 - fade).toFixed(3);
        copy.style.filter =
          fade > 0.01 ? `blur(${(fade * 6).toFixed(2)}px)` : "";
      }

      const mist = mistRef.current;
      if (mist) {
        mist.style.transform = `translate3d(${(pointer.x * 14).toFixed(1)}px, ${(progress * vh * 0.07).toFixed(1)}px, 0) scale(${(1 + 0.14 * progress).toFixed(3)})`;
        mist.style.opacity = (
          reduced ? 1 : 1 - range(progress, 0.55, 0.98)
        ).toFixed(3);
      }

      const shaft = shaftRef.current;
      if (shaft) {
        shaft.style.transform = `translate3d(${(pointer.x * 6).toFixed(1)}px, 0, 0)`;
        shaft.style.opacity = (
          reduced ? 1 : 1 - range(progress, 0.55, 0.98)
        ).toFixed(3);
      }
      const pollen = pollenRef.current;
      if (pollen) {
        pollen.style.setProperty("--leave", leave.toFixed(3));
      }
    };

    const unregister = registerScene(wrapper, (frame) => {
      progress = frame.pin;
      viewport = { vw: frame.viewport.vw, vh: frame.viewport.vh };
      apply();
    });

    const settlePointer = () => {
      pointerFrame = null;
      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;
      apply();
      if (
        Math.abs(pointer.targetX - pointer.x) > 0.001 ||
        Math.abs(pointer.targetY - pointer.y) > 0.001
      ) {
        pointerFrame = window.requestAnimationFrame(settlePointer);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (progress >= 1) return;
      pointer.targetX = clamp(event.clientX / viewport.vw - 0.5, -0.5, 0.5);
      pointer.targetY = clamp(event.clientY / viewport.vh - 0.5, -0.5, 0.5);
      if (pointerFrame === null) {
        pointerFrame = window.requestAnimationFrame(settlePointer);
      }
    };

    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    return () => {
      unregister();
      if (finePointer) window.removeEventListener("pointermove", onPointerMove);
      if (pointerFrame !== null) window.cancelAnimationFrame(pointerFrame);
    };
  }, []);

  // Banana leaves, painted once the page is idle (one per idle slice, so no
  // long task competes with input) and again on theme or size changes.
  // Canvases are not LCP candidates, so they never move LCP.
  useEffect(() => {
    let cancelled = false;
    let cancelIdle = () => {};
    let painter: typeof import("../journey/foliage/bananaLeaf") | null = null;
    let resizeTimer = 0;

    const paintAll = () => {
      cancelIdle();
      const theme = readDocumentTheme();
      const wide = isWideLayout();
      const queue = BANANA_LEAVES.filter((leaf) => wide || !leaf.wideOnly);
      const next = () => {
        const leaf = queue.shift();
        if (!leaf || cancelled || !painter) return;
        const canvas = layerRefs.current[leaf.id] as HTMLCanvasElement | null;
        const spec = wide ? leaf.spec : { ...leaf.spec, ...leaf.narrow };
        // Out-of-focus leaves need no more than CSS resolution.
        const ratio = Math.min(
          window.devicePixelRatio || 1,
          (spec.blur ?? 0) > 2 ? 1 : 1.5,
        );
        if (canvas && painter.paintBananaLeaf(canvas, spec, theme, ratio)) {
          if (canvas.dataset.ready !== "true") {
            canvas.dataset.ready = "true";
            // Once faded in, opacity follows the scroll without easing.
            window.setTimeout(() => {
              canvas.dataset.settled = "true";
            }, 1300);
          }
        }
        cancelIdle = whenIdle(next, 600);
      };
      cancelIdle = whenIdle(next, 2000);
    };

    const load = () => {
      void import("../journey/foliage/bananaLeaf").then((module) => {
        if (cancelled) return;
        painter = module;
        paintAll();
      });
    };
    const cancelLoad = whenIdle(load, 2000);

    const themeObserver = new MutationObserver(() => {
      if (painter) paintAll();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    let lastSize = `${window.innerWidth}`;
    const onResize = () => {
      // Mobile browsers resize the viewport height while scrolling; only a
      // width change re-lays the leaves out.
      const size = `${window.innerWidth}`;
      if (size === lastSize || !painter) return;
      lastSize = size;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(paintAll, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelLoad();
      cancelIdle();
      window.clearTimeout(resizeTimer);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Pollen drifting through the light. Starts once the page is idle so it
  // never competes with the first paint.
  useEffect(() => {
    const canvas = pollenRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = prefersReducedMotion();
    const tier = getQualityTier();
    const count = tier === "low" ? 14 : isWideLayout() ? 42 : 22;
    const pollen = createPollen(count);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let visible = true;
    let frameId: number | null = null;
    let scrollProgress = 0;
    let started = false;

    const sprite = document.createElement("canvas");
    sprite.width = 32;
    sprite.height = 32;
    const spriteContext = sprite.getContext("2d");
    const paintSprite = () => {
      if (!spriteContext) return;
      const dark = readDocumentTheme() === "dark";
      const gradient = spriteContext.createRadialGradient(
        16,
        16,
        0,
        16,
        16,
        16,
      );
      const tint = dark ? "205, 232, 255" : "255, 238, 196";
      gradient.addColorStop(0, `rgba(${tint}, 1)`);
      gradient.addColorStop(0.35, `rgba(${tint}, 0.45)`);
      gradient.addColorStop(1, `rgba(${tint}, 0)`);
      spriteContext.clearRect(0, 0, 32, 32);
      spriteContext.fillStyle = gradient;
      spriteContext.fillRect(0, 0, 32, 32);
    };
    paintSprite();

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const t = time / 1000;
      pollen.forEach((particle) => {
        const drift = reduced ? 0 : t * (0.004 + particle.z * 0.01);
        const sway = reduced ? 0 : Math.sin(t * 0.6 + particle.phase) * 0.012;
        const x = ((((particle.x + sway) % 1) + 1) % 1) * width;
        const parallax = reduced ? 0 : scrollProgress * particle.z * 0.55;
        let y = particle.y - drift - parallax;
        y = (((y % 1) + 1) % 1) * height;
        // Brighter where the particle crosses the light shaft.
        const shaftX = 0.62 - (y / height) * 0.24;
        const inShaft = Math.max(0, 1 - Math.abs(x / width - shaftX) / 0.09);
        const twinkle = reduced
          ? 1
          : 0.75 + 0.25 * Math.sin(t * 1.7 + particle.phase * 3);
        const size = (1.2 + particle.z * 3.2) * (1 + inShaft * 0.6);
        context.globalAlpha = Math.min(
          1,
          particle.alpha * (0.45 + inShaft * 1.1) * twinkle,
        );
        context.drawImage(sprite, x - size, y - size, size * 2, size * 2);
      });
      context.globalAlpha = 1;
    };

    const loop = (time: number) => {
      frameId = null;
      draw(time);
      if (visible && !document.hidden && !reduced) {
        frameId = window.requestAnimationFrame(loop);
      }
    };

    const start = () => {
      if (frameId === null && visible && !document.hidden) {
        frameId = window.requestAnimationFrame(loop);
      }
    };

    const unregister = registerScene(wrapper, (frame) => {
      scrollProgress = frame.pin;
    });

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && started) start();
    });
    intersection.observe(wrapper);

    const onVisibility = () => {
      if (!document.hidden && started) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const themeObserver = new MutationObserver(() => {
      paintSprite();
      if (reduced && started) draw(0);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onResize = () => {
      resize();
      if (reduced && started) draw(0);
    };
    window.addEventListener("resize", onResize);

    const cancelIdle = whenIdle(() => {
      started = true;
      resize();
      canvas.dataset.ready = "true";
      window.setTimeout(() => {
        canvas.dataset.settled = "true";
      }, 1700);
      if (reduced) draw(0);
      else start();
    }, 2500);

    return () => {
      unregister();
      intersection.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      cancelIdle();
    };
  }, []);

  const layerClass = (spec: Layer, kind: string) =>
    `cover-layer cover-layer--${kind} cover-layer--${spec.id}${spec.wideOnly ? " cover-layer--wide-only" : ""}`;

  return (
    <>
      <a className="cover-skip" href="#home">
        {skipLabel}
      </a>
      <div id="cover" ref={wrapperRef} className="cover">
        <section className="cover-scene" aria-labelledby="cover-heading">
          <div className="cover-lqip" aria-hidden="true" />
          <div className="cover-depth" aria-hidden="true">
            <div ref={mistRef} className="cover-mist">
              <div className="cover-mist-band cover-mist-band--a" />
              <div className="cover-mist-band cover-mist-band--b" />
            </div>
            <div ref={shaftRef} className="cover-shaft" />
            <canvas ref={pollenRef} className="cover-pollen" />
          </div>
          <div ref={copyRef} className="cover-copy">
            <img
              alt="Gábor Ulenius"
              src={assetUrl("profile-160.webp")}
              srcSet={`${assetUrl("profile-160.webp")} 160w, ${assetUrl(
                "profile-320.webp",
              )} 320w`}
              sizes="(max-width: 600px) 140px, (max-width: 900px) 150px, 160px"
              width={160}
              height={160}
              decoding="async"
              fetchPriority="high"
              loading="eager"
              className="cover-avatar"
            />
            <h1 id="cover-heading" className="cover-greeting">
              {greeting}
            </h1>
          </div>
          <div className="cover-depth cover-depth--near" aria-hidden="true">
            <svg className="cover-defs" width="0" height="0" focusable="false">
              <defs>
                <linearGradient
                  id="cover-fern-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0" className="cover-stop-top" />
                  <stop offset="1" className="cover-stop-bottom" />
                </linearGradient>
                <filter
                  id="cover-fern-blur"
                  x="-10%"
                  y="-10%"
                  width="120%"
                  height="120%"
                >
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>
            </svg>
            {FERNS.map((spec) => (
              <div
                key={spec.id}
                ref={(element) => {
                  layerRefs.current[spec.id] = element;
                }}
                className={layerClass(spec, "fern")}
                style={{
                  aspectRatio: `${spec.box.width} / ${spec.box.height}`,
                  transformOrigin: `${spec.origin[0].toFixed(2)}% ${spec.origin[1].toFixed(2)}%`,
                  transform: `rotate(${spec.rotate}deg) scale(${spec.mirror ? -1 : 1}, 1)`,
                }}
              >
                <svg
                  viewBox={`${spec.box.x.toFixed(1)} ${spec.box.y.toFixed(1)} ${spec.box.width.toFixed(1)} ${spec.box.height.toFixed(1)}`}
                  focusable="false"
                >
                  <path
                    d={spec.path}
                    fill="url(#cover-fern-fill)"
                    filter="url(#cover-fern-blur)"
                  />
                </svg>
              </div>
            ))}
            {BANANA_LEAVES.map((leaf) => (
              <canvas
                key={leaf.id}
                ref={(element) => {
                  layerRefs.current[leaf.id] = element;
                }}
                className={layerClass(leaf, "banana")}
                style={
                  {
                    "--sway": `${leaf.sway[0]}deg`,
                    "--sway-period": `${leaf.sway[1]}s`,
                    "--sway-delay": `${leaf.sway[2]}s`,
                    transformOrigin: `${(leaf.spec.baseX * 100).toFixed(1)}% ${(leaf.spec.baseY * 100).toFixed(1)}%`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </section>
        <style>{`
        .cover {
          position: relative;
          z-index: 1;
          height: 180vh;
          height: 180svh;
        }
        .cover-scene {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: ${lightColors.textLight};
          --fern-top: #16301d;
          --fern-bottom: #050c07;
        }
        html[data-theme="dark"] .cover-scene {
          color: ${darkColors.textLight};
          --fern-top: #0c1b22;
          --fern-bottom: #020507;
        }
        .cover-stop-top { stop-color: var(--fern-top); }
        .cover-stop-bottom { stop-color: var(--fern-bottom); }
        .cover-defs { position: absolute; width: 0; height: 0; }
        .cover-lqip {
          position: absolute;
          inset: -4%;
          background: #1e2a20 url("${JUNGLE_LQIP_LIGHT}") center / cover no-repeat;
          filter: blur(22px) saturate(1.1);
          transition: opacity 900ms ease;
        }
        html[data-theme="dark"] .cover-lqip {
          background-color: #0e1a18;
          background-image: url("${JUNGLE_LQIP_DARK}");
        }
        html[data-video-ready="true"] .cover-lqip { opacity: 0; }
        .cover-depth {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .cover-depth--near { z-index: 3; }
        .cover-layer {
          position: absolute;
          will-change: transform;
        }
        .cover-layer--fern { opacity: calc(0.9 * var(--leave, 1)); }
        .cover-layer--fern svg { display: block; width: 100%; height: 100%; overflow: visible; }
        .cover-layer--banana {
          opacity: 0;
          transition: opacity 1.2s ease;
          animation: cover-leaf-sway var(--sway-period, 8s) ease-in-out var(--sway-delay, 0s) infinite alternate;
        }
        .cover-layer--banana[data-ready="true"] { opacity: var(--leave, 1); }
        .cover-layer--banana[data-settled="true"],
        .cover-pollen[data-settled="true"] { transition: none; }
        @keyframes cover-leaf-sway {
          from { rotate: calc(var(--sway, 1deg) * -1); }
          to { rotate: var(--sway, 1deg); }
        }
        .cover-layer--leaf-rear { right: -2vw; bottom: 0; width: 30vw; height: 82vh; }
        .cover-layer--leaf-high { right: 0; top: 0; width: 38vw; height: 58vh; }
        .cover-layer--leaf-near { right: -4vw; bottom: 0; width: 40vw; height: 100vh; }
        .cover-layer--leaf-low { left: -6vw; bottom: 0; width: 32vw; height: 92vh; }
        .cover-layer--fern-left { height: 78vh; left: 4vw; top: -62vh; }
        @media (max-width: 899.95px) {
          .cover { height: 150vh; height: 150svh; }
          .cover-layer--wide-only { display: none; }
          .cover-layer--leaf-high { right: -8vw; top: 0; width: 64vw; height: 36vh; }
          .cover-layer--leaf-near { right: -12vw; bottom: 0; width: 96vw; height: 50vh; }
        }
        .cover-mist {
          position: absolute;
          inset: 0;
          will-change: transform, opacity;
        }
        .cover-mist-band {
          position: absolute;
          left: -20%;
          width: 140%;
          border-radius: 50%;
          filter: blur(30px);
        }
        .cover-mist-band--a {
          top: 52%;
          height: 42%;
          background: radial-gradient(closest-side, rgba(222, 236, 205, 0.18), rgba(222, 236, 205, 0));
          animation: cover-mist-drift 38s ease-in-out infinite alternate;
        }
        .cover-mist-band--b {
          top: 64%;
          height: 36%;
          background: radial-gradient(closest-side, rgba(240, 226, 186, 0.12), rgba(240, 226, 186, 0));
          animation: cover-mist-drift 52s ease-in-out -20s infinite alternate-reverse;
        }
        html[data-theme="dark"] .cover-mist-band--a {
          background: radial-gradient(closest-side, rgba(150, 190, 220, 0.12), rgba(150, 190, 220, 0));
        }
        html[data-theme="dark"] .cover-mist-band--b {
          background: radial-gradient(closest-side, rgba(120, 170, 200, 0.09), rgba(120, 170, 200, 0));
        }
        @keyframes cover-mist-drift {
          from { transform: translate3d(-4vw, 0, 0); }
          to { transform: translate3d(4vw, -1vh, 0); }
        }
        .cover-shaft {
          position: absolute;
          top: -12vh;
          left: 47vw;
          width: 22vw;
          height: 125vh;
          transform-origin: 50% 0;
          rotate: 17deg;
          background: linear-gradient(90deg, rgba(255, 226, 160, 0), rgba(255, 228, 168, 0.1) 38%, rgba(255, 240, 205, 0.16) 50%, rgba(255, 228, 168, 0.1) 62%, rgba(255, 226, 160, 0));
          -webkit-mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.6) 45%, transparent 88%);
          mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.6) 45%, transparent 88%);
          animation: cover-shaft-shimmer 9s ease-in-out infinite alternate;
        }
        html[data-theme="dark"] .cover-shaft {
          background: linear-gradient(90deg, rgba(170, 210, 255, 0), rgba(170, 210, 255, 0.07) 38%, rgba(205, 230, 255, 0.12) 50%, rgba(170, 210, 255, 0.07) 62%, rgba(170, 210, 255, 0));
        }
        @keyframes cover-shaft-shimmer {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
        .cover-pollen {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 1.6s ease;
        }
        .cover-pollen[data-ready="true"] { opacity: var(--leave, 1); }
        .cover-copy {
          position: relative;
          z-index: 2;
          max-width: 720px;
          padding: 0 24px;
          transform-origin: 50% 45%;
          will-change: transform, opacity;
        }
        .cover-avatar {
          display: block;
          width: 140px;
          height: 140px;
          margin: 0 auto 36px auto;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid ${lightColors.accent};
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.55), 0 0 0 10px rgba(255, 236, 190, 0.06);
          background-color: ${lightColors.bgDark};
        }
        @media (min-width: 600px) {
          .cover-avatar { width: 150px; height: 150px; }
        }
        @media (min-width: 900px) {
          .cover-avatar { width: 160px; height: 160px; }
        }
        .cover-greeting {
          margin: 0;
          font-family: "Inter", system-ui, sans-serif;
          font-size: clamp(2.5rem, 6.4vw, 5.4rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.02;
          color: #f4efdf;
          text-shadow: 0 2px 30px rgba(8, 14, 9, 0.6), 0 1px 2px rgba(8, 14, 9, 0.5);
        }
        html[data-theme="dark"] .cover-avatar {
          border-color: ${darkColors.accent};
          background-color: ${darkColors.bgDark};
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 0 10px rgba(170, 210, 255, 0.05);
        }
        html[data-theme="dark"] .cover-greeting {
          color: ${darkColors.textLight};
          text-shadow: 0 2px 30px rgba(2, 6, 10, 0.7), 0 1px 2px rgba(2, 6, 10, 0.6);
        }
        .cover-skip {
          position: fixed;
          left: 16px;
          top: 16px;
          z-index: 1300;
          padding: 12px 18px;
          border-radius: 10px;
          background: ${lightColors.btnBg};
          color: ${lightColors.textLight};
          font: 600 1rem/1.2 "Inter", system-ui, sans-serif;
          text-decoration: none;
          transform: translateY(-160%);
          transition: transform 0.2s ease;
        }
        .cover-skip:focus-visible {
          transform: translateY(0);
          outline: 2px solid ${lightColors.accentHover};
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .cover { height: 100vh; height: 100svh; }
          .cover-mist-band, .cover-shaft { animation: none; }
          .cover-lqip, .cover-pollen, .cover-layer--banana { transition: none; }
          .cover-layer--banana { animation: none; }
        }
      `}</style>
      </div>
    </>
  );
};

export default CoverSection;
