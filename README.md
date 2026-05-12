# MermaidXP — Interactive Diagram Editor

> **Transforma tus diagramas Mermaid en experiencias interactivas.**  
> Editor profesional con canvas interactivo, elementos custom, exportación multi-formato y persistencia inteligente.

[![Live Demo](https://img.shields.io/badge/Demo-mxp.apulab.com-brightgreen?style=for-the-badge&logo=cloudflare)](https://mxp.apulab.com/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Why MermaidXP?

Mermaid is the standard for text-based diagramming, but viewing Mermaid diagrams has always been a **passive experience**. MermaidXP changes that by turning static diagrams into **interactive canvases** where you can:

- **Pan, zoom, and explore** every detail of complex diagrams
- **Drag and reposition** nodes with automatic edge updates
- **Add custom elements** — text, icons, images, shapes — directly onto diagrams
- **Export to SVG, PNG, or PDF** with a single click
- **Work with multi-diagram documents** (.md files with multiple mermaid blocks)
- **Persist your work** automatically between sessions

Whether you're a developer documenting architecture, a data scientist visualizing workflows, or a product manager mapping user journeys, MermaidXP gives you **editor-grade control** over Mermaid diagrams without leaving the browser.

---

## Core Features

### Editor & Preview
- **CodeMirror 6** editor with Mermaid syntax highlighting, search/replace, and auto-complete
- **Live preview** updates as you type — no save button needed
- **23 built-in examples** to jumpstart your diagrams
- Supports all diagram types: flowchart, sequence, class, state, ER, Gantt, pie, gitgraph, journey, C4, and more

### Interactive Canvas
- **Pan mode**: Move the entire diagram from any point — fluid and precise
- **Drag mode**: Reposition individual nodes with automatic edge re-routing
- **Zoom controls**: In/Out/Reset with smooth animations and mouse wheel support
- **Fit-to-screen**: Automatically center and scale any diagram

### Custom Element Placement
- Add **text labels**, **icons**, **images**, and **SVG shapes** directly onto diagrams
- **Drag, resize, rotate** any placed element
- **Unified resize system** with proportional scaling
- **Copy/paste, bring to front/send to back** for layer management
- **Style editor**: color, font, opacity, background

### Multi-Diagram Documents
- Open `.md` files with multiple mermaid code blocks
- Navigate sheets with keyboard arrows or thumbnails
- **Auto fit-to-screen** per diagram
- Export all pages as a **single PDF**

### Export & Sharing
- **SVG export**: Perfect vector quality
- **PNG export**: High-resolution raster (configurable scale)
- **PDF export**: Single-page or multi-page with smart page sizing
- **Smart page orientation**: Landscape/portrait per diagram aspect ratio
- **Export progress tracking** with concurrency guard

### Persistence & Reliability
- **Automatic save** to localStorage: code, theme, zoom, pan, interaction mode
- **Canvas elements persistence**: text, icons, shapes survive page refresh
- **500KB budget** with smart image size management
- **Intelligent coalescing**: debounced history engine with dedup

### Authentication & Cloud
- **Firebase Auth** with Google sign-in
- **Cloudflare Workers** deployment — global CDN, 200+ locations
- **Docker support** for self-hosted deployments
- Zero downtime deployments

---

## Tech Stack

```
Frontend:     React 19 · TypeScript 5.7 · Tailwind CSS 4 · CodeMirror 6
State:        Redux Toolkit 2.8 · Custom middleware · Persisted state
Diagrams:     Mermaid.js 10.9 (CDN with SRI) · Custom SVG transforms
Export:       jsPDF 4.2 · Canvas API · SVG rasterization
Auth:         Firebase Auth (Google provider)
Build:        Vite 6 · esbuild minifier · Manual chunking
Deploy:       Cloudflare Workers · Docker (multi-stage nginx)
Testing:      Vitest 4 · Testing Library · jsdom · 270+ tests
```

---

## Quick Start

```bash
# Clone & install
git clone <repo-url>
cd mermaidxp
npm install

# Development (port 3000)
npm run dev

# Build for production
npm run build
npm run preview

# Deploy to Cloudflare
npm run deploy

# Or build Docker image
docker build -t mermaidxp .
docker run -p 8080:80 mermaidxp
```

---

## Project Structure

```
src/
├── components/          # React components
│   ├── canvas/          # DiagramDisplay, MainCanvas, SheetsView, Toolbar
│   ├── layout/          # Header, Sidebar
│   ├── editor/          # CodeMirror editor
│   ├── auth/            # Firebase auth UI
│   └── common/          # ErrorBoundary, NotificationContainer
├── store/               # Redux store & middleware
│   ├── slices/          # diagram, canvas, ui, canvasElements, historyEngine
│   └── middleware/      # persist, historyEngine, dirtyTracker
├── features/            # Domain-specific logic
│   ├── canvas/          # SVG transforms, resize, edge cache, node extraction
│   ├── diagram/         # Mermaid renderer (optimized)
│   └── export/          # Export controller & hooks
├── services/            # External integrations
│   ├── mermaidService   # Mermaid render lifecycle
│   ├── exportService    # SVG/PNG/PDF generation
│   ├── validationService # Code validation
│   └── lazyMermaidLoader # CDN loading with SRI
├── hooks/               # Shared React hooks
├── constants/           # SVG shapes, demos, UI config
├── types/               # TypeScript type definitions
├── utils/               # Geometry, SVG generators, MD parser, logger
└── config/              # Firebase initialization
```

---

## Architecture Overview

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  CodeMirror  │───▶│  Redux Store │───▶│  Mermaid.js │───▶ SVG
│   Editor     │    │  (5 slices)  │    │  (CDN/SRI)  │
└──────────────┘    └──────┬───────┘    └──────────────┘
                           │
                    ┌──────▼───────┐    ┌──────────────┐
                    │  Middleware   │───▶│  localStorage │
                    │ (persist,    │    │  (auto-save)  │
                    │  history,    │    └──────────────┘
                    │  dirtyTrack) │
                    └──────────────┘
┌──────────────┐    ┌──────────────┐
│  Firebase    │◀───│  Export      │───▶ SVG/PNG/PDF
│  Auth        │    │  Service     │
└──────────────┘    └──────────────┘
```

---

## Use Cases

| Role | Use Case | Benefit |
|------|----------|---------|
| **Developer** | Document API flows, architecture diagrams | Interactive exploration, export to docs |
| **Data Scientist** | Visualize ML pipelines, data workflows | Custom annotations on diagrams |
| **Product Manager** | Map user journeys, feature flows | Presentation-ready exports |
| **DevOps** | Infrastructure diagrams, deployment flows | Version-controlled diagrams |
| **Consultant** | Client deliverables, process documentation | Professional PDF output |

---

## Performance

| Metric | Value |
|--------|-------|
| Bundle size (critical) | ~38KB vendor + ~358KB app |
| Firebase (lazy) | ~156KB |
| jsPDF (lazy) | ~754KB |
| Mermaid.js (CDN) | ~500KB with SRI |
| Initial load (cached) | <1.5s |
| State persistence | Debounced 500ms |
| History engine | 100 snapshots max |
| Canvas elements | 500KB localStorage budget |

---

## Development

```bash
npm run dev          # Dev server (HMR, port 3000)
npm run build        # Production build
npm run lint         # ESLint (React + TypeScript rules)
npm run format       # Prettier formatting
npm test             # Vitest: 270+ tests
npm run validate     # Pre-build validation
npm run deploy       # Cloudflare Workers
```

### Code Quality

- **TypeScript strict mode** with `noUnusedLocals`, `noUnusedParameters`
- **ESLint** with React, TypeScript, Prettier plugins
- **Prettier** automatic formatting
- **270+ tests** covering store slices, services, hooks, utils
- **Conventional Commits**: `<type>(<scope>): <subject> (#issue)`

---

## Deployment

### Cloudflare Workers (Primary)

```bash
cp .env.example .env    # Configure Firebase credentials
npm run deploy           # Build + deploy to Cloudflare
```

### Docker (Alternative)

```bash
docker build -t mermaidxp .
docker run -p 8080:80 mermaidxp
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) and [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed guides.

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture and data flow |
| [STANDARDS.md](./docs/STANDARDS.md) | Coding standards and conventions |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment configuration guide |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Firebase setup instructions |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |
| [PITCH.md](./docs/PITCH.md) | Project overview and business case |

---

## Roadmap

- [x] Core editor with live preview
- [x] Interactive canvas (pan, zoom, drag)
- [x] Custom element placement (text, icons, images, shapes)
- [x] Multi-diagram documents (.md files)
- [x] Export: SVG, PNG, PDF (single + multi-page)
- [x] State persistence (localStorage)
- [x] Firebase authentication
- [x] Cloudflare deployment
- [x] Docker support
- [ ] Undo/redo unification (eliminating dual systems)
- [ ] Multi-element selection and batch operations
- [ ] Advanced shape library
- [ ] i18n support
- [ ] Mobile-responsive editor
- [ ] Collaborative editing (real-time)

---

## Known Limitations

| Limitation | Status |
|-----------|--------|
| Undo/redo: dual systems need unification | Tracked in issues |
| Multi-selection not yet supported | Planned |
| Advanced shape library: basic shapes only | Planned |
| Mobile editor: limited usability | Backlog |
| i18n: English only | Backlog |

---

## License

MIT License — see [LICENSE](LICENSE).

---

## Acknowledgments

- [Mermaid.js](https://mermaid.js.org/) — The diagramming engine
- [CodeMirror](https://codemirror.net/) — Code editor
- [React](https://reactjs.org/), [Redux Toolkit](https://redux-toolkit.js.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/), [Firebase](https://firebase.google.com/)
- [jsPDF](https://github.com/parallax/jsPDF) — PDF generation

---

<p align="center">
  <strong>Try it live:</strong> <a href="https://mxp.apulab.com/">mxp.apulab.com</a>
  <br>
  <sub>No installation required. Works in any modern browser.</sub>
</p>
