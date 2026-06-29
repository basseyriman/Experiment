"use strict";

/* ================================================
   RimansTech Industries — main.js
   ================================================ */

// ── THEME TOGGLE ──────────────────────────────────
(function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem('rt_theme');
  // Respect stored preference, else check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  if (theme === 'light') root.setAttribute('data-theme', 'light');
})();

function toggleTheme() {
  const root = document.documentElement;
  const isLight = root.getAttribute('data-theme') === 'light';
  const next = isLight ? 'dark' : 'light';
  if (next === 'dark') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', 'light');
  }
  localStorage.setItem('rt_theme', next);
  showToast(next === 'light' ? '☀️ Light mode on' : '🌙 Dark mode on', 'info');
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.addEventListener('click', toggleTheme);
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('rt_theme')) {
    if (!e.matches) document.documentElement.setAttribute('data-theme','light');
    else document.documentElement.removeAttribute('data-theme');
  }
});

// ── NAV SCROLL ──────────────────────────────────
const nav = document.getElementById('nav');
const backTop = document.getElementById('backTop');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
  backTop.classList.toggle('show', y > 400);
  updateActiveNav();
}, { passive: true });

backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── MOBILE MENU ─────────────────────────────────
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

burger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  burger.querySelectorAll('span')[0].style.transform = menuOpen ? 'rotate(45deg) translate(5px,5px)' : '';
  burger.querySelectorAll('span')[1].style.opacity = menuOpen ? '0' : '1';
  burger.querySelectorAll('span')[2].style.transform = menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
});

document.querySelectorAll('.mob-link').forEach(l => {
  l.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
  });
});

// ── ACTIVE NAV LINK ─────────────────────────────
function updateActiveNav() {
  const sections = ['hero','services','work','process','pricing','testimonials','contact'];
  let current = 'hero';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.getBoundingClientRect().top <= 100) current = id;
  });
  document.querySelectorAll('.nav-a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === `#${current}`);
  });
}

// ── HERO CANVAS BACKGROUND ───────────────────────
(function initHeroCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  const nodes = [];
  const NODE_COUNT = 60;
  let animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createNodes() {
    nodes.length = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r:  Math.random() * 2 + 0.8,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Move nodes
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const alpha = (1 - dist / 160) * 0.12;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139,92,246,0.25)';
      ctx.fill();
    });

    // Subtle gradient blobs
    [[W * 0.15, H * 0.3, 250, 'rgba(124,58,237,0.06)'],
     [W * 0.85, H * 0.6, 300, 'rgba(59,130,246,0.04)'],
     [W * 0.5,  H * 0.8, 200, 'rgba(6,182,212,0.04)']
    ].forEach(([x, y, r, c]) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, c);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  const resizeObserver = new ResizeObserver(() => { resize(); createNodes(); });
  resizeObserver.observe(canvas.parentElement);

  resize();
  createNodes();
  draw();
})();

// ── SCROLL REVEAL ───────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = `${i * 0.07}s`;
      e.target.classList.add('revealed');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ── ANIMATED COUNTERS ───────────────────────────
function animateCount(el, target, suffix = '', duration = 1800) {
  const start = performance.now();
  const isFloat = String(target).includes('.');
  const update = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = isFloat ? (target * ease).toFixed(1) : Math.round(target * ease);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// Trigger counters when stat floats become visible
const statObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    statObs.unobserve(e.target);
    // The stat-float elements in hero animate in via CSS
  });
});
document.querySelectorAll('.stat-float').forEach(s => statObs.observe(s));

// ── MARQUEE PAUSE ON HOVER ──────────────────────
const marqueeInner = document.getElementById('marqueeInner');
if (marqueeInner) {
  marqueeInner.addEventListener('mouseenter', () => marqueeInner.style.animationPlayState = 'paused');
  marqueeInner.addEventListener('mouseleave', () => marqueeInner.style.animationPlayState = 'running');
}

// ── CHART BAR ANIMATION ─────────────────────────
const chartObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    chartObs.unobserve(e.target);
    const bars = e.target.querySelectorAll('.chart-bar');
    const targets = ['60%','85%','45%','95%','70%','55%'];
    bars.forEach((bar, i) => {
      bar.style.height = '4px';
      setTimeout(() => {
        bar.style.transition = `height 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.08}s`;
        bar.style.height = targets[i] || '50%';
      }, 300);
    });
  });
}, { threshold: 0.4 });

document.querySelectorAll('.mock-chart').forEach(c => chartObs.observe(c));

// ── CONTACT FORM ────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fname   = document.getElementById('fname')?.value.trim();
    const lname   = document.getElementById('lname')?.value.trim();
    const email   = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    if (!fname || !email || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const btn = document.getElementById('submitBtn');
    const txt = document.getElementById('submitText');
    const spin = document.getElementById('submitSpinner');

    btn.disabled = true;
    txt.style.display = 'none';
    spin.style.display = 'block';

    // Simulate sending (replace with real endpoint)
    setTimeout(() => {
      btn.disabled = false;
      txt.style.display = 'block';
      spin.style.display = 'none';
      txt.textContent = '✓ Enquiry Sent!';
      contactForm.reset();
      showToast(`Thanks ${fname}! We'll be in touch within 24 hours.`, 'success');
      setTimeout(() => { txt.textContent = 'Send Enquiry →'; }, 4000);
    }, 1800);
  });

  // Real-time validation feedback
  const inputs = contactForm.querySelectorAll('.form-input[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      const valid = input.value.trim().length > 0;
      input.style.borderColor = valid ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)';
    });
    input.addEventListener('focus', () => {
      input.style.borderColor = '';
    });
  });
}

// ── SMOOTH SCROLL ALL ANCHORS ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── TOAST NOTIFICATION ──────────────────────────
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── PRICING: highlight on hover ─────────────────
document.querySelectorAll('.price-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    document.querySelectorAll('.price-card:not(.price-featured)').forEach(c => {
      if (c !== card) c.style.opacity = '0.65';
    });
  });
  card.addEventListener('mouseleave', () => {
    document.querySelectorAll('.price-card').forEach(c => { c.style.opacity = ''; });
  });
});

// ── HERO ARTICLE COUNTER (localStorage) ─────────
(function() {
  const key = 'rt_visits';
  const count = (parseInt(localStorage.getItem(key) || '0')) + 1;
  localStorage.setItem(key, count);
})();


// ── CONSOLE BRANDING ────────────────────────────
console.log(
  '%c  RimansTech Industries  ',
  'background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; font-size: 18px; font-weight: 800; padding: 8px 16px; border-radius: 8px;'
);
console.log('%cPremium Tech Agency — hello@rimanstech.io', 'color: #6b7280; font-size: 12px; padding: 4px;');
