# Changelog

All notable changes to MermaidXP are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-05-12

### Added
- Multi-diagram markdown (.md) support with sheets navigation
- Auto fit-to-screen for each sheet view
- Custom elements: shapes, icons, text, images with drag-and-drop
- PDF/PNG/SVG export (single and multi-page)
- Firebase authentication (Google provider)
- Dark/light theme toggle
- Keyboard shortcuts (undo/redo, zoom, navigation)
- Presentation mode
- CodeMirror syntax highlighting in editor
- Grid overlay option
- Export progress indicator
- 293 tests covering core modules

### Changed
- Unified undo/redo system (single history engine, removed legacy dual system)
- State persistence uses spread of initialState (prevents crashes on new fields)
- History restore is now synchronous (eliminates race condition)
- Extracted duplicated shape utilities to shared module
- All comments translated to English

### Removed
- Legacy history system from diagramSlice (history[], historyIndex, undo, redo)
- Dead code: 8 unused files (historySlice, useExport, useDebounce, unifiedResize, etc.)
- Gemini API key define from vite.config.ts (security footgun)
- Vestigial interactionMode from uiSlice

### Security
- Removed client-side API key exposure mechanism from build config
- wrangler.jsonc properly gitignored (never committed)

### Fixed
- App crash on load when localStorage missing sheets/notification fields
- Zoom not working in markdown sheets mode
- Fit-to-screen in both normal and sheets mode
- Icon disappearance during drag operations
- Click-to-place blocked in pan mode
- Text placement wrong coordinates (getScreenCTM fix)

## [0.5.0] - 2026-03-30

### Added
- Initial release
- Mermaid diagram rendering and editing
- Basic export functionality
- Cloudflare Workers deployment
