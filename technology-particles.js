(() => {
  "use strict";

  const technologySection = document.querySelector("#technology");
  const techBackground = document.querySelector(".tech-background");
  const techIntro = document.querySelector(".tech-intro");
  const techPart1 = document.querySelector(".tech-part1");
  const techPart2 = document.querySelector(".tech-part2");
  const progressBarInner = document.querySelector(".progress-bar-inner");

  if (!technologySection || !techBackground) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "technology-particles-canvas";
  techBackground.prepend(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const DPR_MAX = 2;
  const DOT_COUNT_DESKTOP = 900;
  const DOT_COUNT_MOBILE = 420;
  const BG_COLOR = "#000000";
  const DOT_CREAM = "rgba(244, 238, 225, 0.92)";
  const DOT_CREAM_SOFT = "#CDFAAC";
  const DOT_BLUE = "#005eff";
  const DOT_GREEN = "#CDFAAC";

  let width = 0;
  let height = 5;
  let dpr = 4;
  let particles = [];
  let lastTime = performance.now();
  let mouse = { x: 0, y: 0, active: false };
  let currentPhase = 0;
  let targetPhase = 0;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getDotCount() {
    return window.innerWidth < 768 ? DOT_COUNT_MOBILE : DOT_COUNT_DESKTOP;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    width = techBackground.clientWidth || window.innerWidth;
    height = techBackground.clientHeight || window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildParticles(getDotCount());
  }

  function buildParticles(count) {
    particles = new Array(count).fill(0).map((_, i) => ({
      id: i,
      x: rand(0, width),
      y: rand(0, height),
      tx: rand(0, width),
      ty: rand(0, height),
      size: rand(1.1, 2.7),
      alpha: rand(0.35, 0.98),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.3, 1.1),
      color: DOT_CREAM,
      colorMix: 0
    }));
  }

  function getSectionProgress() {
    const rect = technologySection.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-rect.top / total, 0, 1);
  }

  function updatePhaseFromScroll() {
    const p = getSectionProgress();

    if (progressBarInner) {
      progressBarInner.style.transform = `scaleX(${p})`;
    }

    targetPhase = p * 4;
    currentPhase = lerp(currentPhase, targetPhase, 0.08);
  }

  function getRectTargets(index, count, cols, rows, rectX, rectY, rectW, rectH) {
    const col = index % cols;
    const row = Math.floor(index / cols) % rows;
    return {
      x: rectX + (col / Math.max(1, cols - 1)) * rectW,
      y: rectY + (row / Math.max(1, rows - 1)) * rectH
    };
  }

  function getStateTargets(i) {
    const count = particles.length;
    const cx = width * 0.5;
    const cy = height * 0.54;

    const scattered = {
      x: (i * 47.23) % width,
      y: ((i * 91.37) % height) * 0.88 + height * 0.06
    };

    const rectCols = Math.max(18, Math.floor(Math.sqrt(count) * 1.7));
    const rectRows = Math.max(10, Math.ceil(count / rectCols));
    const rect = getRectTargets(
      i,
      count,
      rectCols,
      rectRows,
      cx - width * 0.24,
      cy - height * 0.12,
      width * 0.48,
      height * 0.24
    );

    const squareCols = Math.max(16, Math.floor(Math.sqrt(count)));
    const squareRows = Math.max(16, Math.ceil(count / squareCols));
    const square = getRectTargets(
      i,
      count,
      squareCols,
      squareRows,
      cx - width * 0.16,
      cy - height * 0.02,
      width * 0.32,
      width * 0.32
    );

    const layerRows = 34;
    const itemsPerRow = Math.ceil(count / layerRows);
    const row = Math.floor(i / itemsPerRow);
    const col = i % itemsPerRow;
    const layered = {
      x: cx - width * 0.24 + (col / Math.max(1, itemsPerRow - 1)) * width * 0.48,
      y: cy - height * 0.13 + (row / Math.max(1, layerRows - 1)) * height * 0.26
    };

    const half = Math.floor(count * 0.5);
    let stacked;
    if (i < half) {
      const cols = Math.max(12, Math.floor(Math.sqrt(half)));
      const rows = Math.ceil(half / cols);
      stacked = getRectTargets(
        i,
        half,
        cols,
        rows,
        cx - width * 0.30,
        cy - height * 0.12,
        width * 0.20,
        width * 0.20
      );
    } else {
      const ii = i - half;
      const rem = count - half;
      const cols = Math.max(12, Math.floor(Math.sqrt(rem)));
      const rows = Math.ceil(rem / cols);
      stacked = getRectTargets(
        ii,
        rem,
        cols,
        rows,
        cx + width * 0.10,
        cy - height * 0.12,
        width * 0.20,
        width * 0.20
      );
    }

    return { scattered, rect, square, layered, stacked };
  }

  function getParticleColor(i, phase) {
    if (phase < 1.5) return DOT_CREAM;
    if (phase < 2.8) return i % 9 === 0 ? DOT_BLUE : DOT_CREAM;
    if (phase < 3.6) return i % 7 === 0 ? DOT_BLUE : DOT_CREAM_SOFT;
    return i < particles.length * 0.5 ? DOT_BLUE : DOT_GREEN;
  }

  function updateParticles(dt) {
    updatePhaseFromScroll();

    const phaseIndex = Math.floor(currentPhase);
    const phaseT = easeInOutCubic(currentPhase - phaseIndex);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const t = getStateTargets(i);

      let from;
      let to;

      switch (phaseIndex) {
        case 0:
          from = t.scattered;
          to = t.rect;
          break;
        case 1:
          from = t.rect;
          to = t.square;
          break;
        case 2:
          from = t.square;
          to = t.layered;
          break;
        default:
          from = t.layered;
          to = t.stacked;
          break;
      }

      p.tx = lerp(from.x, to.x, phaseT);
      p.ty = lerp(from.y, to.y, phaseT);

      const wobbleStrength = phaseIndex === 0 ? 18 : phaseIndex === 1 ? 8 : 3;
      p.phase += 0.012 * dt * p.speed;

      const wobbleX = Math.cos(p.phase) * wobbleStrength;
      const wobbleY = Math.sin(p.phase * 1.17) * wobbleStrength * 0.55;

      let mx = 0;
      let my = 0;
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const radius = 110;
        if (distSq < radius * radius) {
          const dist = Math.sqrt(distSq) || 1;
          const force = (radius - dist) / radius;
          mx = (dx / dist) * force * 10;
          my = (dy / dist) * force * 10;
        }
      }

      p.x = lerp(p.x, p.tx + wobbleX + mx, 0.08);
      p.y = lerp(p.y, p.ty + wobbleY + my, 0.08);
      p.color = getParticleColor(i, currentPhase);
    }
  }

  function drawBlueGuideLines() {
    if (currentPhase < 1.2 || currentPhase > 2.6) return;

    const local = clamp((currentPhase - 1.2) / 1.0, 0, 1);
    const opacity = local < 0.5 ? local * 2 : (1 - local) * 1.2 + 0.2;

    const cx = width * 0.5;
    const top = height * 0.30;
    const spacing = Math.max(14, width * 0.014);
    const count = 5;

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(0,0,0,${opacity})`;

    for (let i = 0; i < count; i++) {
      const y = top + i * spacing;
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.13, y);
      ctx.lineTo(cx + width * 0.13, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawLayerLines() {
    if (currentPhase < 2.35 || currentPhase > 3.55) return;

    const local = clamp((currentPhase - 2.35) / 1.2, 0, 1);
    const alpha = local < 0.5 ? local * 2 : 1 - (local - 0.5) * 0.7;

    const cx = width * 0.5;
    const top = height * 0.41;
    const layerCount = 30;
    const spacing = Math.max(4, height * 0.008);

    ctx.save();
    ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.5})`;
    ctx.lineWidth = 1;

    for (let i = 0; i < layerCount; i++) {
      const y = top + i * spacing;
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.24, y);
      ctx.lineTo(cx + width * 0.24, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);

    drawBlueGuideLines();
    drawLayerLines();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animate(now) {
    const dt = Math.min((now - lastTime) / 16.6667, 7.0);
    lastTime = now;

    updateParticles(dt);
    drawParticles();

    requestAnimationFrame(animate);
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  }

  function onMouseLeave() {
    mouse.active = false;
  }

  function injectStyles() {
    if (document.getElementById("technology-particles-styles")) return;

    const style = document.createElement("style");
    style.id = "technology-particles-styles";
    style.textContent = `
      .tech-background {
        overflow: hidden;
        background: #000;
      }

      .technology-particles-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        z-index: 0;
        pointer-events: none;
      }

      .tech-background > .progress-bar {
        z-index: 2;
      }

      .tech-intro,
      .tech-part1,
      .tech-part2 {
        position: relative;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", updatePhaseFromScroll, { passive: true });
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("mouseleave", onMouseLeave, { passive: true });

  injectStyles();
  resize();
  updatePhaseFromScroll();
  requestAnimationFrame(animate);
})();
