# ⬡ NEXUS — Experiment Lab by RimanTech

> **A premium interactive web experiment lab.** Built with cutting-edge CSS, Canvas 2D, and vanilla JavaScript. No frameworks. Pure performance.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-a78bfa?style=flat-square)](https://basseyriman.github.io/Experiment)
[![GitHub](https://img.shields.io/badge/Source-GitHub-60a5fa?style=flat-square)](https://github.com/basseyriman/Experiment)
[![License: MIT](https://img.shields.io/badge/License-MIT-34d399?style=flat-square)](LICENSE)

---

## ✨ What Is NEXUS?

NEXUS is a **premium, dark-mode interactive web application** that serves as an experiment lab for cutting-edge web technology demonstrations. It features particle physics, real math-based simulations, generative art, and stunning visual effects — all running natively in your browser.

---

## 🗂️ Pages

| Page | Description |
|---|---|
| [`index.html`](index.html) | Main landing page — hero, experiment cards, interactive visualizer, stats, contact |
| [`experiments.html`](experiments.html) | Full catalog of 12 experiments with category filter + animated previews |
| [`fluid-sim.html`](fluid-sim.html) | Real-time Navier-Stokes fluid dynamics simulator |
| [`galaxy.html`](galaxy.html) | Procedural galaxy generator with 4 types and 20K stars |
| [`genart.html`](genart.html) | Generative art studio with 6 algorithms and PNG export |

---

## 🧪 Experiment Suite

### 🌊 Fluid Dynamics Simulator
Real Navier-Stokes equations — diffusion, advection, and pressure projection computed every frame. Inject fluid by clicking and dragging. Four color themes, viscosity toggle, and turbulence injection.

### 🌌 Galaxy Generator  
Procedurally generated spiral, elliptical, barred spiral, and irregular galaxies. Four star classifications (main sequence, giant, blue dwarf, red giant) with twinkle animations. Pan and zoom navigation, up to 20,000 stars.

### 🎨 Generative Art Studio
Six art algorithms with seeded RNG for reproducible results:
- **Flow Field** — curl-noise vector fields with line traces
- **Voronoi Mosaic** — nearest-neighbor tessellation with pixel-perfect borders
- **Mandala** — parametric radial symmetry with multiple arms/layers
- **L-System Tree** — recursive botanical grammar rendering
- **Circle Packing** — greedy non-overlapping circle placement
- **Reaction Diffusion** — Gray-Scott Turing pattern model

### ⚡ Interactive Particle Visualizer
Physics-based particle system with 4 force modes (attract, repel, orbit, chaos), 4 color themes, adjustable particle count (50–500), and speed control.

---

## ✦ Design Features

- **Dark-mode only** — rich #050508 background with cosmic color palette
- **Glassmorphism** — backdrop-blur cards with subtle borders and glow
- **Custom animated cursor** — reactive glow cursor with scale on hover
- **Loading screen** — animated progress bar with system init sequence
- **Background particle network** — 80 nodes with proximity connections
- **Hero orb animation** — live Canvas 2D plasma blob in the hero section
- **Scroll reveal** — IntersectionObserver-based staggered animations
- **Animated counters** — eased number count-up on scroll into view
- **Live terminal** — auto-typing command sequence in the stats section
- **Toast notifications** — slide-up success/error toasts
- **Fully responsive** — mobile-first breakpoints at 600px, 900px, 1100px

---

## 🛠️ Tech Stack

```
HTML5          Semantic markup, SEO meta tags, Open Graph
CSS3           Custom properties, animations, glassmorphism, responsive grid
JavaScript     Canvas 2D API, IntersectionObserver, seeded RNG, requestAnimationFrame
Google Fonts   Outfit (UI) + Space Mono (code/mono elements)
```

**Zero dependencies. Zero build step. Zero frameworks.**

---

## 🚀 Getting Started

```bash
git clone https://github.com/basseyriman/Experiment.git
cd Experiment
# Open index.html in your browser
```

Or use a local server for best experience:

```bash
npx serve .
# Visit http://localhost:3000
```

---

## 📁 Project Structure

```
Experiment/
├── index.html          ← Main landing page
├── experiments.html    ← Full experiment catalog
├── fluid-sim.html      ← Navier-Stokes fluid sim
├── galaxy.html         ← Procedural galaxy generator
├── genart.html         ← Generative art studio
├── styles.css          ← Complete design system
├── app.js              ← Core interactive systems
├── _config.yml         ← GitHub Pages config
└── README.md           ← This file
```

---

## 🌐 Deploy to GitHub Pages

This repo is ready for GitHub Pages. Enable it in:
**Settings → Pages → Deploy from branch: `main` → folder: `/` (root)**

Live at: `https://basseyriman.github.io/Experiment`

---

## 📄 License

MIT © 2026 RimanTech — Built with passion, pushed to the edge.
