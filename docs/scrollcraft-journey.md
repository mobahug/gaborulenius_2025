# ScrollCraft journey — design document

This document records the scroll-driven redesign of the portfolio: what existed,
what the visitor journey is, and how it is built. It is the reference for
future changes to the experience.

## A. Current page structure (before the redesign)

- `index.html` resolves theme/locale before paint, carries all SEO metadata,
  JSON-LD and a `<noscript>` summary.
- `main.tsx` paints `CoverSection` immediately (plain DOM, the LCP avatar) and
  lazy-loads `AppShell` (MUI, react-intl, jotai).
- `CoverSection`: a fixed, blurred glass overlay with avatar, "Hi, I'm Gábor"
  and a bouncing "Scroll Down" link. It fades out when `#home` rises.
- `VideoScroller`: one fixed jungle walk video (light/dark variants, 8 s,
  1280×720 scrub encodes). `currentTime = duration × whole-page scroll %`.
- `Hero`: a centred column of glass `Paper` cards separated by 160 px gaps:
  Home, About, Projects (tabs: Work / Hobby = The Explorer), Experience
  (tabs: Highlights / Timeline, detail dialogs), Skills & Tools, Contact,
  Footer. Below-the-fold sections are lazy (`DeferredSection`).
- Motion: the same IntersectionObserver fade-up (`AnimatedReveal`) on every
  element, card hover lift, falling leaves, fireflies (dark theme), an
  optional pixel-art bird that hops between cards.
- Themes: daylight (warm green/gold) and nightfall (moonlit teal/blue).
- Performance gate (`scripts/assert-lighthouse.mjs`): mobile performance
  ≥ 0.9, accessibility 1.0, SEO 1.0, LCP ≤ 2.5 s, TBT ≤ 200 ms, CLS ≤ 0.02.

What the ScrollCraft lens finds: it is exactly "one background video with
text fading over it" — one device repeated for every section, a flat hero
(glass over video), a scroll-hint icon, and the video scrub has no
narrative relationship to the content. The Neural Decompiler project does
not appear at all.

## B. Proposed journey

A walk along the jungle path that slowly discovers computation, told in
chapters that change their mechanics while staying one connected world.

```
JUNGLE ARRIVAL (cover)            painted path, god rays, foreground fronds
  ↓ camera walks forward
THE SENTENCE (#home)              "…a Full-Stack Developer based in Espoo."
  ↓
CLEARING OF SELF (#about)         text in the clearing, story card behind a leaf
  ↓
THE TRAIL (#experience)           dusk falls; the career trail lights up
  ↓ a bird appears in the light
THE EYE (#portal)                 bird → wing passes the lens → jungle turns
  ↓                               strange → eye → through the pupil
NEURAL DECOMPILER (#projects)     vines have become signals; fly through layers
  ↓ neural filaments multiply into contour lines
THE EXPLORER (#explorer)          topographic field map, trail with artifacts
  ↓ contours step into orthogonal routes
WORK / ENGINEERING (#work)        service topology of the work projects
  ↓ network nodes detach and drift like pollen
SKILLS & TOOLS (#skills)          scattered seeds assemble into the tool set
  ↓ every line lies down
THE CLEARING (#contact)           a lake at sunset, the bird lands, contact
```

The post-portal worlds are one evolving line field rendered by a single
shader: neural filaments are iso-lines of a warped noise field; more
iso-levels turn them into topographic contours; quantising the domain turns
contours into stepped, orthogonal routes; sampling the lines at points
releases them as drifting seeds; finally every line lies down as the
glitter on a lake at sunset. Each transformation is literally the previous world
re-parameterised, so the worlds feel related rather than cut together.

## C. Feeling curve

| Chapter           | Feeling                                     | Intensity (1–10) |
| ----------------- | ------------------------------------------- | ---------------- |
| Arrival           | curiosity, calm, discovery                  | 4                |
| The Sentence      | clarity, first impression                   | 4                |
| Clearing of self  | confidence, personality                     | 3                |
| The Trail         | quiet, reflective, dusk (the breath before) | 2                |
| **The Eye**       | **wonder — "what just happened?"**          | **10 (peak)**    |
| Neural Decompiler | complexity, fascination                     | 8                |
| The Explorer      | adventure, movement                         | 6                |
| Work              | precision, engineering confidence           | 5                |
| Skills & Tools    | playfulness, breadth                        | 5                |
| The Clearing      | calm resolution, possibility                | 2                |

The Trail is deliberately the stillest chapter so the portal lands hard.

## D. Signature interaction — "The Eye"

The portfolio's own bird (the blue, gold-beaked bird of the existing pixel
sprites, read as a blue whistling thrush) grows up into a cinematic,
semi-realistic bird:

1. It comes out of the light far away in the god ray and flies toward the
   camera. The bird is a small 3D rig — body, head, articulated wings with
   individual flight feathers, a fanned tail — projected with a perspective
   camera, so it foreshortens, banks into its turns and shows the real
   wingbeat: spread on the downstroke, folded at elbow and wrist on the
   upstroke. Wingbeats come in bursts with glides between them; all of it
   is a function of scroll progress. When scrolling pauses, the wings ease
   into a glide instead of freezing mid-beat.
2. It rushes over the lens: as its body leaves the top of the frame its near
   wing sweeps down across the whole view — a close-up painted feather by
   feather and far out of focus. The wing's trailing edge is the transition
   mask — behind it the same jungle frame is now _strange_: the video frame
   is re-rendered in the shader as a bioluminescent duotone whose leaf and
   vine edges glow.
3. The bird's head is right in front of us, in profile. Its eye looks back.
   The head is drawn in the shader (feathered silhouette, glossy plumage,
   closed yellow beak, rim light from the glowing world), so it shares that
   world's light and lines up exactly with the iris.
4. The camera moves into the eye: dark lid, fibrous brown iris, the pupil
   dilates. The iris fibres stretch into light filaments as we pass through
   the pupil, and the glowing jungle edges dissolve into neural filaments.
5. We are inside: "What is a neural network actually computing?" — the
   Neural Decompiler chapter begins.

Biological motivation: the retina is neural tissue — entering the eye is
entering a neural network. Every step is a pure function of scroll
position, so scrolling back plays it backwards.

## E. Scroll score (desktop)

| Section                                  | Feeling       | Visual world                                                                                   | Interaction device                                                                  | Transition out                                   |
| ---------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| Arrival `#cover` (180svh, pinned)        | curiosity     | jungle walk video + mist + light shaft + pollen + back-lit banana leaves and a fern silhouette | **dimensional parallax, foreground fly-by, pointer depth**                          | the foreground passes the camera, walk continues |
| The Sentence `#home` (175vh, pinned)     | clarity       | jungle walk continues                                                                          | **kinetic typography** (words emerge from mist)                                     | sentence settles, CTAs, release                  |
| Clearing of self `#about`                | confidence    | jungle walk                                                                                    | **occlusion reveal** (painted leaf slides away from the story card) + depth offsets | normal scroll                                    |
| The Trail `#experience`                  | quiet         | dusk: video darkens, fewer particles                                                           | **scroll-drawn path** (timeline trail lights up)                                    | bird appears in the light                        |
| The Eye `#portal` (340vh, pinned)        | wonder (peak) | jungle → strange jungle → eye → neural                                                         | **pinned sequence, fly-by, wing-edge mask, video-as-texture shader, camera dolly**  | through the pupil                                |
| Neural Decompiler `#projects`            | fascination   | neural field, three depth sheets, pulses                                                       | **camera depth flight** + causal-trace diagram                                      | filaments multiply into contours                 |
| The Explorer `#explorer` (360vh, pinned) | adventure     | topographic map                                                                                | **line morph, then horizontal pan** along a GPS trail with app screenshots          | contours step into routes                        |
| Work `#work` (300vh, pinned)             | precision     | blueprint network                                                                              | **topology build** (orthogonal connectors draw, cards unfold by clip-path)          | nodes detach as seeds                            |
| Skills & Tools `#skills`                 | playfulness   | drifting seeds                                                                                 | **particle assembly** (each group's chips fly in as it rises into view)             | lines lie down                                   |
| The Clearing `#contact` (185vh, held)    | calm          | misty lake valley at sunset (moonrise after dark), ridges rising into place                    | **the return** (the bird flies in, flares and lands; then only small signs of life) | footer                                           |

No device repeats in consecutive chapters.

## F. Technical architecture

Smallest reliable stack; no new runtime dependencies.

- `src/journey/scrollTimeline.ts` — one passive scroll/resize listener, one
  rAF flush per frame that measures every scene first and only then lets
  scenes write styles (no layout thrash), re-run on resize and when the
  document grows (`ResizeObserver`), with per-scene progress helpers. Every scene computes its
  state from progress on every frame (never "fire once"), so all effects are
  deterministic and reversible.
- `src/journey/worldState.ts` — plain mutable world parameters (video
  progress, dusk, wipe, iris, neural depth, contour, pan, network, seeds,
  horizon). Each chapter owns the transition _into_ its world and writes
  clamped values, so the combined state is a pure function of scroll
  position regardless of how the visitor got there (including nav jumps).
- `JourneyStage` — the fixed stage: the existing `VideoScroller` (now scrubbed
  only from the cover to the portal wipe, with a dusk layer and a wipe clip)
  and the lazily mounted `WorldCanvas`.
- `WorldCanvas` — raw WebGL2, one full-screen triangle, one fragment
  shader. Samples the jungle video as a texture for the strange-jungle
  moment; renders iris, neural, contour, network, seeds and horizon from a
  single line field. DPR and resolution scale capped per device tier,
  adaptive quality from frame time, renders only while a post-portal world
  is visible and the tab is visible, disposes GL resources on unmount,
  handles context loss. CSS fallback worlds when WebGL2 is unavailable.
- Chapter components own their DOM choreography (transforms, opacity,
  clip-path, SVG stroke) and write styles directly — no React re-render per
  frame.
- Pinning uses CSS `position: sticky`; no JS pin spacers, so layout heights
  are known before lazy content loads (no CLS).
- Cover stays plain DOM (no MUI) so the LCP path is unchanged; its
  choreography uses the same tiny timeline module.

## G. Reused assets

- `gemini-jungle-{light,dark}-scrub.mp4` — the jungle walk and, via WebGL, the
  strange-jungle frame.
- `profile-160/320.webp` (cover), `profile2-small.webp` (story card).
- `light-leaf.webp` / `dark-leaf.webp` — the painted occluding leaf in About.
  (The cover's foreground leaves are procedural banana leaves painted on
  canvas: back-lit blade, parallel veins, splits, pale midrib, depth blur.)
- `explorer/*.webp` — field artifacts along the Explorer trail.
- `anyhau.webp` — Anyhau node in the Work topology.
- The pixel bird's palette (indigo body, golden beak) defines the signature
  bird; the pixel sprites remain for the optional bird effect.
- Existing i18n strings for every existing section (EN/FI).

## H. Missing / would benefit from a custom asset

- A macro photograph or painting of a thrush's eye and head for the
  close-up; the flying and perched bird are a procedural 3D rig, the head
  and iris are procedural in the shader. Drop-in point: `src/journey/bird/`
  and `birdHead()` in the shader.
- A 640 px scrub encode of the jungle videos for phones.
- A painted or photographed sunset-lake plate for the finale (currently
  shader-rendered: sky, clouds, reflections, mist and treelines).
- Figures from Neural Decompiler experiments (the chapter uses an abstract
  causal-trace diagram and does not quote results).

## I. Mobile strategy

A separate composition, not a scaled desktop:

- Shorter pins (cover 150svh, sentence 150vh, portal 270vh, finale
  165vh), no pinned horizontal sections (also on desktop windows shorter
  than 600px): The Explorer becomes a stacked chapter with a native
  swipe carousel of the app screens over a vertically drifting map, and Work
  becomes a vertical backbone whose cards unfold sideways as they arrive.
- Two banana leaves instead of three plus a fern, no pointer parallax, half
  the pollen; the About leaf slides out sideways instead of lifting over the
  text.
- WebGL at DPR 1 and 85 % resolution scale on phones, fewer noise octaves and
  depth sheets, adaptive quality drop if frames exceed budget.
- Text sizes and 44 px tap targets preserved; no content inside pinned
  horizontal tracks.

## J. Reduced motion and performance risks

Reduced motion keeps the chapters and their distinct worlds but removes
motion: no pinning, no parallax, no scrub, no fly-by, no tunnel. Worlds
change by in-place crossfades tied to the section in view; the portal shows a
still composition (bird head, eye, strange jungle); all content is visible
without reveal animation.

Risks and mitigations:

- Shader fill rate on high-DPI screens → DPR cap 1.5, resolution scale,
  frame-time governor, pause when hidden.
- Video decode while scrubbing → scrub stops after the portal; the frame is
  uploaded to the GPU only when it changes.
- TBT/LCP → cover remains plain DOM; WebGL and chapter code load after the
  visitor starts scrolling toward them; Lighthouse's static load never
  compiles the shader.
- CLS → pinned chapters have fixed CSS heights independent of lazy content.
- Backdrop blur cost → panels use opaque-enough tinted backgrounds; blur is
  limited to the navigation.

## Implementation notes

Where things live:

| Concern                                       | Files                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Scroll timeline, scene hook                   | `src/journey/scrollTimeline.ts`, `src/journey/useScene.ts`                                                                            |
| World parameters and who drives them          | `src/journey/worldState.ts`, `src/journey/worldDirector.ts`, `src/journey/JourneyStage.tsx`, `src/journey/chapters/PortalChapter.tsx` |
| WebGL world (shader, renderer, React wrapper) | `src/journey/world/worldShader.ts`, `src/journey/world/WorldRenderer.ts`, `src/journey/WorldCanvas.tsx`                               |
| Portal timing and wing geometry               | `src/journey/portalBeats.ts`, `src/journey/wipeGeometry.ts`                                                                           |
| The bird (rig, drawing, flight, lens wing)    | `src/journey/bird/birdRig.ts`, `drawBird.ts`, `flight.ts`, `lensWing.ts`                                                              |
| The finale (branch, landing)                  | `src/journey/bird/branch.ts`, `landing.ts`, `src/journey/chapters/ContactChapter.tsx`, `clearing()` in the shader                     |
| Cover (plain DOM, LCP path)                   | `src/components/CoverSection.tsx`, `src/journey/foliage.ts`, `src/journey/foliage/bananaLeaf.ts`, `src/journey/lqip.ts`               |
| Chapters                                      | `src/journey/chapters/*.tsx`, `src/journey/chapters/chapters.css`                                                                     |
| Jungle video                                  | `src/components/VideoScroller.tsx`, `src/journey/jungleVideo.ts`                                                                      |

Tuning:

- Chapter lengths are CSS heights (`.cover`, `.chapter-intro`, `.chapter-portal`,
  `.chapter-explorer--wide`, `.chapter-work--wide`); every effect is expressed
  as a fraction of its chapter, so lengths can change without retiming.
- Portal beats are fractions in `PORTAL_BEATS`; the jungle video ends where the
  wing starts to pass.
- Shader cost per device tier is in `TIER_SETTINGS` (`WorldRenderer.ts`); the
  frame governor lowers the render scale when frames exceed ~28 ms.
- In development, `window.__journeyWorld` exposes the live world parameters.
- The bird's path is `WAYPOINTS` in `bird/flight.ts` (screen position plus
  distance from the camera in centimetres); wingbeat bursts and glides are
  `FLAPPING`, their speed `BEAT_RATE`. Its shape and plumage are
  `SPINE_KEYS`, `PRIMARY_LENGTHS` and `BIRD_PALETTES`. The perched pose in
  the finale is `PERCHED` in `ContactChapter.tsx` (wings `tuck`ed, head
  turned level).
- The finale's landing is `WAYPOINTS` and `FLAPPING` in `bird/landing.ts`
  (offsets from the perch and distance relative to the perched distance);
  the branch is `TWIG` and its leaves in `bird/branch.ts`. The valley is
  `clearing()` in the shader: ridge heights, the lake's shore, mist bands
  and how far each layer travels as it rises into place.
- The pinned horizontal chapters (Explorer, Work) need a window at least
  900px wide and 600px tall (`PINNED_LAYOUT_QUERY` in `device.ts`);
  otherwise they use their stacked compositions. The Explorer's walker
  covers the whole trail in step with the pan (`explorerWalk`).
- The cover's leaves are `BANANA_LEAVES` in `CoverSection.tsx`: a CSS box
  per leaf plus where the stalk sits in it, the midrib's angle and droop,
  back light, shade and depth blur.

Adding a custom asset later: the flying bird is drawn by `drawBird()`, which
could be swapped for sprite frames chosen by the same pose and projection;
the lens wing is `paintLensWing()` (any image that covers the band between
`LENS_WING_TRAILING` and `LENS_WING_LEADING` works); the close-up head is
`birdHead()` in the shader and can be swapped for a textured quad without
changing the eye/iris choreography, which only needs the eye's centre and
radius (`world.eyeX/eyeY/eyeR`).

## Verification (September 2026)

- `tsc -b`, `eslint`, `prettier --check`, `vite build`: clean.
- Screenshots at 0–100 % in 10 % steps (and denser through the portal),
  desktop 1440×900 and mobile 390×844, light and dark, English and Finnish,
  and with `prefers-reduced-motion: reduce`, via headless Chrome.
- Determinism: world state sampled at 17 positions scrolling down and up is
  identical on desktop and mobile; no horizontal overflow at any position.
- Throttled mobile load (4× CPU, 1.6 Mbps/150 ms), production build, versus
  `main`: LCP ≈ 1.06 s (was ≈ 1.0 s), TBT ≈ 5 ms (was ≈ 75 ms), CLS 0.001
  (was 0.010). After the realistic bird and procedural leaves: LCP ≈ 1.02–1.05
  s, TBT ≈ 5–13 ms (the leaves are painted one per idle slice), CLS 0.001.
- The flying bird costs ≈ 0.8 ms of main-thread time per frame (projection,
  sorting and canvas commands); its halo and rim passes are limited to the
  bird's bounding box.
- The WebGL world drops to ~30 fps of ambient motion 1.2 s after scrolling
  stops and to ~15 fps after 8 s; the perched bird's idle motion runs at
  ~30 fps only while the finale is on screen.
- Responsive audit (headless Chrome, text boxes checked for overlaps, the
  navigation and the viewport edge at every 30 % of a screen): 975×530,
  1024×640, 1280×720, 1366×657, 1180×820, 910×700, 1100×700, 768×1024,
  820×1180, 390×844, 375×667 and 360×740 report no overlaps apart from
  skill chips crossing each other in mid-flight.
- Real GPU, continuous scroll through the portal and every WebGL world:
  p99 frame time ≈ 17.5 ms, at most one frame over 33 ms.
- Keyboard: all 59 tab stops visible when focused, no heading-level jumps, no
  unnamed controls, no duplicate ids.
