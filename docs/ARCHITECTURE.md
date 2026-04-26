# Architecture — MermaidXP

## Overview

MermaidXP is a React SPA that renders Mermaid diagrams interactively. It loads Mermaid from CDN, uses Redux for state, Firebase for auth, and deploys as a Cloudflare Worker.

## Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19, Tailwind CSS 4 |
| State | Redux Toolkit (slices: diagram, canvas, ui, historyEngine, canvasElements) |
| Auth | Firebase Auth (Google sign-in) |
| Diagrams | Mermaid 10.9.3 (CDN with SRI) |
| Export | jsPDF (lazy), Canvas API |
| Build | Vite 6, TypeScript 5.7 |
| Deploy | Cloudflare Workers |

## Directory Structure

```text
src/
├── components/
│   ├── layout/        # Header (export menu), main layout
│   ├── canvas/        # DiagramDisplay, ToolbarImproved, SheetsView, MainCanvas
│   ├── editor/        # CodeEditor, DiagramSamples (lazy)
│   ├── header/        # FileOperations (.mmd/.md parsing)
│   ├── auth/          # LoginModal, UserMenu
│   └── common/        # Reusable UI components
├── store/
│   ├── slices/        # diagramSlice, canvasSlice, uiSlice, historyEngineSlice
│   └── middleware/    # persistMiddleware, historyEngineMiddleware
├── services/          # mermaidService, exportService, lazyMermaidLoader
├── utils/             # logger, mdParser, helpers
├── features/canvas/   # Transform utils, resize, toolbar drag
├── hooks/             # useHistoryEngine, useUndoRedoSafe
├── contexts/          # AuthContext (Firebase)
└── types/             # TypeScript interfaces
```

## Data Flow

```text
User input → CodeEditor → diagramSlice.setMermaidCode
  → mermaidService.render() → DiagramDisplay (SVG in DOM)
  → persistMiddleware → localStorage (code, theme, zoom, pan, interactionMode)

App start → loadPersistedState() → preloadedState → configureStore()

File open (.md) → mdParser → sheets[] → SheetsView (multi-page)
File open (.mmd) → direct mermaidCode → DiagramDisplay (single)

Export → exportService (SVG/PNG) or jsPDF (PDF, lazy loaded)
```

## Bundle Strategy

Chunks split via Vite `manualChunks`:

- `vendor` — React, Redux (~38KB)
- `firebase` — Firebase Auth (~156KB, lazy)
- `pdf` — jsPDF + html2canvas (~754KB, lazy on export)
- `purify.es` — DOMPurify (~23KB)
- `DiagramSamples` — sample diagrams (~18KB, lazy)
- `index` — app core (~358KB)

## Deployment

```bash
cp .env.source .env   # Firebase credentials
npm run build          # Vite build
wrangler deploy        # Cloudflare Workers
```

Route: `mxp.apulab.com/*` → Cloudflare Worker serves `dist/`.
