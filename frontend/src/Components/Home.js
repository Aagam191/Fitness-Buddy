import React, { useRef, useState, useEffect, useCallback } from "react";
import "../style1.css";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

import {
  ZapIcon,
  TargetIcon,
  UtensilsIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "./Icons";

// #region WebGL Shaders & Helpers for Noise Morph Transition
const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform vec2 u_resolution;
uniform float u_fromAspect;
uniform float u_toAspect;
uniform float u_scale;
uniform float u_direction;
uniform float u_edge;
uniform float u_drift;

varying vec2 v_uv;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
   -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 v) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(v);
    v *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec2 mirror(vec2 uv) {
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}

vec2 coverUV(vec2 uv, float imgAspect) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  vec2 scale = (canvasAspect > imgAspect)
    ? vec2(1.0, imgAspect / canvasAspect)
    : vec2(canvasAspect / imgAspect, 1.0);
  return mirror((uv - 0.5) * scale + 0.5);
}

void main() {
  float adjusted = u_progress * (1.0 + 2.0 * u_edge) - u_edge;

  float noise = fbm(v_uv * u_scale + vec2(0.0, u_progress * u_direction)) * 0.5 + 0.5;
  noise = smoothstep(
    0.0,
    2.0,
    length(texture2D(u_to, coverUV(v_uv, u_toAspect)).rgb) + noise
  );

  float mixFactor = 1.0 - smoothstep(adjusted - u_edge, adjusted + u_edge, noise);

  vec2 fromUV = coverUV(
    v_uv + vec2(0.0, noise * u_progress * u_drift * u_direction),
    u_fromAspect
  );
  vec2 toUV = coverUV(
    v_uv + vec2(0.0, noise * (1.0 - u_progress) * -0.5 * u_drift * u_direction),
    u_toAspect
  );

  vec4 colFrom = texture2D(u_from, fromUV);
  vec4 colTo = texture2D(u_to, toUV);
  vec4 finalColor = mix(colFrom, colTo, mixFactor);

  // Apply deep dark cinematic overlay tint
  gl_FragColor = vec4(finalColor.rgb * 0.42, 1.0);
}
`;

const compileShader = (gl, type, src) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const linkProgram = (gl, vertSrc, fragSrc) => {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

const loadImageTexture = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("could not load " + src));
    img.src = src;
  });

const easeInOutQuint = (t) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2;
};
// #endregion

const SLIDES = [
  {
    id: 0,
    bg: "/images/home-bg-1.jpg",
    badge: "ELITE ATHLETE PLATFORM",
    badgeIcon: ZapIcon,
    badgeColor: "rgba(255, 0, 0, 0.15)",
    badgeText: "#ff4d4d",
    badgeBorder: "rgba(255, 0, 0, 0.4)",
    titlePart1: "Make yourself ",
    titleHighlight: "stronger",
    highlightColor: "#ff0000",
    titlePart2: " than your excuses.",
    description:
      "Science-backed biomechanical exercise mapping, 8-week periodized overload protocols, and precision AI nutrition in a unified athlete dashboard.",
    primaryBtn: { text: "Explore Exercises", link: "/directory" },
    secondaryBtn: { text: "Start Free Trial", link: "/signup" },
  },
  {
    id: 1,
    bg: "/images/home-bg-4.jpg",
    badge: "PERIODIZED PROTOCOLS",
    badgeIcon: TargetIcon,
    badgeColor: "rgba(255, 94, 0, 0.15)",
    badgeText: "#ff7733",
    badgeBorder: "rgba(255, 94, 0, 0.4)",
    titlePart1: "Structured ",
    titleHighlight: "8-Week",
    highlightColor: "#ff5e00",
    titlePart2: " Progressive Overload.",
    description:
      "Hypertrophy Surge (PPL), Athletic Strength & Power (Upper/Lower), and Metabolic Shred with 1-click workout logger loading.",
    primaryBtn: { text: "View 8-Week Programs", link: "/programs" },
    secondaryBtn: { text: "Workout Tracker", link: "/workouts" },
  },
  {
    id: 2,
    bg: "/images/home-bg-3.jpg",
    badge: "AI NUTRITION & HEATMAP",
    badgeIcon: UtensilsIcon,
    badgeColor: "rgba(0, 255, 136, 0.15)",
    badgeText: "#00ff88",
    badgeBorder: "rgba(0, 255, 136, 0.4)",
    titlePart1: "Real-Time ",
    titleHighlight: "Recovery",
    highlightColor: "#00ff88",
    titlePart2: " & Macro Telemetry.",
    description:
      "Monitor systemic supercompensation across 15 anatomical zones and generate 1080p downloadable audit report cards.",
    primaryBtn: { text: "Calculate Macros", link: "/calculate_bmi" },
    secondaryBtn: { text: "Athlete Heatmap", link: "/heatmap" },
  },
];

export default function Home() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(0);
  const [webglReady, setWebglReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 600], [0, -80]);
  const opacityParallax = useTransform(scrollY, [0, 400], [1, 0.2]);

  // Request ref for WebGL transition
  const transitionReq = useRef(null);
  const prevActive = useRef(active);

  const goToSlide = useCallback(
    (nextIdx) => {
      const wrapped = (nextIdx + SLIDES.length) % SLIDES.length;
      if (wrapped === active) return;
      transitionReq.current = { from: active, to: wrapped };
      setActive(wrapped);
      prevActive.current = active;
    },
    [active]
  );

  // Autoplay (Always on continuously)
  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide(active + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, [active, goToSlide]);

  // WebGL Shader Runner
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    let gl;
    try {
      gl =
        canvas.getContext("webgl", { alpha: false, antialias: false }) ||
        canvas.getContext("experimental-webgl");
    } catch {
      setWebglFailed(true);
      return;
    }

    if (!gl) {
      setWebglFailed(true);
      return;
    }

    let program = null;
    let buffer = null;
    const textures = SLIDES.map(() => null);
    const aspects = SLIDES.map(() => 1);
    let raf = 0;
    let disposed = false;

    let fromIdx = active;
    let toIdx = active;
    let progress = 1;
    let startedAt = 0;
    let direction = 1;
    const duration = 1400;
    const noiseScale = 3.2;
    const edge = 0.16;
    const drift = 0.45;

    const resize = () => {
      if (!canvas || disposed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === 0 || h === 0 || (canvas.width === w && canvas.height === h)) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let uniforms = {};

    const pick = (i) => textures[i] || textures.find((t) => t) || null;

    const draw = () => {
      if (disposed) return;
      const req = transitionReq.current;
      if (req) {
        transitionReq.current = null;
        if (req.from !== req.to) {
          fromIdx = req.from;
          toIdx = req.to;
          progress = 0;
          startedAt = performance.now();
          const n = SLIDES.length;
          const forward = ((req.to - req.from + n) % n) * 2 <= n;
          direction = forward ? 1 : -1;
        }
      }

      if (progress < 1) {
        const elapsed = performance.now() - startedAt;
        progress = easeInOutQuint(Math.min(elapsed / duration, 1));
      }

      const fromTex = pick(fromIdx);
      const toTex = pick(toIdx);
      if (!fromTex || !toTex) return;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fromTex);
      gl.uniform1i(uniforms.from, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, toTex);
      gl.uniform1i(uniforms.to, 1);

      gl.uniform1f(uniforms.progress, progress);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.fromAspect, aspects[fromIdx] || 1);
      gl.uniform1f(uniforms.toAspect, aspects[toIdx] || 1);
      gl.uniform1f(uniforms.scale, noiseScale);
      gl.uniform1f(uniforms.direction, direction);
      gl.uniform1f(uniforms.edge, edge);
      gl.uniform1f(uniforms.drift, drift);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = () => {
      draw();
      raf = requestAnimationFrame(frame);
    };

    const init = async () => {
      try {
        program = linkProgram(gl, VERT, FRAG);
        if (!program) {
          setWebglFailed(true);
          return;
        }
        gl.useProgram(program);

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW
        );

        const loc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        for (const name of [
          "from",
          "to",
          "progress",
          "resolution",
          "fromAspect",
          "toAspect",
          "scale",
          "direction",
          "edge",
          "drift",
        ]) {
          uniforms[name] = gl.getUniformLocation(program, "u_" + name);
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        let running = false;
        await Promise.all(
          SLIDES.map((slide, i) =>
            loadImageTexture(slide.bg).then(
              (img) => {
                if (disposed) return;
                const tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                textures[i] = tex;
                aspects[i] = img.naturalWidth / Math.max(img.naturalHeight, 1);

                if (!running) {
                  running = true;
                  resize();
                  setWebglReady(true);
                  raf = requestAnimationFrame(frame);
                }
              },
              () => {
                // If single texture fails, fallback gracefully
              }
            )
          )
        );
      } catch {
        if (!disposed) setWebglFailed(true);
      }
    };

    init();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      for (const tex of textures) if (tex) gl.deleteTexture(tex);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    };
  }, []);

  const currentSlide = SLIDES[active];
  const BadgeIcon = currentSlide.badgeIcon;

  return (
    <section
      className="home"
      id="home"
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "9.5rem 9% 4rem 9%",
        margin: 0,
        background: "#000000",
      }}
    >
      {/* WebGL Morph Shader Canvas Background */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: webglReady ? 1 : 0,
          transition: "opacity 0.6s ease",
          zIndex: 0,
        }}
      />

      {/* Fallback CSS Background Layer (When WebGL is unavailable or loading) */}
      {(!webglReady || webglFailed) && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.88)), url('${currentSlide.bg}') center/cover no-repeat`,
            transition: "background 0.8s ease",
            zIndex: 0,
          }}
        />
      )}

      {/* Radial Ambient Glow Light */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "650px",
          height: "650px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 0, 0, 0.14) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Slide Content with Framer Motion AnimatePresence */}
      <div className="container-fluid px-0" style={{ position: "relative", zIndex: 2 }}>
        <div className="row align-items-center">
          <div className="col-12 col-xl-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                className="content1"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                {/* Hero Badge */}
                <span
                  className="hero-badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: currentSlide.badgeColor,
                    color: currentSlide.badgeText,
                    border: `1px solid ${currentSlide.badgeBorder}`,
                    padding: "0.55rem 1.5rem",
                    borderRadius: "9999px",
                    fontSize: "1.3rem",
                    fontWeight: "800",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    marginBottom: "1.6rem",
                  }}
                >
                  <BadgeIcon size={14} className="me-2 text-danger" /> {currentSlide.badge}
                </span>

                {/* Hero Title */}
                <h3
                  style={{
                    fontSize: "5.2rem",
                    fontWeight: "900",
                    lineHeight: "1.1",
                    letterSpacing: "-0.03rem",
                    color: "#ffffff",
                    textTransform: "none",
                  }}
                >
                  {currentSlide.titlePart1}
                  <span style={{ color: currentSlide.highlightColor }}>
                    {currentSlide.titleHighlight}
                  </span>
                  {currentSlide.titlePart2}
                </h3>

                {/* Hero Subtitle */}
                <p
                  style={{
                    fontSize: "1.75rem",
                    color: "#cbd5e1",
                    maxWidth: "580px",
                    margin: "1.6rem 0 2.6rem 0",
                    lineHeight: "1.7",
                  }}
                >
                  {currentSlide.description}
                </p>

                {/* CTA Button Group */}
                <div className="hero-btn-group d-flex gap-3 align-items-center flex-wrap">
                  <Link to={currentSlide.primaryBtn.link} className="btn1 d-inline-flex align-items-center gap-2">
                    {currentSlide.primaryBtn.text} <ChevronRightIcon size={16} />
                  </Link>
                  <Link to={currentSlide.secondaryBtn.link} className="btn-secondary-hero">
                    {currentSlide.secondaryBtn.text}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating 3D Telemetry HUD (Parallax Effect on Scroll) */}
      <motion.div
        style={{ y: yParallax, opacity: opacityParallax }}
        className="hero-hud-preview d-none d-xl-flex"
      >
        <div className="hud-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <div className="live-pulse-dot" />
              <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff", letterSpacing: "1px" }}>
                LIVE ATHLETE HUD
              </span>
            </div>
            <span
              style={{
                fontSize: "1.1rem",
                background: "rgba(255,0,0,0.2)",
                color: "#ff4d4d",
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                fontWeight: "800",
              }}
            >
              PRO ENGINE
            </span>
          </div>

          <div className="d-flex justify-content-between gap-4 mb-3">
            <div>
              <span className="hud-metric-label">READINESS</span>
              <div className="hud-metric-val text-success">94%</div>
            </div>
            <div>
              <span className="hud-metric-label">7D TONNAGE</span>
              <div className="hud-metric-val text-white">
                18,450 <span style={{ fontSize: "1.2rem", color: "#888" }}>kg</span>
              </div>
            </div>
            <div>
              <span className="hud-metric-label">PROGRAM</span>
              <div className="hud-metric-val text-danger">PPL W3D4</div>
            </div>
          </div>

          <div className="hud-recovery-bar">
            <div className="hud-recovery-fill" style={{ width: "94%" }} />
          </div>
          <span style={{ fontSize: "1.15rem", color: "#94a3b8", display: "block", marginTop: "0.6rem" }}>
            ✓ Supercompensation Active • Prime Overload Window
          </span>
        </div>
      </motion.div>

      {/* Dot-Structured Carousel Controls & Navigation */}
      <div
        className="carousel-dot-controller d-flex align-items-center gap-3"
        style={{
          position: "absolute",
          bottom: "10.5rem",
          left: "9%",
          zIndex: 10,
        }}
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => goToSlide(active - 1)}
          className="carousel-arrow-btn"
          aria-label="Previous Slide"
        >
          <ChevronLeftIcon size={16} />
        </button>

        {/* Interactive Pagination Dots */}
        <div className="d-flex align-items-center gap-2">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`carousel-dot-indicator ${idx === active ? "active" : ""}`}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === active}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => goToSlide(active + 1)}
          className="carousel-arrow-btn"
          aria-label="Next Slide"
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>

      {/* Platform Key Metrics Ribbon with Framer Motion Stagger */}
      <motion.div
        className="hero-stats-ribbon"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="stat-item">
          <span className="stat-number">15+</span>
          <span className="stat-label">Muscle Groups Mapped</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">2-Angle</span>
          <span className="stat-label">Biomechanical Guides</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">AI Engine</span>
          <span className="stat-label">Precision Diet &amp; Macros</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">100%</span>
          <span className="stat-label">Science-Backed Tracking</span>
        </div>
      </motion.div>

      {/* Scoped CSS for Carousel Controls & HUD */}
      <style>{`
        .carousel-arrow-btn {
          width: 3.4rem;
          height: 3.4rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }

        .carousel-arrow-btn:hover {
          background: #ff0000;
          border-color: #ff0000;
          color: #ffffff;
          box-shadow: 0 0 14px rgba(255, 0, 0, 0.5);
          transform: scale(1.08);
        }

        .carousel-dot-indicator {
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
        }

        .carousel-dot-indicator.active {
          width: 32px;
          background: linear-gradient(90deg, #ff0000, #ff4d4d);
          box-shadow: 0 0 12px rgba(255, 0, 0, 0.7);
        }

        .hero-hud-preview {
          position: absolute;
          bottom: 12rem;
          right: 9%;
          z-index: 10;
          pointer-events: none;
        }

        .hud-card {
          background: rgba(18, 18, 18, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-left: 4px solid #ff0000;
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(255, 0, 0, 0.15);
          min-width: 360px;
        }

        .live-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
          box-shadow: 0 0 10px #00ff88;
          animation: pulseGreen 1.5s infinite;
        }

        @keyframes pulseGreen {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(0, 255, 136, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
        }

        .hud-metric-label {
          font-size: 1.15rem;
          font-weight: 800;
          color: #888888;
          letter-spacing: 0.8px;
          display: block;
        }

        .hud-metric-val {
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1.1;
          margin-top: 0.2rem;
        }

        .hud-recovery-bar {
          background: #242424;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 0.8rem;
        }

        .hud-recovery-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff88, #34d399);
          border-radius: 3px;
        }
      `}</style>
    </section>
  );
}
