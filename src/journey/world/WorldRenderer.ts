import type { QualityTier } from "../device";
import { createFragmentShader, VERTEX_SHADER } from "./worldShader";

const UNIFORMS = [
  "uResolution",
  "uPixelRatio",
  "uTime",
  "uDark",
  "uVideo",
  "uVideoSize",
  "uVideoReady",
  "uStrange",
  "uHead",
  "uEye",
  "uIris",
  "uPupil",
  "uTunnel",
  "uNeural",
  "uDepth",
  "uContour",
  "uPan",
  "uNetwork",
  "uSeeds",
  "uHorizon",
  "uPointer",
] as const;

type UniformName = (typeof UNIFORMS)[number];

export type WorldUniforms = {
  time: number;
  dark: number;
  strange: number;
  head: number;
  eye: [number, number, number];
  iris: number;
  pupil: number;
  tunnel: number;
  neural: number;
  depth: number;
  contour: number;
  pan: [number, number];
  network: number;
  seeds: number;
  horizon: number;
  pointer: [number, number];
};

const TIER_SETTINGS: Record<
  QualityTier,
  { octaves: number; sheets: number; maxPixelRatio: number; scale: number }
> = {
  low: { octaves: 3, sheets: 2, maxPixelRatio: 1, scale: 0.85 },
  medium: { octaves: 4, sheets: 3, maxPixelRatio: 1.25, scale: 0.65 },
  high: { octaves: 4, sheets: 3, maxPixelRatio: 1.5, scale: 0.72 },
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log ?? "unknown error"}`);
  }
  return shader;
};

/**
 * Minimal WebGL2 renderer for the world shader: one full-screen triangle,
 * one program, one video texture. Owns every GL resource it creates and
 * releases them in `dispose`.
 */
export class WorldRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private vao: WebGLVertexArrayObject;
  private texture: WebGLTexture;
  private uniforms: Record<UniformName, WebGLUniformLocation | null>;
  private videoSize: [number, number] = [1280, 720];
  private videoReady = false;
  private readonly maxPixelRatio: number;
  private readonly maxScale: number;
  private scale: number;
  private cssWidth = 0;
  private cssHeight = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    tier: QualityTier,
  ) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: tier === "high" ? "high-performance" : "default",
    });
    if (!gl) throw new Error("WebGL2 is not available");
    this.gl = gl;

    const settings = TIER_SETTINGS[tier];
    this.maxPixelRatio = settings.maxPixelRatio;
    this.maxScale = settings.scale;
    this.scale = settings.scale;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(
      gl,
      gl.FRAGMENT_SHADER,
      createFragmentShader({
        octaves: settings.octaves,
        sheets: settings.sheets,
      }),
    );
    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program link failed: ${log ?? "unknown error"}`);
    }
    this.program = program;

    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    if (!buffer || !vao) throw new Error("Could not create geometry");
    this.buffer = buffer;
    this.vao = vao;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const texture = gl.createTexture();
    if (!texture) throw new Error("Could not create texture");
    this.texture = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([8, 16, 12, 255]),
    );

    this.uniforms = UNIFORMS.reduce(
      (locations, name) => {
        locations[name] = gl.getUniformLocation(program, name);
        return locations;
      },
      {} as Record<UniformName, WebGLUniformLocation | null>,
    );
  }

  get isContextLost() {
    return this.gl.isContextLost();
  }

  /** Resolution scale relative to the CSS size, adjusted by the frame governor. */
  get resolutionScale() {
    return this.scale;
  }

  adjustScale(direction: "down" | "up") {
    const next =
      direction === "down"
        ? Math.max(0.4, this.scale * 0.85)
        : Math.min(this.maxScale, this.scale * 1.08);
    if (Math.abs(next - this.scale) < 0.001) return false;
    this.scale = next;
    this.resize(this.cssWidth, this.cssHeight);
    return true;
  }

  resize(cssWidth: number, cssHeight: number) {
    this.cssWidth = cssWidth;
    this.cssHeight = cssHeight;
    const ratio =
      Math.min(window.devicePixelRatio || 1, this.maxPixelRatio) * this.scale;
    const width = Math.max(1, Math.round(cssWidth * ratio));
    const height = Math.max(1, Math.round(cssHeight * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  uploadVideoFrame(video: HTMLVideoElement | null) {
    const gl = this.gl;
    if (!video || video.readyState < 2 || video.videoWidth === 0) {
      this.videoReady = false;
      return;
    }
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    try {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        video,
      );
      this.videoSize = [video.videoWidth, video.videoHeight];
      this.videoReady = true;
    } catch {
      this.videoReady = false;
    }
  }

  render(values: WorldUniforms) {
    const gl = this.gl;
    const { uniforms } = this;
    const pixelRatio = this.canvas.width / Math.max(1, this.cssWidth);

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.uniform2f(uniforms.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(uniforms.uPixelRatio, pixelRatio);
    gl.uniform1f(uniforms.uTime, values.time);
    gl.uniform1f(uniforms.uDark, values.dark);
    gl.uniform1i(uniforms.uVideo, 0);
    gl.uniform2f(uniforms.uVideoSize, this.videoSize[0], this.videoSize[1]);
    gl.uniform1f(uniforms.uVideoReady, this.videoReady ? 1 : 0);
    gl.uniform1f(uniforms.uStrange, values.strange);
    gl.uniform1f(uniforms.uHead, values.head);
    gl.uniform3f(uniforms.uEye, values.eye[0], values.eye[1], values.eye[2]);
    gl.uniform1f(uniforms.uIris, values.iris);
    gl.uniform1f(uniforms.uPupil, values.pupil);
    gl.uniform1f(uniforms.uTunnel, values.tunnel);
    gl.uniform1f(uniforms.uNeural, values.neural);
    gl.uniform1f(uniforms.uDepth, values.depth);
    gl.uniform1f(uniforms.uContour, values.contour);
    gl.uniform2f(uniforms.uPan, values.pan[0], values.pan[1]);
    gl.uniform1f(uniforms.uNetwork, values.network);
    gl.uniform1f(uniforms.uSeeds, values.seeds);
    gl.uniform1f(uniforms.uHorizon, values.horizon);
    gl.uniform2f(uniforms.uPointer, values.pointer[0], values.pointer[1]);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  /**
   * Deletes every GL object this renderer created. The context itself is
   * left alive: the same canvas (and therefore the same context) is reused
   * if the component mounts again, and the browser releases the context
   * once the canvas is gone.
   */
  dispose() {
    const gl = this.gl;
    gl.deleteTexture(this.texture);
    gl.deleteBuffer(this.buffer);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
  }
}
