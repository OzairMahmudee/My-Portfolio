(() => {
  const canvas = document.getElementById("vortex-canvas");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const TAU = Math.PI * 2;
  const rand = (n) => n * Math.random();
  const randRange = (n) => n - rand(2 * n);
  const fadeInOut = (t, m) => {
    const hm = 0.5 * m;
    return Math.abs(((t + hm) % m) - hm) / hm;
  };
  const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;

  const particleCount = 700;
  const rangeY = 120;
  const baseHue = 220;
  const baseSpeed = 0.25;
  const rangeSpeed = 1.35;
  const baseRadius = 0.8;
  const rangeRadius = 1.9;
  const particlePropCount = 9;
  const particlePropsLength = particleCount * particlePropCount;

  let particleProps = new Float32Array(particlePropsLength);
  let animationId = 0;
  let tick = 0;
  let width = 0;
  let height = 0;
  let centerY = 0;

  const baseTTL = 50;
  const rangeTTL = 150;
  const rangeHue = 100;
  const noiseSteps = 3;
  const xOff = 0.00125;
  const yOff = 0.00125;
  const zOff = 0.0005;

  function noise3D(x, y, z) {
    const v =
      Math.sin(x * 1.7 + z * 0.9) +
      Math.sin(y * 2.3 - z * 1.1) +
      Math.sin((x + y) * 1.15 + z * 0.7);
    return v / 3;
  }

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = width;
    canvas.height = height;
    _centerX = width * 0.5
    centerY = height * 0.5;
  }

  function initParticle(i) {
    const x = rand(width);
    const y = centerY + randRange(rangeY);
    const vx = 0;
    const vy = 0;
    const life = 0;
    const ttl = baseTTL + rand(rangeTTL);
    const speed = baseSpeed + rand(rangeSpeed);
    const radius = baseRadius + rand(rangeRadius);
    const hue = baseHue + rand(rangeHue);
    particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
  }

  function initParticles() {
    tick = 0;
    particleProps = new Float32Array(particlePropsLength);
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      initParticle(i);
    }
  }

  function drawParticle(x, y, x2, y2, life, ttl, radius, hue) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = radius;
    ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl) * 0.55})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function updateParticle(i) {
    const x = particleProps[i];
    const y = particleProps[i + 1];
    const n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
    const vx = lerp(particleProps[i + 2], Math.cos(n), 0.5);
    const vy = lerp(particleProps[i + 3], Math.sin(n), 0.5);
    let life = particleProps[i + 4];
    const ttl = particleProps[i + 5];
    const speed = particleProps[i + 6];
    const radius = particleProps[i + 7];
    const hue = particleProps[i + 8];

    const x2 = x + vx * speed;
    const y2 = y + vy * speed;

    drawParticle(x, y, x2, y2, life, ttl, radius, hue);

    life++;
    particleProps[i] = x2;
    particleProps[i + 1] = y2;
    particleProps[i + 2] = vx;
    particleProps[i + 3] = vy;
    particleProps[i + 4] = life;

    const outOfBounds = x2 > width || x2 < 0 || y2 > height || y2 < 0;
    if (outOfBounds || life > ttl) initParticle(i);
  }

  function renderGlow() {
    ctx.save();
    ctx.filter = "blur(8px) brightness(180%)";
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.filter = "blur(4px) brightness(160%)";
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }

  function draw() {
    tick++;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      updateParticle(i);
    }

    renderGlow();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();

    animationId = requestAnimationFrame(draw);
  }

  resize();
  initParticles();
  draw();

  const resizeObserver = new ResizeObserver(() => {
    resize();
    initParticles();
  });
  resizeObserver.observe(hero);

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(animationId);
    resizeObserver.disconnect();
  });
})();
