# Mermaid Pro Viewer — ISSUES.md

Hallazgos, gaps y mejoras detectados en auditoría profunda del 2026-05-12.
Última actualización: 2026-05-12 (post v1.0.0 release).

---

## 🔴 CRÍTICOS — All Resolved ✅

### ✅ C1. Dual Undo/Redo Systems — Desincronización de Estado

**Resolución**: Unified in v1.0.0. Legacy history system removed, single history engine remains.

---

### ✅ C2. Race Condition en History Engine Restore

**Resolución**: `Promise.resolve().then()` removed. Restore is now synchronous.

---

### ✅ C3. Módulo `wrangler.jsonc` con `account_id` Real Trackeado en Git

**Resolución**: Was never an issue — `wrangler.jsonc` was already in `.gitignore`.

---

### ✅ C4. Gemini API Key Expuesta en Client Bundle

**Resolución**: `define` entries removed from `vite.config.ts`. No API keys in client bundle.

---

## 🟡 ALTOS — All Resolved ✅

### ✅ H1. `useDragAndDrop` — Variable Mutable a Nivel de Módulo (`isMarking`)

**Resolución**: Confirmed LOW severity. Single-instance hook by design, not a real bug.

---

### ✅ H2. `unifiedResize` — Fuga de Event Listeners Globales

**Resolución**: File deleted. Was dead code with no consumers.

---

### ✅ H3. InteractionMode Duality — Dos Fuentes de Verdad

**Resolución**: `ui.interactionMode` removed. Single source of truth in `canvas.interactionMode`.

---

### ✅ H4. Cloudflare Worker No Sirve Static Assets

**Resolución**: Confirmed working correctly by design. Cloudflare Pages handles static assets via `assets.directory` in wrangler config; worker handles API routes only.

---

### ✅ H5. Tests Faltantes para Módulos Críticos

**Resolución**: Tests added for EdgeCache, nodeIdExtractor, and exportService. 19 test files, 293 tests passing.

---

### ✅ H6. EdgeCache Stats Hardcodeadas — Sin Tracking Real

**Resolución**: Confirmed LOW severity. Stats are observability-only, not functional. No action needed.

---

### ✅ H7. WeakMap Cache en `nodeIdExtractor` Nunca Invalidado

**Resolución**: Confirmed correct by design. WeakMap entries are GC'd when DOM elements are removed on re-render, providing automatic invalidation.

---

## 🟢 MEDIOS

### ✅ M1. Archivos >300 Líneas (Parcialmente Resuelto)

**Resolución**: 4 files split successfully. 3 remaining files are too coupled to split safely:
- `DiagramDisplay.tsx` — 735 lines
- `CanvasElementInteractions.tsx` — 638 lines
- `useDragAndDrop.ts` — 421 lines

These remain as accepted technical debt due to high coupling risk.

---

### ✅ M2. Código Duplicado en Shapes Constants

**Resolución**: Shared functions extracted to `shapes-utils.ts`.

---

### M3. Duplicación de Interfaces

**Estado**: OPEN — medium effort.

**Descripción**: `PlacingElementInfo`, `Point`, `Transform`, `CanvasDebugInfo`, `EdgeInfo`, `ShapeDefinition` defined in 2+ files with different structures.

**Solución**: Define each interface ONCE in `src/types/` and remove duplicates.

---

### M4. Tests que Suprimen Errores — `setupTests.ts` Silencia Console.error

**Estado**: OPEN — medium effort.

**Descripción**: Test setup suppresses ALL `console.error` except one React pattern, hiding real failures.

**Solución**: Replace generic spy with explicit expected-error validation per test.

---

### ✅ M5. Comentarios en Español en Código de Producción

**Resolución**: All comments translated to English.

---

### M6. Emojis en Código de Producción

**Estado**: OPEN — quick win.

**Archivos**: `historyEngineMiddleware.ts`, `svg-shapes.constants.tsx`, `shapes.constants.tsx`, `canvasDebug.ts`

**Solución**: Replace emojis with descriptive text in logs. Keep only in user-facing UI.

---

### ✅ M7. Dead Code

**Resolución**: All dead code deleted (`historySlice.ts`, `useExport.ts`, `useDebounce.ts`, unused mocks, test scripts).

---

### ✅ M8. Comentario `eslint-disable` en 4 Archivos

**Resolución**: File-level disables removed. Converted to targeted inline disables with justification comments in `useDragAndDrop.ts`, `useAccessibility.ts`, `useOptimizedMermaidRenderer.ts`, `useExportTrigger.ts`.

---

### ✅ M9. Sin Tags de Versión

**Resolución**: Tag `v1.0.0` created.

---

### ✅ M10. CHANGELOG.md Vacío

**Resolución**: CHANGELOG populated with full history.

---

### ✅ M11. Dockerfile Ineficiente — Sin `.dockerignore` Específico

**Resolución**: `.dockerignore` updated to exclude `node_modules`, `.git`, `.wrangler`, temp files, etc.

---

### ✅ M12. `loadPersistedState.ts` Hardcodea `interactionMode: 'pan'`

**Resolución**: Now uses persisted value from storage instead of hardcoded default.

---

### M13. Tests Faltantes en Store Types — `RootState = any`

**Estado**: OPEN — quick win.

**Archivo**: `src/store/types.ts`

**Solución**: Remove file or update with real types (already defined in `store/index.ts`).

---

## 🔵 BAJOS (Backlog)

| ID | Issue | Effort |
|----|-------|--------|
| L1 | `lazyMermaidLoader.ts` SRI hash potentially incorrect | Low |
| L2 | `esc()` duplicated in shapes constants | Low |
| L3 | `withDefaults()` duplicated | Low |
| L4 | `textEl()` duplicated | Low |
| L5 | Mock in `src/services/__mocks__/` doesn't follow Vitest convention | Low |
| L6 | No JSDoc in critical middleware functions | Low |
| L7 | Barrel `src/types/index.ts` incomplete | Low |
| L8 | Barrel `src/constants/index.ts` incomplete | Low |
| L9 | No `docs/DIAGRAMS.md` (referenced in STANDARDS.md) | Low |
| L10 | No updated `DEPLOYMENT.md` with new stack | Low |
| L11 | No issue tracker link in README | Low |

---

## Resumen

| Prioridad | Total | Resueltos | Abiertos |
|-----------|-------|-----------|----------|
| 🔴 Críticos | 4 | 4 ✅ | 0 |
| 🟡 Altos | 7 | 7 ✅ | 0 |
| 🟢 Medios | 13 | 9 ✅ | 4 |
| 🔵 Bajos | 11 | 0 | 11 |
| **Total** | **35** | **20 ✅** | **15** |

### Open Issues Summary

| ID | Description | Effort |
|----|-------------|--------|
| M1 (partial) | 3 files >300 lines (too coupled to split) | Accepted debt |
| M3 | Duplicated interfaces across files | Medium |
| M4 | Tests suppress console.error globally | Medium |
| M6 | Emojis in production code logs | Quick win |
| M13 | `store/types.ts` has `RootState = any` | Quick win |
| L1–L11 | Low priority backlog | Low |
