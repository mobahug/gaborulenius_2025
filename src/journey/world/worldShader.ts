export type ShaderQuality = {
  octaves: number;
  sheets: number;
};

export const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/**
 * One fragment shader draws every world after the portal. They all come
 * from a single warped noise field:
 *
 *  - neural filaments are the zero iso-line of the field on three depth
 *    sheets, with pulses travelling along them and nodes where a second
 *    field's iso-line crosses them;
 *  - more iso-levels turn the in-focus filament into topographic contours;
 *  - quantising the domain turns contours into stepped, orthogonal routes;
 *  - the routes break into dots that drift away as seeds;
 *  - finally every line lies down as the glitter on a lake at sunset, in
 *    a misty valley whose forest ridges rise into place.
 *
 * Before the neural world, the jungle video frame is re-lit here as the
 * "strange jungle", and the bird's iris is drawn inside the eye.
 */
export const createFragmentShader = ({
  octaves,
  sheets,
}: ShaderQuality) => `#version 300 es
precision highp float;

#define OCTAVES ${octaves}
#define SHEETS ${sheets}
#define GRID 6.0

uniform vec2 uResolution;
uniform float uPixelRatio;
uniform float uTime;
uniform float uDark;

uniform sampler2D uVideo;
uniform vec2 uVideoSize;
uniform float uVideoReady;

uniform float uStrange;
uniform float uHead;
uniform vec3 uEye;
uniform float uIris;
uniform float uPupil;
uniform float uTunnel;

uniform float uNeural;
uniform float uDepth;
uniform float uContour;
uniform vec2 uPan;
uniform float uNetwork;
uniform float uSeeds;
uniform float uHorizon;
uniform vec2 uPointer;

out vec4 fragColor;

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(hash22(i) * 2.0 - 1.0, f);
  float b = dot(hash22(i + vec2(1.0, 0.0)) * 2.0 - 1.0, f - vec2(1.0, 0.0));
  float c = dot(hash22(i + vec2(0.0, 1.0)) * 2.0 - 1.0, f - vec2(0.0, 1.0));
  float d = dot(hash22(i + vec2(1.0, 1.0)) * 2.0 - 1.0, f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 OCTAVE = mat2(1.6, 1.2, -1.2, 1.6);

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    sum += amp * noise(p);
    p = OCTAVE * p;
    amp *= 0.5;
  }
  return sum;
}

// fbm with an adjustable falloff: low roughness gives long, calm filaments.
float fbmRough(vec2 p, float roughness) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    sum += amp * noise(p);
    p = OCTAVE * p;
    amp *= roughness;
  }
  return sum;
}

float fbm2(vec2 p) {
  return 0.5 * noise(p) + 0.25 * noise(OCTAVE * p);
}

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

// Distance in drawing-buffer pixels to the nearest integer iso-line of v.
float isoDistance(float v) {
  return abs(fract(v + 0.5) - 0.5) / max(fwidth(v), 1e-5);
}

float heightField(vec2 p, float warp, float snap, float roughness, float t) {
  vec2 w = vec2(
    fbm2(p * 0.8 + vec2(1.7, 9.2) + t * 0.018),
    fbm2(p * 0.8 + vec2(8.3, 2.8) - t * 0.015)
  );
  vec2 q = p + warp * w;
  if (snap > 0.001) {
    vec2 cell = (floor(q * GRID) + 0.5) / GRID;
    q = mix(q, cell, snap);
  }
  return fbmRough(q * 1.35, roughness);
}

vec3 neuralLineColor() {
  return mix(vec3(1.0, 0.75, 0.40), vec3(0.58, 0.93, 0.86), uDark);
}

vec3 neuralNodeColor() {
  return mix(vec3(0.55, 0.93, 0.80), vec3(1.0, 0.74, 0.42), uDark);
}

// One decorative depth sheet of filaments.
vec3 neuralSheet(vec2 p, float z, vec2 offset, float t) {
  float pr = uPixelRatio;
  float scale = mix(3.4, 0.55, z);
  float alpha = smoothstep(0.0, 0.25, z) * (1.0 - smoothstep(0.78, 1.0, z));
  vec2 sp = p * scale + offset + uPointer * 0.03 * z;
  float h = heightField(sp, 0.9, 0.0, 0.3, t);
  float d = isoDistance(h);
  float core = 1.0 - smoothstep(0.6 * pr, 1.6 * pr, d);
  float glowWidth = mix(3.0, 16.0, z) * pr;
  float glow = exp(-d * d / (glowWidth * glowWidth));
  float pulse = smoothstep(0.58, 0.95, noise(sp * 1.6 + vec2(t * 0.45, -t * 0.3)) * 0.5 + 0.5);
  float depthLight = mix(0.35, 1.0, z);
  return neuralLineColor() * (core * 0.6 + glow * 0.3) * (0.4 + 1.2 * pulse) * alpha * depthLight;
}

// ---------------------------------------------------------------- the clearing
// A misty valley at the end of the day: a sky with drifting clouds, a lake
// that holds the last light (its glitter is where the lines finally lie
// down) and forest ridges fading into haze. The land rises into place, near
// ridges faster than far ones, as the chapter arrives.

float ridgeNoise(float x, float seed) {
  return 0.5 * noise(vec2(x, seed)) +
    0.25 * noise(vec2(x * 2.03, seed + 5.1)) +
    0.125 * noise(vec2(x * 4.11, seed + 9.7));
}

// Height of a rainforest canopy's edge at x: crowns of varying size with a
// leafy, broken outline.
float crowns(float x, float scale, float seed) {
  float q = x * scale;
  float cell = floor(q);
  float best = 0.0;
  for (int k = -1; k <= 1; k++) {
    float c = cell + float(k);
    float centre = c + 0.2 + 0.6 * hash12(vec2(c, seed));
    float radius = 0.45 + 0.6 * hash12(vec2(c, seed + 3.1));
    float dx = (q - centre) / radius;
    float crown = pow(max(0.0, 1.0 - dx * dx), 0.35) * radius * (0.75 + 0.5 * hash12(vec2(c, seed + 5.3)));
    best = max(best, crown);
  }
  best += 0.16 * noise(vec2(q * 4.3, seed)) + 0.08 * noise(vec2(q * 11.7, seed + 1.3));
  return max(best, 0.0) / scale;
}

// Now and then an emergent tree stands above the canopy: a short stretch of
// bare trunk under a broad crown of clustered leaf masses. Returns its
// coverage at p.
float emergents(vec2 p, float base, float scale, float seed, float chance) {
  float q = p.x * scale;
  float cell = floor(q);
  float cover = 0.0;
  for (int k = -1; k <= 1; k++) {
    float c = cell + float(k);
    if (hash12(vec2(c, seed + 7.7)) > chance) continue;
    float centre = (c + 0.5 + 0.3 * (hash12(vec2(c, seed + 8.1)) - 0.5)) / scale;
    float height = (1.5 + 1.2 * hash12(vec2(c, seed + 9.4))) / scale;
    float width = (0.8 + 0.7 * hash12(vec2(c, seed + 2.2))) / scale;
    vec2 top = vec2(centre, base + height);
    // Three overlapping leaf masses with a ragged edge.
    float edge = 0.12 * width * noise(p * scale * 9.0 + seed);
    float crown = min(
      length((p - top) / vec2(1.0, 0.72)) - width * 0.5,
      min(
        length((p - top - vec2(-0.38, -0.14) * width) / vec2(1.0, 0.75)) - width * 0.36,
        length((p - top - vec2(0.4, -0.1) * width) / vec2(1.0, 0.75)) - width * 0.38
      )
    ) + edge;
    float inCrown = 1.0 - smoothstep(-0.0015, 0.0015, crown);
    float trunkWidth = width * 0.05 * (1.0 + 2.0 * smoothstep(top.y - width * 0.3, base, p.y));
    float trunk = (1.0 - smoothstep(trunkWidth * 0.7, trunkWidth, abs(p.x - centre))) *
      step(base - 0.01, p.y) * step(p.y, top.y);
    cover = max(cover, max(inCrown, trunk));
  }
  return cover;
}

vec3 clearingSunColor() {
  return mix(vec3(1.0, 0.8, 0.52), vec3(0.78, 0.87, 1.0), uDark);
}

// The sky without clouds: cheap enough to sample again for reflections.
vec3 skyGradient(vec2 p, vec2 sun) {
  float h = p.y - 0.02;
  vec3 zenith = mix(vec3(0.13, 0.21, 0.27), vec3(0.008, 0.016, 0.04), uDark);
  vec3 middle = mix(vec3(0.62, 0.52, 0.4), vec3(0.035, 0.075, 0.12), uDark);
  vec3 low = mix(vec3(1.0, 0.68, 0.38), vec3(0.15, 0.25, 0.33), uDark);
  vec3 sky = mix(low, middle, smoothstep(0.0, 0.2, h));
  sky = mix(sky, zenith, smoothstep(0.14, 0.55, h));
  // Forward scattering around the sun, stretched along the horizon.
  vec2 d = (p - sun) * vec2(0.62, 1.5);
  float glow = exp(-length(d) * 6.0);
  float halo = exp(-length(d) * 1.7);
  sky += clearingSunColor() * (glow * 0.95 + halo * 0.25) * mix(1.0, 0.5, uDark);
  return sky;
}

vec3 clearingSky(vec2 p, vec2 sun, float t) {
  vec3 sky = skyGradient(p, sun);
  float h = p.y - 0.02;
  // Clouds: long, wind-stretched banks lit from the sun, bright at the rims.
  vec2 cp = vec2(p.x * 1.5 + t * 0.005, p.y * 5.2);
  float cloud = fbm(cp + vec2(3.1, 1.7)) + 0.4 * fbm(cp * 2.4 + vec2(t * 0.004, 7.0));
  float band = smoothstep(0.05, 0.14, h) * (1.0 - smoothstep(0.26, 0.46, h));
  float cover = smoothstep(0.06, 0.34, cloud) * band;
  float toward = exp(-length((p - sun) * vec2(0.5, 1.2)) * 2.2);
  float rim = smoothstep(0.06, 0.2, cloud) * (1.0 - smoothstep(0.2, 0.42, cloud));
  vec3 shade = mix(vec3(0.42, 0.36, 0.4), vec3(0.03, 0.05, 0.09), uDark);
  vec3 lit = mix(vec3(1.0, 0.76, 0.5), vec3(0.52, 0.64, 0.8), uDark);
  vec3 cloudColor = mix(shade, lit, clamp(toward * 1.4 + rim * (0.35 + toward * 1.6), 0.0, 1.0));
  sky = mix(sky, cloudColor, cover * 0.88);
  // Stars come out in the blue hour.
  if (uDark > 0.01) {
    vec2 sp = p * 95.0;
    vec2 cell = floor(sp);
    vec2 f = fract(sp) - 0.5 - (hash22(cell) - 0.5) * 0.6;
    float star = step(0.94, hash12(cell + 11.0)) * exp(-dot(f, f) * 110.0);
    star *= 0.55 + 0.45 * sin(t * 1.2 + hash12(cell) * 6.283);
    sky += vec3(0.82, 0.9, 1.0) * star * uDark * smoothstep(0.1, 0.32, h) * (1.0 - cover);
  }
  // The disc, a touch flattened by the thick air near the horizon.
  float disc = 1.0 - smoothstep(0.023, 0.026, length((p - sun) * vec2(1.0, 1.1)));
  sky = mix(sky, clearingSunColor() * mix(1.4, 1.05, uDark), disc * (1.0 - 0.75 * cover));
  return sky;
}

vec3 clearing(vec2 p, float t) {
  float rise = 1.0 - smoothstep(0.0, 1.0, uHorizon);
  // On narrow screens the sun moves toward the middle, clear of the branch.
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 sun = vec2(mix(-0.05, 0.2, smoothstep(0.7, 1.4, aspect)), 0.05 - 0.02 * rise);
  vec3 sunColor = clearingSunColor();
  vec3 haze = mix(vec3(0.96, 0.66, 0.42), vec3(0.14, 0.22, 0.3), uDark);
  vec3 forest = mix(vec3(0.03, 0.05, 0.035), vec3(0.008, 0.016, 0.026), uDark);
  // Light spills along the horizon toward the sun.
  float sunward = exp(-abs(p.x - sun.x) * 2.4);
  float aa = max(fwidth(p.y), 1e-4) * 1.2;

  // Layers rise into place as the chapter arrives: near ones travel further.
  float farTop = 0.05 + 0.055 * ridgeNoise(p.x * 1.3, 2.0) - 0.05 * rise;
  float shore = 0.017 + 0.003 * ridgeNoise(p.x * 3.0, 4.0) - 0.08 * rise;
  float forestBase = shore + 0.008 + 0.012 * ridgeNoise(p.x * 3.4, 6.0) - 0.08 * rise;
  float forestTop = forestBase + 0.9 * crowns(p.x, 120.0, 6.0);
  float side = smoothstep(0.18, 0.75, abs(p.x - 0.08));
  float bankBase = -0.075 + 0.16 * side + 0.02 * ridgeNoise(p.x * 4.0, 8.0) - 0.2 * rise;
  float bankTop = bankBase + 1.1 * crowns(p.x, 52.0, 8.0);
  // The foreground is undergrowth: ragged fronds and grass against the light.
  float fronds = pow(max(0.0, noise(vec2(p.x * 38.0, 1.3)) + 0.3), 2.0) * 0.06 +
    pow(max(0.0, noise(vec2(p.x * 96.0, 4.1)) + 0.2), 3.0) * 0.05;
  float nearTop = -0.37 + 0.05 * ridgeNoise(p.x * 3.0, 12.0) + fronds - 0.36 * rise;

  vec3 color = clearingSky(p, sun, t);

  // Distant mountains, almost lost in the haze.
  vec3 far = mix(forest, haze, 0.72) + sunColor * 0.08 * sunward;
  color = mix(color, far, 1.0 - smoothstep(farTop - aa, farTop + aa, p.y));

  // The far shore's forest, rim-lit where the sun sits behind it.
  vec3 shoreForest = mix(forest, haze, 0.46);
  shoreForest += sunColor * 0.5 * sunward * exp(-max(forestTop - p.y, 0.0) / 0.004);
  float inForest = max(
    1.0 - smoothstep(forestTop - aa, forestTop + aa, p.y),
    emergents(p, forestBase, 120.0, 6.0, 0.1)
  ) * step(shore, p.y);
  color = mix(color, shoreForest, inForest);

  // The lake mirrors the sky and the far shore; ripples bend the mirror more
  // toward the viewer, and the sun's glitter lies on it in fine lines.
  if (p.y < shore) {
    float below = shore - p.y;
    float ripple = noise(vec2(p.x * 16.0, p.y * 150.0 + t * 0.5)) * 0.005 * (0.25 + below * 7.0);
    vec2 mirrored = vec2(p.x + ripple, 2.0 * shore - p.y);
    vec3 reflected = skyGradient(mirrored, sun);
    float mirroredFarTop = 0.05 + 0.055 * ridgeNoise(mirrored.x * 1.3, 2.0) - 0.05 * rise;
    reflected = mix(reflected, far, 1.0 - smoothstep(mirroredFarTop - 0.002, mirroredFarTop + 0.002, mirrored.y));
    float mirroredForest = shore + 0.008 + 0.012 * ridgeNoise(mirrored.x * 3.4, 6.0) + 0.9 * crowns(mirrored.x, 120.0, 6.0) - 0.08 * rise;
    reflected = mix(reflected, shoreForest * 0.8, 1.0 - smoothstep(mirroredForest - 0.002, mirroredForest + 0.002, mirrored.y));
    vec3 deep = mix(vec3(0.05, 0.07, 0.07), vec3(0.01, 0.02, 0.035), uDark);
    float fresnel = mix(0.85, 0.45, smoothstep(0.0, 0.3, below));
    vec3 water = mix(deep, reflected, fresnel);
    float column = exp(-abs(p.x - sun.x + ripple * 4.0) * mix(30.0, 5.0, smoothstep(0.0, 0.3, below)));
    float glints = pow(max(0.0, noise(vec2(p.x * 70.0, p.y * 520.0 - t * 1.2)) + 0.45), 7.0);
    float swell = 0.5 + 0.5 * sin(p.y * 260.0 - t * 0.8 + noise(vec2(p.x * 5.0, p.y * 40.0)) * 3.0);
    water += sunColor * column * (glints * 1.6 + swell * 0.12) * mix(1.0, 0.6, uDark);
    color = mix(color, water, smoothstep(shore + aa, shore - aa, p.y));
  }

  // Mist over the water and along the shore, drifting slowly.
  float mist = fbm(vec2(p.x * 2.2 + t * 0.008, p.y * 11.0 - t * 0.002) + 4.0);
  float mistBand = exp(-abs(p.y - (shore + 0.004)) * 30.0) + 0.4 * exp(-abs(p.y - farTop + 0.01) * 26.0);
  float mistAmount = smoothstep(-0.15, 0.4, mist) * mistBand * 0.6;
  vec3 mistColor = mix(haze, sunColor, 0.4 * sunward) * mix(1.0, 0.8, uDark);
  color = mix(color, mistColor, clamp(mistAmount, 0.0, 0.85));

  // The near banks frame the lake; the foreground forest is darkest.
  vec3 bank = mix(forest, haze, 0.18) + sunColor * 0.35 * sunward * exp(-max(bankTop - p.y, 0.0) / 0.005);
  // Emergent trees only where the bank rises clear of the water.
  float inBank = max(
    1.0 - smoothstep(bankTop - aa, bankTop + aa, p.y),
    emergents(p, bankBase, 52.0, 8.0, 0.16) * smoothstep(0.55, 0.8, side)
  );
  color = mix(color, bank, inBank);
  vec3 near = forest * 0.7 + sunColor * 0.12 * sunward * exp(-max(nearTop - p.y, 0.0) / 0.006);
  color = mix(color, near, 1.0 - smoothstep(nearTop - aa, nearTop + aa, p.y));

  // Motes drifting in the last light (fireflies after dark).
  vec2 mp = p * vec2(18.0, 14.0) + vec2(t * 0.03, -t * 0.02);
  vec2 mc = floor(mp);
  vec2 mf = fract(mp) - 0.5 - (hash22(mc + 3.0) - 0.5) * 0.7;
  float mote = step(0.86, hash12(mc + 5.0)) * exp(-dot(mf, mf) * 180.0);
  mote *= 0.5 + 0.5 * sin(t * 1.6 + hash12(mc) * 6.283);
  vec3 moteColor = mix(vec3(1.0, 0.86, 0.6), vec3(0.72, 1.0, 0.7), uDark);
  color += moteColor * mote * smoothstep(0.1, -0.3, p.y) * 0.8 * (1.0 - rise);
  return color;
}

vec3 lineWorld(vec2 p, float t) {
  float pr = uPixelRatio;
  float contour = uContour;
  float network = uNetwork;
  float seeds = uSeeds;
  float horizon = uHorizon;

  vec3 neuralBase = mix(vec3(0.018, 0.034, 0.028), vec3(0.010, 0.018, 0.040), uDark);
  vec3 lineColor = neuralLineColor();

  bool needHorizon = horizon > 0.001;
  bool needField = horizon < 0.999;
  bool needNeural = needField && contour < 0.999;
  bool needMap = needField && contour > 0.001 && network < 0.999 && seeds < 0.999;
  bool needNetwork = needField && network > 0.001 && seeds < 0.999;
  bool needSeeds = needField && seeds > 0.001;

  vec3 world = neuralBase;

  if (needField) {
    // The in-focus sheet carries the line that every later world grows from.
    float z = fract(uDepth + 1.0 / 3.0);
    float scale = mix(3.4, 0.55, z);
    float alpha = smoothstep(0.0, 0.25, z) * (1.0 - smoothstep(0.78, 1.0, z));
    alpha = mix(alpha, 1.0, contour);
    vec2 sp = p * scale + vec2(7.3, 3.1) + uPan * scale + uPointer * 0.03 * z * (1.0 - contour);
    float warp = mix(0.9, 0.42, contour) * (1.0 - 0.55 * network);
    float snap = smoothstep(0.05, 0.9, network);
    float roughness = mix(0.3, 0.5, contour);
    float h = heightField(sp, warp, snap, roughness, t * (1.0 - 0.85 * contour));
    float levels = mix(1.0, 12.0, smoothstep(0.0, 1.0, contour));
    levels = mix(levels, 2.5, network);
    float v = h * levels;
    float d = isoDistance(v);
    float width = mix(1.2, 0.6, contour) * pr;
    float core = 1.0 - smoothstep(width, width + 1.2, d);
    float glowWidth = mix(mix(3.0, 16.0, z), 1.0, contour) * pr;
    float glow = exp(-d * d / (glowWidth * glowWidth)) * (1.0 - 0.85 * contour);

    if (needNeural) {
      vec3 neural = neuralBase;
      float haze = fbm2(p * 1.1 + vec2(0.0, t * 0.01)) * 0.5 + 0.5;
      neural += lineColor * haze * 0.05;
      float outerFade = 1.0 - smoothstep(0.0, 0.7, contour);
      if (outerFade > 0.001) {
        for (int i = 0; i < SHEETS; i++) {
          if (i == 1) continue;
          float zi = fract(uDepth + float(i) / 3.0);
          neural += neuralSheet(p, zi, vec2(float(i) * 7.3, float(i) * 3.1), t) * outerFade;
        }
      }
      float pulse = smoothstep(0.58, 0.95, noise(sp * 1.6 + vec2(t * 0.45, -t * 0.3)) * 0.5 + 0.5);
      float g = fbm2(sp * 1.9 + 13.1);
      float dg = isoDistance(g);
      float nodeRadius = mix(4.0, 9.0, z) * pr;
      float node = exp(-(d * d + dg * dg) / (nodeRadius * nodeRadius));
      neural += (lineColor * (core * 0.7 + glow * 0.32) * (0.4 + 1.1 * pulse) + neuralNodeColor() * node * 1.3) * alpha;
      world = neural;
    }

    if (needMap) {
      vec3 low = mix(vec3(0.070, 0.098, 0.068), vec3(0.036, 0.058, 0.072), uDark);
      vec3 high = mix(vec3(0.205, 0.190, 0.118), vec3(0.092, 0.122, 0.140), uDark);
      vec3 ink = mix(vec3(0.94, 0.82, 0.55), vec3(0.72, 0.87, 0.90), uDark);
      vec3 terrain = mix(low, high, smoothstep(-0.45, 0.45, h));
      vec2 grad = vec2(dFdx(h), dFdy(h)) * pr;
      vec3 normal = normalize(vec3(-grad * 420.0, 1.0));
      float shade = clamp(dot(normal, normalize(vec3(-0.55, 0.5, 0.7))), 0.0, 1.0);
      terrain *= 0.45 + 0.95 * shade;
      float dIndex = isoDistance(v / 5.0);
      float indexLine = 1.0 - smoothstep(width * 1.6, width * 1.6 + 1.2, dIndex);
      vec2 graticule = sp * 0.5;
      float gridD = min(isoDistance(graticule.x), isoDistance(graticule.y));
      vec3 map = terrain;
      map += ink * (core * 0.34 + indexLine * 0.34 + glow * 0.12);
      map += ink * 0.06 * (1.0 - smoothstep(0.0, 1.0, gridD));
      world = mix(world, map, contour);
    }

    if (needNetwork) {
      vec3 base = mix(vec3(0.020, 0.052, 0.048), vec3(0.012, 0.030, 0.062), uDark);
      vec3 trace = mix(vec3(0.64, 0.92, 0.80), vec3(0.56, 0.82, 0.98), uDark);
      vec3 packetColor = vec3(1.0, 0.8, 0.46);
      vec3 net = base;
      float cellD = min(isoDistance(sp.x * GRID), isoDistance(sp.y * GRID));
      net += trace * 0.05 * (1.0 - smoothstep(0.0, 1.0, cellD));
      net += trace * (core * 0.55 + glow * 0.18);
      vec2 cell = floor(sp * GRID);
      float lane = hash12(cell);
      float packet = smoothstep(0.9, 1.0, fract((sp.x + sp.y) * 1.3 - t * (0.22 + lane * 0.3) + lane * 5.0));
      net += packetColor * core * packet * 1.6;
      vec2 local = abs(fract(sp * GRID) - 0.5);
      float via = 1.0 - smoothstep(0.05, 0.14, length(0.5 - local));
      net += trace * via * smoothstep(0.0, 0.4, core + glow) * 0.9;
      world = mix(world, net, network);
    }

    if (needSeeds) {
      vec3 base = mix(vec3(0.030, 0.050, 0.040), vec3(0.014, 0.026, 0.052), uDark);
      vec3 trace = mix(vec3(0.64, 0.92, 0.80), vec3(0.56, 0.82, 0.98), uDark);
      vec3 seedColor = mix(vec3(1.0, 0.84, 0.55), vec3(0.78, 0.93, 1.0), uDark);
      vec2 dotCell = fract(sp * 16.0) - 0.5;
      float dots = 1.0 - smoothstep(0.16, 0.28, length(dotCell));
      float broken = core * mix(1.0, dots, smoothstep(0.0, 0.45, seeds));
      float light = 0.0;
      for (int j = 0; j < 3; j++) {
        float fj = float(j);
        float density = 5.0 + fj * 3.5;
        vec2 q = p * density + vec2(fj * 13.1, -t * (0.05 + fj * 0.03) * density);
        vec2 c = floor(q);
        vec2 f = fract(q) - 0.5;
        vec2 o = (hash22(c + fj * 7.0) - 0.5) * 0.7;
        float present = step(0.58, hash12(c + 3.7 + fj));
        float size = 0.045 + 0.04 * hash12(c + 9.1);
        float twinkle = 0.6 + 0.4 * sin(t * 1.3 + hash12(c) * 6.283);
        light += present * (1.0 - smoothstep(0.0, size, length(f - o))) * twinkle * (1.0 - fj * 0.22);
      }
      vec3 field = base + trace * broken * (1.0 - 0.75 * seeds) + seedColor * light * smoothstep(0.1, 0.7, seeds);
      world = mix(world, field, seeds);
    }
  }

  if (needHorizon) {
    world = mix(world, clearing(p, t), horizon);
  }

  return world;
}

vec3 strangeJungle(vec2 css, vec2 view, vec2 p, float t) {
  vec3 shadow = mix(vec3(0.012, 0.030, 0.026), vec3(0.008, 0.016, 0.034), uDark);
  vec3 lit = mix(vec3(0.17, 0.34, 0.27), vec3(0.11, 0.24, 0.38), uDark);
  vec3 glowColor = neuralLineColor();
  if (uVideoReady < 0.5) {
    float h = fbm(p * 2.2 + 3.0);
    float e = 1.0 - smoothstep(0.0, 2.0 * uPixelRatio, isoDistance(h * 3.0));
    return mix(shadow, lit, smoothstep(-0.3, 0.3, h)) * 0.8 + glowColor * e * 0.6;
  }
  float s = max(view.x / uVideoSize.x, view.y / uVideoSize.y);
  vec2 drawn = uVideoSize * s;
  vec2 offset = 0.5 * (view - drawn);
  vec2 flow = vec2(noise(p * 3.0 + vec2(0.0, t * 0.06)), noise(p * 3.0 + vec2(5.2, -t * 0.05)));
  vec2 warped = css + flow * (3.0 + 22.0 * uNeural);
  vec2 uv = (warped - offset) / drawn;
  vec2 texel = vec2(1.6) / drawn;
  float c = luma(texture(uVideo, uv).rgb);
  float l = luma(texture(uVideo, uv - vec2(texel.x, 0.0)).rgb);
  float r = luma(texture(uVideo, uv + vec2(texel.x, 0.0)).rgb);
  float u = luma(texture(uVideo, uv - vec2(0.0, texel.y)).rgb);
  float d = luma(texture(uVideo, uv + vec2(0.0, texel.y)).rgb);
  float edge = length(vec2(r - l, d - u));
  vec3 base = mix(shadow, lit, smoothstep(0.02, 0.6, c));
  float shimmer = 0.65 + 0.35 * noise(p * 7.0 + vec2(t * 0.35, t * 0.2));
  float glow = smoothstep(0.012, 0.09, edge) * shimmer * (0.5 + 0.8 * smoothstep(0.03, 0.3, c));
  float shaft = smoothstep(0.3, 0.8, c);
  // Bioluminescence breathing through the foliage.
  float breathe = 0.5 + 0.5 * sin(t * 0.8 + noise(p * 2.0) * 6.0);
  return base + glowColor * (glow * 0.85 + shaft * 0.4 + smoothstep(0.08, 0.3, c) * 0.07 * breathe);
}

// ---------------------------------------------------------------- the bird
// Close-up of the bird's head in eye-radius units (y down, the bird faces
// left). Signed distances are approximate but good enough for shading.
float sdEllipse(vec2 p, vec2 r) {
  return (length(p / r) - 1.0) * min(r.x, r.y);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float headShape(vec2 q) {
  float skull = sdEllipse(q - vec2(2.3, 0.7), vec2(4.7, 5.0));
  float throat = sdEllipse(q - vec2(1.2, 5.2), vec2(3.6, 3.4));
  float neck = sdEllipse(q - vec2(7.0, 8.5), vec2(5.8, 8.5));
  // Feathered lores that wrap the base of the beak.
  float lores = sdEllipse(q - vec2(-1.3, 0.55), vec2(1.7, 1.45));
  float d = smin(skull, throat, 1.8);
  d = smin(d, neck, 2.6);
  d = smin(d, lores, 0.8);
  // A soft, feathery outline instead of a clean curve.
  d += 0.2 * noise(q * 2.1 + 11.0) + 0.05 * noise(q * 5.3 + 3.0);
  return d;
}

// The closed beak: a stout wedge whose culmen curves down into a small hook.
// Returns the distance (negative inside) and, through along and across,
// where a point sits on it (0 at the base … 1 at the tip; 0 at the culmen …
// 1 at the chin).
const float BEAK_BASE = -1.7;
const float BEAK_TIP = -9.4;
float beakTop(float t) {
  return mix(-0.95, 0.58, pow(t, 1.25)) + 0.28 * smoothstep(0.78, 1.0, t);
}
float beakBottom(float t) {
  return mix(1.85, 0.74, pow(t, 0.85));
}
float closedBeak(vec2 q, out float along, out float across) {
  float t = clamp((q.x - BEAK_BASE) / (BEAK_TIP - BEAK_BASE), 0.0, 1.0);
  float top = beakTop(t);
  float bottom = beakBottom(t);
  along = t;
  across = (q.y - top) / max(bottom - top, 0.001);
  float d = max(top - q.y, q.y - bottom);
  // Round the tip and close the base.
  d = max(d, BEAK_TIP + 0.1 - q.x);
  d = max(d, q.x - BEAK_BASE);
  float tipRound = length(q - vec2(BEAK_TIP + 0.35, (beakTop(0.96) + beakBottom(0.96)) * 0.5)) - 0.3;
  if (q.x < BEAK_TIP + 0.35) d = max(d, tipRound);
  return d;
}

vec3 plumage(vec2 q, float sd, float facing) {
  vec2 rel = q - vec2(-2.5, 0.35);
  float r = length(rel);
  float a = atan(rel.y, rel.x);
  // Feathers flow back from the beak; noise keeps the rows from reading as rings.
  float rows = log(max(r, 0.05)) * 13.0 + noise(q * 1.7) * 0.9;
  float cols = a * 24.0 + noise(q * 2.3 + 5.0) * 0.6;
  float rowId = floor(rows);
  float shift = mod(rowId, 2.0) * 0.5;
  float colF = fract(cols + shift);
  float colId = floor(cols + shift);
  float rowF = fract(rows);
  float tip = 0.74 + 0.22 * cos((colF - 0.5) * 3.14159);
  float edgeSoftness = max(0.06, fwidth(rows) * 1.5);
  float feather = smoothstep(tip + edgeSoftness, tip - edgeSoftness, rowF);
  float h = hash12(vec2(rowId, colId));
  float lengthLight = smoothstep(0.0, tip, rowF);

  // Volume: a dark, glossy form lit from behind, brighter toward its edge.
  float edgeLight = smoothstep(-5.0, 0.0, sd);
  vec3 base = mix(vec3(0.008, 0.01, 0.028), vec3(0.03, 0.036, 0.09), edgeLight);
  // Broad iridescent patches, the thrush's blue-violet gloss.
  float gloss = smoothstep(0.0, 0.55, noise(q * 0.45 + vec2(3.1, 7.7)) + 0.3 * facing);
  vec3 sheenColor = mix(vec3(0.13, 0.19, 0.52), vec3(0.28, 0.18, 0.55), h);
  vec3 color = base + sheenColor * gloss * (0.16 + 0.28 * lengthLight * feather);
  // Feather microstructure, kept subtle.
  color *= mix(0.88, 1.05, feather * lengthLight);
  float barbs = 0.5 + 0.5 * sin(colF * 30.0 + rowF * 4.0 + h * 20.0);
  color *= 0.94 + 0.08 * barbs;
  float spangle = step(0.93, h) *
    exp(-pow((rowF - tip + 0.12) / 0.07, 2.0)) *
    exp(-pow((colF - 0.5) / 0.14, 2.0));
  color += vec3(0.3, 0.36, 0.9) * spangle * 0.3 * (0.4 + gloss);
  // Fine detail fades to its average where it would alias.
  float detail = 1.0 - smoothstep(0.3, 0.7, fwidth(rows));
  return mix(base + sheenColor * gloss * 0.18, color, detail);
}

// Returns the head colour in rgb and its coverage in a.
vec4 birdHead(vec2 css, vec3 glowColor) {
  vec2 q = (css - uEye.xy) / max(uEye.z, 0.001);
  float sd = headShape(q);
  float aa = fwidth(sd) * 1.2;
  vec2 grad = vec2(dFdx(sd), dFdy(sd));
  vec2 normal = grad / max(length(grad), 1e-5);
  vec2 lightDir = normalize(vec2(0.5, -0.86));
  float facing = max(dot(normal, lightDir), 0.0);

  vec3 color = plumage(q, sd, facing);
  // Rim light from the glowing world behind the bird.
  float rim = exp(-pow((sd + 0.12) / 0.32, 2.0)) * facing;
  color += glowColor * rim * 1.25;
  color += glowColor * 0.05 * smoothstep(-2.0, 0.0, sd);

  // The eyelid: a thin dark rim with a faint lower highlight, and its shadow.
  float re = length(q);
  float lid = smoothstep(0.97, 1.02, re) * (1.0 - smoothstep(1.1, 1.2, re));
  vec3 lidColor = vec3(0.028, 0.03, 0.05) + vec3(0.12, 0.13, 0.2) * smoothstep(0.2, 0.9, q.y) * 0.5;
  color = mix(color, lidColor, lid);
  color *= 1.0 - 0.45 * exp(-pow((re - 1.02) / 0.06, 2.0)) * smoothstep(0.7, -0.5, q.y);

  // The eye itself is a hole: the iris and the world behind the pupil show there.
  float coverage = (1.0 - smoothstep(-aa, aa, sd)) * smoothstep(0.97, 1.0, re);

  // Beak: closed, yellow, darker horn at the tip, glossy along the culmen,
  // with the line of the gape and a nostril near the base.
  float along;
  float across;
  float beakDistance = closedBeak(q, along, across);
  float beakAa = fwidth(beakDistance) * 1.2;
  // The beak's base disappears under the lore feathers.
  float beak = (1.0 - smoothstep(-beakAa, beakAa, beakDistance)) *
    (1.0 - smoothstep(-2.9, -2.3, q.x + 0.25 * noise(q * 5.0)));
  vec3 horn = mix(vec3(0.62, 0.4, 0.08), vec3(0.93, 0.72, 0.22), smoothstep(0.0, 0.35, along));
  horn = mix(horn, vec3(0.5, 0.33, 0.1), smoothstep(0.72, 1.0, along));
  // Rounded in section: lit along the culmen, shaded toward the chin.
  horn *= 1.05 - 0.55 * smoothstep(0.1, 1.0, across);
  horn += vec3(1.0, 0.92, 0.72) * exp(-pow((across - 0.12) / 0.07, 2.0)) * 0.5 * (1.0 - 0.6 * along);
  horn *= 1.0 - 0.3 * exp(-pow((across - 0.3) / 0.12, 2.0)) * (1.0 - along);
  horn *= 0.93 + 0.07 * noise(q * vec2(3.0, 16.0));
  // The gape: where the mandibles meet, a fine dark line.
  float gapeAcross = mix(0.72, 0.58, along) + 0.12 * (1.0 - smoothstep(0.0, 0.12, along));
  float gape = exp(-pow((across - gapeAcross) / 0.035, 2.0)) * (1.0 - smoothstep(0.9, 1.0, along));
  horn *= 1.0 - 0.75 * gape;
  vec2 nostril = (q - vec2(-2.95, -0.2)) / vec2(0.34, 0.09);
  horn *= 1.0 - 0.7 * (1.0 - smoothstep(0.6, 1.0, length(nostril)));
  horn += glowColor * 0.2 * exp(-pow(across / 0.08, 2.0)) * facing;

  color = mix(color, horn, beak);
  coverage = max(coverage, beak);
  return vec4(color, coverage);
}

vec3 applyIris(vec3 behind, float r, float angle, float pupilRadius, float inPupil, vec2 local, float closeness, float t) {
  if (r > 1.02) return behind;
  vec2 dir = vec2(cos(angle), sin(angle));
  float fibres = 0.5 + 0.5 * sin(angle * 47.0 + 2.4 * sin(angle * 9.0) + 1.6 * noise(dir * 3.0 + r * 4.0));
  fibres *= 0.6 + 0.4 * (0.5 + 0.5 * sin(angle * 23.0 + 5.0 * r));
  float fine = 0.5 + 0.5 * sin(angle * 83.0 + 3.1 * noise(dir * 5.0 + r * 7.0));
  float crypts = smoothstep(0.1, 0.5, noise(dir * 6.0 + vec2(r * 9.0, 0.0)));
  float iris = clamp((r - pupilRadius) / max(1.0 - pupilRadius, 0.001), 0.0, 1.0);

  vec3 inner = vec3(0.74, 0.47, 0.18);
  vec3 middle = vec3(0.42, 0.22, 0.07);
  vec3 outer = vec3(0.09, 0.045, 0.02);
  vec3 irisColor = mix(inner, middle, smoothstep(0.0, 0.45, iris));
  irisColor = mix(irisColor, outer, smoothstep(0.55, 1.0, iris));
  irisColor *= 0.55 + 0.6 * fibres * (0.7 + 0.3 * fine);
  irisColor *= 1.0 - 0.35 * crypts * smoothstep(0.1, 0.6, iris);
  float collarette = exp(-pow((iris - 0.26) / 0.05, 2.0));
  irisColor += vec3(1.0, 0.8, 0.45) * collarette * 0.35 * (0.6 + 0.4 * fibres);
  irisColor *= 1.0 - 0.8 * smoothstep(0.8, 1.0, iris);
  float streak = pow(max(0.0, sin(angle * 61.0 + noise(dir * 4.0) * 3.0)), 18.0) *
    fract(log(max(r, 0.01)) * 2.0 - t * 1.4);
  irisColor += vec3(1.0, 0.82, 0.5) * streak * uTunnel * 1.6;
  irisColor = mix(irisColor, irisColor * 0.3 + behind * 0.8, uTunnel * uTunnel);

  float edgeDark = smoothstep(pupilRadius * 0.45, pupilRadius, r);
  float inside = mix(0.3, 1.0, sqrt(uTunnel));
  vec3 pupil = behind * inside * (1.0 - 0.7 * edgeDark * (1.0 - uTunnel));
  float ruff = exp(-pow((r - pupilRadius) / 0.02, 2.0)) * (1.0 - uTunnel);
  vec3 eye = mix(irisColor, pupil, inPupil);
  eye = mix(eye, vec3(0.06, 0.03, 0.015), ruff * 0.85);

  vec2 highlight = local - vec2(-0.34, -0.38);
  float specular = exp(-dot(highlight, highlight) * 70.0) * 0.85;
  vec2 second = local - vec2(0.28, 0.32);
  specular += exp(-dot(second, second) * 380.0) * 0.35;
  float sheen = smoothstep(0.72, 1.0, r) * 0.08;
  eye += vec3(1.0, 0.97, 0.9) * (specular + sheen) * (1.0 - uTunnel) * closeness;

  float rim = 1.0 - smoothstep(0.985, 1.0, r);
  return mix(behind, eye, rim);
}

void main() {
  vec2 view = uResolution / uPixelRatio;
  vec2 css = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uPixelRatio;
  vec2 p = (css - 0.5 * view) / view.y;
  p.y = -p.y;
  float t = uTime;

  vec2 toEye = css - uEye.xy;
  float eyeRadius = max(uEye.z, 0.001);
  float r = length(toEye) / eyeRadius;
  float angle = atan(toEye.y, toEye.x);
  vec2 ring = vec2(cos(angle), sin(angle));
  float pupilRadius = mix(0.34, 0.64, clamp(uPupil, -0.3, 1.0)) *
    (1.0 + 0.045 * noise(ring * 2.5 + t * 0.1));
  float inPupil = uIris > 0.001
    ? 1.0 - smoothstep(pupilRadius - 0.006, pupilRadius + 0.006, r)
    : 0.0;

  vec2 fromEye = vec2(toEye.x, -toEye.y) / view.y;
  vec2 inside = fromEye / mix(0.3, 1.0, uTunnel);
  vec2 wp = mix(p, inside, inPupil);
  float neuralHere = mix(uNeural, 1.0, inPupil);

  vec3 color;
  bool needLines = uNeural > 0.001 || uIris > 0.001;
  bool needStrange = uStrange > 0.001 && uNeural < 0.999;
  vec3 lines = needLines ? lineWorld(wp, t) : vec3(0.0);
  if (needStrange) {
    vec3 strange = strangeJungle(css, view, p, t);
    color = needLines ? mix(strange, lines, neuralHere) : strange;
  } else {
    color = lines;
  }

  if (uHead > 0.001) {
    vec4 head = birdHead(css, neuralLineColor());
    // A little of the rim light spills into the air around the head.
    color = mix(color, head.rgb, head.a * uHead);
  }

  if (uIris > 0.001) {
    // Reflections shrink away once the eye fills the frame.
    float closeness = 1.0 - smoothstep(0.35, 0.9, eyeRadius / view.y);
    color = applyIris(color, r, angle, pupilRadius, inPupil, toEye / eyeRadius, closeness, t);
  }

  color *= 1.0 - 0.28 * pow(length(p * vec2(0.75, 1.0)), 2.0);
  color += (hash12(gl_FragCoord.xy + fract(t * 7.0) * 113.0) - 0.5) * 0.016;
  fragColor = vec4(max(color, 0.0), 1.0);
}
`;
