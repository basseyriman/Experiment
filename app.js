/* =============================================================
   NEXUS — app.js | Interactive Experiment Lab
   RimanTech © 2026
   ============================================================= */

"use strict";

// ──────────────────────────────────────────
//  GLOBALS & STATE
// ──────────────────────────────────────────
const state = {
  particleMode: 'attract',
  particleCount: 200,
  speed: 5,
  colorTheme: 'cosmic',
  vizParticles: [],
  bgParticles: [],
  mouse: { x: 0, y: 0, down: false },
  animFrame: null,
  orbFrame: null,
  bgFrame: null,
};

const THEMES = {
  cosmic: ['#a78bfa', '#60a5fa', '#22d3ee', '#c084fc'],
  fire:   ['#f97316', '#ef4444', '#fbbf24', '#fb923c'],
  matrix: ['#22c55e', '#16a34a', '#4ade80', '#86efac'],
  gold:   ['#f59e0b', '#fbbf24', '#d97706', '#fde68a'],
};

// ──────────────────────────────────────────
//  UTILITY HELPERS
// ──────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function lerp(a, b, t) { return a + (b - a) * t; }
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

function showToast(msg, type = 'info') {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ──────────────────────────────────────────
//  NAVIGATION
// ──────────────────────────────────────────
function initNav() {
  const nav = $('#nav');
  const burger = $('#navBurger');
  const mobileNav = $('#mobileNav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveNavLink();
  });

  burger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });

  $$('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileNav.classList.remove('open'));
  });

  // Smooth scroll for nav links
  $$('.nav-link, .mobile-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = $(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  $('#launchBtn').addEventListener('click', () => {
    $('#visualizer').scrollIntoView({ behavior: 'smooth' });
  });

  $('#exploreBtn').addEventListener('click', () => {
    $('#experiments').scrollIntoView({ behavior: 'smooth' });
  });

  $('#watchDemoBtn').addEventListener('click', () => {
    openModal('demo');
  });
}

function updateActiveNavLink() {
  const sections = ['hero', 'experiments', 'visualizer', 'stats', 'contact'];
  let active = 'hero';
  sections.forEach(id => {
    const el = $(`#${id}`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top <= 100) active = id;
  });
  $$('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === active);
  });
}

// ──────────────────────────────────────────
//  BACKGROUND PARTICLE CANVAS
// ──────────────────────────────────────────
function initBgParticles() {
  const canvas = $('#particle-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create particles
  for (let i = 0; i < 80; i++) {
    state.bgParticles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      vx: rand(-0.3, 0.3),
      vy: rand(-0.3, 0.3),
      r: rand(1, 3),
      alpha: rand(0.1, 0.5),
      color: THEMES.cosmic[randInt(0, 3)],
    });
  }

  function animateBg() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    state.bgParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Draw connecting lines between nearby particles
    for (let i = 0; i < state.bgParticles.length; i++) {
      for (let j = i + 1; j < state.bgParticles.length; j++) {
        const a = state.bgParticles[i];
        const b = state.bgParticles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(167,139,250,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    state.bgFrame = requestAnimationFrame(animateBg);
  }

  animateBg();
}

// ──────────────────────────────────────────
//  ORB / HERO CANVAS
// ──────────────────────────────────────────
function initOrbCanvas() {
  const canvas = $('#orb-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const points = [];
  const N = 180;
  for (let i = 0; i < N; i++) {
    points.push({
      angle: (i / N) * Math.PI * 2,
      base: rand(60, 90),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.02, 0.06),
    });
  }

  function drawOrb() {
    ctx.clearRect(0, 0, 300, 300);
    t += 0.015;

    const cx = 150, cy = 150;

    // Gradient center glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
    grad.addColorStop(0, 'rgba(167,139,250,0.25)');
    grad.addColorStop(0.5, 'rgba(96,165,250,0.1)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.fill();

    // Animated plasma blob
    ctx.beginPath();
    let first = true;
    for (let i = 0; i < N; i++) {
      const p = points[i];
      p.angle += 0.002;
      const noise = Math.sin(p.angle * 3 + t + p.phase) * 15 + Math.cos(p.angle * 2 + t * 0.7) * 10;
      const r = p.base + noise;
      const x = cx + Math.cos(p.angle) * r;
      const y = cy + Math.sin(p.angle) * r;
      if (first) { ctx.moveTo(x, y); first = false; }
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const blobGrad = ctx.createLinearGradient(cx - 100, cy - 100, cx + 100, cy + 100);
    blobGrad.addColorStop(0, 'rgba(167,139,250,0.5)');
    blobGrad.addColorStop(0.5, 'rgba(96,165,250,0.3)');
    blobGrad.addColorStop(1, 'rgba(34,211,238,0.2)');
    ctx.fillStyle = blobGrad;
    ctx.fill();

    // Inner rotating lines
    for (let i = 0; i < 6; i++) {
      const angle = t * 0.5 + (i / 6) * Math.PI * 2;
      const r1 = 20, r2 = 55;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.strokeStyle = `rgba(167,139,250,${0.3 + 0.2 * Math.sin(t + i)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    state.orbFrame = requestAnimationFrame(drawOrb);
  }

  drawOrb();
}

// ──────────────────────────────────────────
//  INTERACTIVE VISUALIZER CANVAS
// ──────────────────────────────────────────
class Particle {
  constructor(x, y, colors) {
    this.x = x;
    this.y = y;
    this.vx = rand(-3, 3);
    this.vy = rand(-3, 3);
    this.r = rand(2, 5);
    this.alpha = rand(0.6, 1);
    this.life = 1;
    this.decay = rand(0.002, 0.005);
    this.color = colors[randInt(0, colors.length - 1)];
    this.trail = [];
  }

  update(mouse, mode, speed) {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.hypot(dx, dy) || 0.01;
    const force = Math.min(100 / (dist * dist), 5) * (speed / 5);

    if (mouse.down && dist < 300) {
      if (mode === 'attract') {
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      } else if (mode === 'repel') {
        this.vx -= (dx / dist) * force * 1.5;
        this.vy -= (dy / dist) * force * 1.5;
      } else if (mode === 'orbit') {
        this.vx += (-dy / dist) * force;
        this.vy += (dx / dist) * force;
      } else if (mode === 'chaos') {
        this.vx += (Math.random() - 0.5) * force * 3;
        this.vy += (Math.random() - 0.5) * force * 3;
      }
    }

    // Friction
    this.vx *= 0.97;
    this.vy *= 0.97;

    // Speed cap
    const sp = Math.hypot(this.vx, this.vy);
    if (sp > speed * 3) {
      this.vx = (this.vx / sp) * speed * 3;
      this.vy = (this.vy / sp) * speed * 3;
    }

    // Trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 12) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  draw(ctx) {
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = this.color + '40';
      ctx.lineWidth = this.r * 0.6;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + Math.round(this.alpha * this.life * 255).toString(16).padStart(2, '0');
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  isDead(w, h) {
    return this.life <= 0 ||
      this.x < -50 || this.x > w + 50 ||
      this.y < -50 || this.y > h + 50;
  }
}

function initVisualizer() {
  const canvas = $('#visualizer-canvas');
  const overlay = $('#canvasOverlay');
  const container = canvas.parentElement;

  function resize() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const ctx = canvas.getContext('2d');

  // Spawn initial particles
  function spawnBurst(x, y, count = 20) {
    const colors = THEMES[state.colorTheme];
    for (let i = 0; i < count; i++) {
      if (state.vizParticles.length < state.particleCount) {
        state.vizParticles.push(new Particle(x, y, colors));
      }
    }
    overlay.classList.add('hidden');
  }

  // Mouse / touch events
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    state.mouse.x = e.clientX - rect.left;
    state.mouse.y = e.clientY - rect.top;
    state.mouse.down = true;
    spawnBurst(state.mouse.x, state.mouse.y);
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    state.mouse.x = e.clientX - rect.left;
    state.mouse.y = e.clientY - rect.top;
    if (state.mouse.down) {
      spawnBurst(state.mouse.x, state.mouse.y, 5);
    }
  });

  canvas.addEventListener('mouseup', () => { state.mouse.down = false; });
  canvas.addEventListener('mouseleave', () => { state.mouse.down = false; });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    state.mouse.x = touch.clientX - rect.left;
    state.mouse.y = touch.clientY - rect.top;
    state.mouse.down = true;
    spawnBurst(state.mouse.x, state.mouse.y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    state.mouse.x = touch.clientX - rect.left;
    state.mouse.y = touch.clientY - rect.top;
    spawnBurst(state.mouse.x, state.mouse.y, 5);
  }, { passive: false });

  canvas.addEventListener('touchend', () => { state.mouse.down = false; });

  // Auto-spawn ambient particles
  setInterval(() => {
    if (state.vizParticles.length < state.particleCount) {
      const x = rand(50, canvas.width - 50);
      const y = rand(50, canvas.height - 50);
      const colors = THEMES[state.colorTheme];
      for (let i = 0; i < 3; i++) {
        state.vizParticles.push(new Particle(x, y, colors));
      }
    }
  }, 200);

  function animate() {
    ctx.fillStyle = 'rgba(10,10,18,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    state.vizParticles = state.vizParticles.filter(p => !p.isDead(canvas.width, canvas.height));

    state.vizParticles.forEach(p => {
      p.update(state.mouse, state.particleMode, state.speed);
      p.draw(ctx);
    });

    // Draw mouse attractor ring when active
    if (state.mouse.down) {
      const colors = THEMES[state.colorTheme];
      ctx.beginPath();
      ctx.arc(state.mouse.x, state.mouse.y, 30, 0, Math.PI * 2);
      ctx.strokeStyle = colors[0] + '60';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(state.mouse.x, state.mouse.y, 60, 0, Math.PI * 2);
      ctx.strokeStyle = colors[0] + '20';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    state.animFrame = requestAnimationFrame(animate);
  }

  animate();
}

function initVisualizerControls() {
  // Mode buttons
  $$('.ctrl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.ctrl-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.particleMode = btn.dataset.mode;
      showToast(`Mode: ${btn.dataset.mode.charAt(0).toUpperCase() + btn.dataset.mode.slice(1)}`, 'info');
    });
  });

  // Particle count slider
  const pSlider = $('#particleSlider');
  const pCount = $('#particleCount');
  pSlider.addEventListener('input', () => {
    state.particleCount = +pSlider.value;
    pCount.textContent = pSlider.value;
  });

  // Speed slider
  const sSlider = $('#speedSlider');
  const sVal = $('#speedVal');
  sSlider.addEventListener('input', () => {
    state.speed = +sSlider.value;
    sVal.textContent = sSlider.value;
  });

  // Color swatches
  $$('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      $$('.swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      state.colorTheme = sw.dataset.color;
      // Update bg particles
      state.bgParticles.forEach(p => {
        p.color = THEMES[state.colorTheme][randInt(0, 3)];
      });
    });
  });

  // Clear
  $('#clearBtn').addEventListener('click', () => {
    state.vizParticles = [];
    const canvas = $('#visualizer-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showToast('Canvas cleared', 'info');
    $('#canvasOverlay').classList.remove('hidden');
  });
}

// ──────────────────────────────────────────
//  COUNTER ANIMATIONS
// ──────────────────────────────────────────
function animateCounter(el, target, duration = 1800, suffix = '') {
  const start = performance.now();
  const isFloat = target % 1 !== 0;
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = isFloat ? (target * ease).toFixed(2) : Math.round(target * ease);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ──────────────────────────────────────────
//  INTERSECTION OBSERVER — Reveal & Counters
// ──────────────────────────────────────────
function initReveal() {
  // Reveal on scroll
  const reveals = $$('.exp-card, .stat-card, .terminal, .contact-form');
  reveals.forEach(el => el.classList.add('reveal'));

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => revealObs.observe(el));

  // Hero counters
  const heroMetrics = $$('.metric-value');
  const heroObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        heroMetrics.forEach(el => {
          animateCounter(el, +el.dataset.target, 1500);
        });
        heroObs.disconnect();
      }
    });
  }, { threshold: 0.5 });
  const metricsEl = $('.hero-metrics');
  if (metricsEl) heroObs.observe(metricsEl);

  // Stat counters
  const statValues = $$('.stat-value');
  const statBars = $$('.stat-bar-fill');
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        statValues.forEach(el => {
          const target = +el.dataset.target;
          const isFloat = target % 1 !== 0;
          animateCounter(el, target, 2000);
        });
        setTimeout(() => {
          statBars.forEach(bar => bar.classList.add('animated'));
        }, 300);
        statObs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  const statsGrid = $('.stats-grid');
  if (statsGrid) statObs.observe(statsGrid);
}

// ──────────────────────────────────────────
//  TERMINAL AUTO-TYPE
// ──────────────────────────────────────────
function initTerminal() {
  const body = $('#terminalBody');
  if (!body) return;

  const commands = [
    { type: 'cmd', text: 'nexus run --experiment=neural --fps=60' },
    { type: 'out', text: '↳ Loading neural weights...' },
    { type: 'out', text: '↳ Spawning 2048 particles...' },
    { type: 'out', text: '↳ Render pipeline: WebGL2 ✓' },
    { type: 'cmd', text: 'nexus stats --live' },
    { type: 'out', text: 'CPU: 12% | GPU: 67% | RAM: 420MB' },
    { type: 'out', text: 'FPS: 60 | Particles: 2048 | Ops: 2.4M/s' },
  ];

  let cmdIdx = 0;
  const lastLine = body.lastElementChild;

  function typeCommand(text, callback) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="prompt">$</span> `;
    body.insertBefore(line, lastLine);

    let i = 0;
    const span = document.createElement('span');
    line.appendChild(span);

    const interval = setInterval(() => {
      span.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(callback, 400);
      }
      body.scrollTop = body.scrollHeight;
    }, 40);
  }

  function addOutput(text, callback) {
    const line = document.createElement('div');
    line.className = 'terminal-line output';
    line.textContent = text;
    body.insertBefore(line, lastLine);
    body.scrollTop = body.scrollHeight;
    setTimeout(callback, 300);
  }

  const termObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(runCommands, 1000);
        termObs.disconnect();
      }
    });
  }, { threshold: 0.5 });

  if ($('.terminal')) termObs.observe($('.terminal'));

  function runCommands() {
    if (cmdIdx >= commands.length) return;
    const cmd = commands[cmdIdx++];

    if (cmd.type === 'cmd') {
      typeCommand(cmd.text, runCommands);
    } else {
      addOutput(cmd.text, runCommands);
    }
  }
}

// ──────────────────────────────────────────
//  EXPERIMENT CARDS
// ──────────────────────────────────────────
function initExperimentCards() {
  $$('.exp-launch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const exp = btn.dataset.exp;
      openModal(exp);
    });
  });

  $$('.exp-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const glow = card.querySelector('.exp-card-glow');
      if (glow) glow.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      const glow = card.querySelector('.exp-card-glow');
      if (glow) glow.style.opacity = '0';
    });
    // Track mouse for glow position
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const glow = card.querySelector('.exp-card-glow');
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(167,139,250,0.12) 0%, transparent 60%)`;
      }
    });
  });
}

// ──────────────────────────────────────────
//  MODAL SYSTEM
// ──────────────────────────────────────────
const EXP_DATA = {
  neural: {
    title: '🧠 Neural Particle Engine',
    desc: 'Watch particles self-organize into neural network patterns. Each node communicates via weighted connections.',
    color: '#a78bfa',
  },
  fluid: {
    title: '🌊 Fluid Dynamics Simulator',
    desc: 'Real-time Navier-Stokes fluid simulation. Drag to inject fluid and watch it flow.',
    color: '#60a5fa',
  },
  quantum: {
    title: '🔮 Quantum Wave Visualizer',
    desc: 'Visualize quantum probability clouds and wave function collapse events.',
    color: '#22d3ee',
  },
  galaxy: {
    title: '🌌 Galaxy Generator',
    desc: 'Procedural spiral galaxy with 10,000 stars, dark matter halos, and nebulae.',
    color: '#c084fc',
  },
  audio: {
    title: '🎵 Audio Spectrum Analyzer',
    desc: 'Real-time frequency domain visualization with beat detection.',
    color: '#f472b6',
  },
  genart: {
    title: '🤖 Generative Art AI',
    desc: 'Each render creates a unique piece using evolutionary color algorithms.',
    color: '#34d399',
  },
  demo: {
    title: '▶ NEXUS Demo',
    desc: 'A live demonstration of all core systems running simultaneously.',
    color: '#a78bfa',
  },
};

let modalCanvas, modalCtx, modalAnim;

function openModal(exp) {
  const overlay = $('#modalOverlay');
  const content = $('#modalContent');

  const data = EXP_DATA[exp] || { title: 'Experiment', desc: 'Loading...', color: '#a78bfa' };

  content.innerHTML = `
    <h2 style="font-size:28px;font-weight:800;margin-bottom:12px;">${data.title}</h2>
    <p style="color:var(--text-secondary);margin-bottom:16px;font-size:15px;">${data.desc}</p>
    <canvas class="modal-exp-canvas" id="modalCanvas" width="700" height="400"></canvas>
    <div style="display:flex;gap:12px;margin-top:20px;">
      <button class="btn-primary" onclick="closeModal()">✓ Got It</button>
      <button class="btn-ghost" onclick="closeModal()">Close</button>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Run experiment in modal
  setTimeout(() => {
    modalCanvas = $('#modalCanvas');
    if (modalCanvas) {
      modalCtx = modalCanvas.getContext('2d');
      runModalExperiment(exp, data.color);
    }
  }, 100);
}

function closeModal() {
  $('#modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  if (modalAnim) cancelAnimationFrame(modalAnim);
}

function runModalExperiment(exp, color) {
  if (!modalCanvas || !modalCtx) return;
  const w = modalCanvas.width, h = modalCanvas.height;
  const ctx = modalCtx;
  let t = 0;

  const particles = [];
  const N = 120;

  if (exp === 'neural' || exp === 'demo') {
    // Neural network visualization
    const nodes = Array.from({ length: 20 }, () => ({
      x: rand(60, w - 60), y: rand(40, h - 40),
      vx: rand(-0.5, 0.5), vy: rand(-0.5, 0.5),
      r: rand(4, 8),
      activation: rand(0, 1),
      phase: rand(0, Math.PI * 2),
    }));

    function drawNeural() {
      ctx.fillStyle = 'rgba(10,10,18,0.2)';
      ctx.fillRect(0, 0, w, h);
      t += 0.02;

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 140) {
            const strength = 1 - dist / 140;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `${color}${Math.round(strength * 80).toString(16).padStart(2,'0')}`;
            ctx.lineWidth = strength * 2;
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 30 || n.x > w - 30) n.vx *= -1;
        if (n.y < 30 || n.y > h - 30) n.vy *= -1;
        n.activation = 0.5 + 0.5 * Math.sin(t + n.phase);

        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.round(n.activation * 255).toString(16).padStart(2, '0');
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      modalAnim = requestAnimationFrame(drawNeural);
    }
    drawNeural();

  } else if (exp === 'galaxy') {
    // Galaxy
    const stars = Array.from({ length: 800 }, (_, i) => {
      const arm = Math.floor(Math.random() * 3);
      const dist = rand(20, Math.min(w, h) * 0.45);
      const angle = arm * (Math.PI * 2 / 3) + dist * 0.02 + rand(-0.3, 0.3);
      return {
        x: w / 2 + Math.cos(angle) * dist + rand(-20, 20),
        y: h / 2 + Math.sin(angle) * dist * 0.5 + rand(-10, 10),
        r: rand(0.5, 2.5),
        alpha: rand(0.3, 1),
        color: ['#fff', '#a78bfa', '#60a5fa', '#fbbf24'][randInt(0, 3)],
      };
    });

    let rot = 0;
    function drawGalaxy() {
      ctx.fillStyle = 'rgba(10,10,18,0.05)';
      ctx.fillRect(0, 0, w, h);
      rot += 0.001;

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(rot);
      ctx.translate(-w / 2, -h / 2);

      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color + Math.round(s.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      ctx.restore();

      modalAnim = requestAnimationFrame(drawGalaxy);
    }
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, w, h);
    drawGalaxy();

  } else if (exp === 'quantum') {
    // Quantum waves
    let collapse = false;
    let collapseX = 0, collapseY = 0;
    modalCanvas.addEventListener('click', (e) => {
      const rect = modalCanvas.getBoundingClientRect();
      collapse = true;
      collapseX = (e.clientX - rect.left) * (w / rect.width);
      collapseY = (e.clientY - rect.top) * (h / rect.height);
      setTimeout(() => { collapse = false; }, 1000);
    });

    function drawQuantum() {
      ctx.fillStyle = 'rgba(10,10,18,0.3)';
      ctx.fillRect(0, 0, w, h);
      t += 0.03;

      for (let x = 0; x < w; x += 8) {
        for (let y = 0; y < h; y += 8) {
          const wave1 = Math.sin((x / 40) + t) * Math.cos((y / 40) + t * 0.7);
          const wave2 = Math.sin((x / 60) - t * 0.5) * Math.sin((y / 30) + t);
          const prob = (wave1 + wave2 + 2) / 4;

          let alpha = prob * 0.8;
          if (collapse) {
            const dist = Math.hypot(x - collapseX, y - collapseY);
            alpha = dist < 80 ? 0.9 : 0;
          }

          ctx.fillStyle = `rgba(34,211,238,${alpha * 0.6})`;
          ctx.fillRect(x, y, 6, 6);
        }
      }

      modalAnim = requestAnimationFrame(drawQuantum);
    }
    drawQuantum();

  } else {
    // Generic particle burst
    const pars = Array.from({ length: 150 }, () => ({
      x: rand(0, w), y: rand(0, h),
      vx: rand(-1, 1), vy: rand(-1, 1),
      r: rand(1, 4),
      color: THEMES[state.colorTheme][randInt(0, 3)],
      alpha: rand(0.3, 1),
    }));

    function drawGeneric() {
      ctx.fillStyle = 'rgba(10,10,18,0.15)';
      ctx.fillRect(0, 0, w, h);
      t += 0.01;

      pars.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      modalAnim = requestAnimationFrame(drawGeneric);
    }
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, w, h);
    drawGeneric();
  }
}

// ──────────────────────────────────────────
//  CONTACT FORM
// ──────────────────────────────────────────
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#nameInput').value.trim();
    const email = $('#emailInput').value.trim();
    const message = $('#messageInput').value.trim();

    if (!name || !email) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Simulate sending
    const btn = form.querySelector('.btn-primary');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Message Sent!';
      form.reset();
      showToast(`Thanks ${name}! We'll be in touch at ${email} 🚀`, 'success');
      setTimeout(() => {
        btn.textContent = 'Send Message ↗';
        btn.disabled = false;
      }, 3000);
    }, 1500);
  });
}

// ──────────────────────────────────────────
//  MODAL CLOSE HANDLERS
// ──────────────────────────────────────────
function initModal() {
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalOverlay').addEventListener('click', (e) => {
    if (e.target === $('#modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ──────────────────────────────────────────
//  CURSOR EFFECT (desktop)
// ──────────────────────────────────────────
function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 8px; height: 8px; border-radius: 50%;
    background: #a78bfa; mix-blend-mode: screen;
    transition: transform 0.15s ease, opacity 0.15s ease;
    top: 0; left: 0;
  `;
  const cursorRing = document.createElement('div');
  cursorRing.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9998;
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid rgba(167,139,250,0.4);
    top: 0; left: 0;
    transition: transform 0.4s ease, opacity 0.4s ease;
  `;
  document.body.appendChild(cursor);
  document.body.appendChild(cursorRing);

  let cx = 0, cy = 0;

  document.addEventListener('mousemove', (e) => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.transform = `translate(${cx - 4}px, ${cy - 4}px)`;
    cursorRing.style.transform = `translate(${cx - 16}px, ${cy - 16}px)`;
  });

  document.addEventListener('mousedown', () => {
    cursor.style.transform += ' scale(0.6)';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.transform = cursor.style.transform.replace(' scale(0.6)', '');
  });

  // Scale on interactive elements
  $$('button, a, .exp-card, .swatch').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.style.transform = `translate(${cx - 16}px, ${cy - 16}px) scale(2)`;
      cursorRing.style.borderColor = 'rgba(167,139,250,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.style.transform = `translate(${cx - 16}px, ${cy - 16}px) scale(1)`;
      cursorRing.style.borderColor = 'rgba(167,139,250,0.4)';
    });
  });
}

// ──────────────────────────────────────────
//  LOADING SCREEN
// ──────────────────────────────────────────
function initLoadingScreen() {
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.style.cssText = `
    position: fixed; inset: 0; z-index: 1000;
    background: #050508;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 24px;
    transition: opacity 0.5s ease;
  `;
  loader.innerHTML = `
    <div style="font-size:48px;animation:pulse-logo 1s ease-in-out infinite;background:linear-gradient(135deg,#a78bfa,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">⬡</div>
    <div style="font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;letter-spacing:8px;color:#f1f5f9;">NEXUS</div>
    <div style="width:200px;height:2px;background:rgba(255,255,255,0.08);border-radius:1px;overflow:hidden;">
      <div id="loader-bar" style="height:100%;background:linear-gradient(90deg,#a78bfa,#60a5fa);width:0%;transition:width 0.05s linear;border-radius:1px;"></div>
    </div>
    <div style="font-family:'Space Mono',monospace;font-size:11px;color:#475569;letter-spacing:2px;" id="loader-text">INITIALIZING...</div>
  `;
  document.body.prepend(loader);

  const bar = loader.querySelector('#loader-bar');
  const text = loader.querySelector('#loader-text');
  const steps = ['LOADING ASSETS', 'INIT PARTICLE ENGINE', 'MOUNTING SYSTEMS', 'READY'];
  let progress = 0;

  const interval = setInterval(() => {
    progress += rand(2, 6);
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      text.textContent = 'READY';
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }, 300);
    }
    bar.style.width = progress + '%';
    const stepIdx = Math.min(Math.floor(progress / 25), steps.length - 1);
    text.textContent = steps[stepIdx];
  }, 50);
}

// ──────────────────────────────────────────
//  INIT ALL
// ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initNav();
  initBgParticles();
  initOrbCanvas();
  initVisualizer();
  initVisualizerControls();
  initExperimentCards();
  initReveal();
  initTerminal();
  initContactForm();
  initModal();
  initCursor();

  // Stagger card animations
  $$('.exp-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.05}s`;
  });

  console.log('%c⬡ NEXUS by RimanTech', 'font-size:24px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#60a5fa);-webkit-background-clip:text;color:transparent;');
  console.log('%cPremium Experiment Lab | v2.0', 'color:#94a3b8;font-size:14px;');
});
