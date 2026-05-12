# Mermaid Pro Viewer — ISSUES.md

Hallazgos, gaps y mejoras detectados en auditoría profunda del 2026-05-12.
Basado en análisis de código, git history, mem0, issues cerrados previamente, y documentación existente.

> **Nota**: GitLab inaccesible (error 522). Issues registrados localmente para importación posterior.

---

## 🔴 CRÍTICOS

### C1. Dual Undo/Redo Systems — Desincronización de Estado

**Archivos**: `src/store/slices/diagramSlice.ts:63-73` (legacy history), `src/store/middleware/historyEngineMiddleware.ts` (nuevo engine), `src/store/slices/historyEngineSlice.ts:101-123` (nuevo reducer)

**Descripción**: Existen DOS sistemas de undo/redo paralelos:
- **Legacy**: `diagramSlice` mantiene `history[]` + `historyIndex` con undo/redo propios
- **Unified**: `historyEngineSlice` + `historyEngineMiddleware` con snapshots completos

El middleware usa `applyMermaidCode` para restaurar código SIN mutar `diagram.history`, pero `useAutoSaveHistory.ts` dispara `setMermaidCode` que SÍ muta ambos. Tras un undo del history engine, el índice legacy queda desincronizado: al escribir nuevo código, el legacy history se trunca incorrectamente.

**Solución integral**:
1. Eliminar `history[]`, `historyIndex`, `undo`, `redo` de `diagramSlice.ts`
2. Migrar toda la lógica de undo/redo al unified history engine
3. Eliminar `historySlice.ts` (stub)
4. Asegurar que `KeyboardManager.tsx` solo dispache `undo`/`redo` del historyEngineSlice
5. Validar que persistMiddleware no persista campos eliminados

**Criterios de validación**:
- [ ] `diagramSlice` no exporta `history`, `historyIndex`, `undo`, `redo`
- [ ] Undo/redo via keyboard shortcuts funciona correctamente
- [ ] No hay referencias a `diagram.history` en ningún archivo
- [ ] 271+ tests pasan
- [ ] Tras undo, escribir nuevo código no corrompe el historial

---

### C2. Race Condition en History Engine Restore

**Archivo**: `src/store/middleware/historyEngineMiddleware.ts:154-190`

**Descripción**: `handleApplySnapshot` usa `Promise.resolve().then(() => {...})` para restaurar estado en un microtask. Múltiples undo/redo rápidos pueden causar que `state.historyEngine.present` cambie entre la verificación (línea 156) y la ejecución del microtask, aplicando el snapshot incorrecto.

**Solución integral**:
1. Eliminar el `Promise.resolve().then()` — usar `requestAnimationFrame` o sincrónico
2. Capturar `present` como referencia estable al inicio de la función
3. Verificar al inicio del microtask que el snapshot sigue siendo el actual
4. Agregar un `restoreId` incremental para detectar restauraciones obsoletas

**Criterios de validación**:
- [ ] Undo/redo rápidos (10+ en 1s) siempre restauran el estado correcto
- [ ] No hay referencias a `Promise.resolve().then` en el middleware
- [ ] Test de estrés con 50 undo/redo en rápida sucesión

---

### C3. Módulo `wrangler.jsonc` con `account_id` Real Trackeado en Git

**Archivo**: `wrangler.jsonc`

**Descripción**: El archivo contiene `"account_id": "89d8128c7d7ad78d65132565959e150b"` (ID real de cuenta Cloudflare) y rutas de producción. Aunque no es un secreto crítico, expone información de infraestructura.

**Solución integral**:
1. Mover `account_id`, `routes` y `zone_name` a variables de entorno o secrets de CI/CD
2. `wrangler.jsonc` actual debe contener solo config genérica
3. Crear `wrangler.jsonc.example` como plantilla (ya existe, pero actualizar)
4. Añadir `wrangler.jsonc` a `.gitignore`

**Criterios de validación**:
- [ ] `wrangler.jsonc` no contiene `account_id` ni `zone_name`
- [ ] `wrangler.jsonc` está en `.gitignore`
- [ ] Deploy via CI/CD funciona con secrets
- [ ] `wrangler.jsonc.example` tiene todos los campos documentados

---

### C4. Gemini API Key Expuesta en Client Bundle

**Archivos**: `vite.config.ts:15-16`, `.env`

**Descripción**: `vite.config.ts` define `process.env.API_KEY` y `process.env.GEMINI_API_KEY` como constantes globales. Si `GEMINI_API_KEY` existe en el entorno de build, se string-reemplaza y empaqueta en el bundle del cliente, exponiéndola a todos los usuarios.

**Solución integral**:
1. NO usar `define` para API keys sensibles
2. Si se necesita Gemini, hacer proxy via Cloudflare Worker con rate limiting
3. Eliminar las líneas de `define` en `vite.config.ts`
4. Documentar en `.env.example` que Gemini requiere backend proxy

**Criterios de validación**:
- [ ] `process.env.GEMINI_API_KEY` no aparece en el bundle compilado
- [ ] No hay referencias a `API_KEY` en `vite.config.ts`
- [ ] Cualquier funcionalidad Gemini usa proxy server-side

---

## 🟡 ALTOS

### H1. `useDragAndDrop` — Variable Mutable a Nivel de Módulo (`isMarking`)

**Archivo**: `src/state/hooks/useDragAndDrop.ts:182`

**Descripción**: `let isMarking = false` es una variable a nivel de módulo, no un ref. Múltiples instancias del hook comparten esta variable, causando race conditions: si dos componentes usan este hook, uno puede bloquear al otro.

**Solución integral**:
1. Mover `isMarking` a `useRef` dentro del hook
2. Asegurar que `markDraggableElementsRef.current` acceda al ref en lugar de la variable

**Criterios de validación**:
- [ ] No hay `let ... = false` mutable a nivel de módulo
- [ ] Múltiples instancias del hook funcionan independientemente
- [ ] Tests de drag con múltiples contenedores

---

### H2. `unifiedResize` — Fuga de Event Listeners Globales

**Archivo**: `src/features/canvas/utils/unifiedResize.ts:188-190`

**Descripción**: `initUnifiedResize` adjunta listeners `mousedown`, `mousemove`, `mouseup` a `document` sin proporcionar función de cleanup. Llamar la función repetidamente acumula listeners duplicados.

**Solución integral**:
1. Retornar función de cleanup que remueva los listeners
2. Usar `AbortController` o store refs a las funciones para poder removerlas
3. Llamar cleanup en `useEffect` return del componente que lo usa

**Criterios de validación**:
- [ ] `initUnifiedResize` retorna función de cleanup
- [ ] No hay acumulación de listeners tras múltiples llamadas
- [ ] Componente llama cleanup en unmount

---

### H3. InteractionMode Duality — Dos Fuentes de Verdad

**Archivos**: `src/store/slices/uiSlice.ts` (interactionMode), `src/store/slices/canvasSlice.ts` (interactionMode)

**Descripción**: `interactionMode` se almacena en DOS slices (`ui.interactionMode` default `'drag'` vs `canvas.interactionMode` default `'pan'`). PersistMiddleware persiste `canvas.interactionMode`, pero `loadPersistedState` hardcodea `interactionMode: 'pan'`. Pueden desincronizarse.

**Solución integral**:
1. Eliminar `interactionMode` de `uiSlice`
2. Unificar todo el consumo a `canvas.interactionMode`
3. Actualizar todos los selectores y hooks que usen `ui.interactionMode`
4. Sincronizar defaults en `loadPersistedState`

**Criterios de validación**:
- [ ] Solo existe una fuente de `interactionMode` en el store
- [ ] No hay referencias a `state.ui.interactionMode`
- [ ] Persistencia y restauración mantienen el modo correcto

---

### H4. Cloudflare Worker No Sirve Static Assets

**Archivo**: `src/worker.ts`

**Descripción**: El worker retorna `'Worker ready'` sin servir los assets de `dist/`. Cloudflare Pages/Workers con `assets.directory` en `wrangler.jsonc` puede servir estáticos, pero el worker actual no implementa lógica de fallback SPA ni headers de seguridad.

**Solución integral**:
1. Implementar worker que sirva assets desde `dist/` con SPA fallback
2. Agregar headers de seguridad (CSP, X-Frame-Options, HSTS)
3. Agregar endpoint `/api/health` con estado de la app
4. Implementar rate limiting básico

**Criterios de validación**:
- [ ] Navegación directa a `/` y rutas internas funciona
- [ ] Headers de seguridad presentes en responses
- [ ] `/api/health` retorna `{"status":"ok"}`
- [ ] Deploy via `wrangler deploy` funciona

---

### H5. Tests Faltantes para Módulos Críticos

**Archivos**: `validationService.ts`, `exportService.ts`, `apiService.ts`, `lazyMermaidLoader.ts`, `useHistoryEngine.ts`, `useAutoSaveHistory.ts`, `useDragAndDrop.ts`, `useElementPlacement.ts`, `usePan.ts`, `canvasTransform.ts`, `unifiedResize.ts`, `Transform.ts`, `EdgeCache.ts`

**Descripción**: Múltiples módulos críticos tienen 0 cobertura de tests. Especialmente grave: `exportService.ts` (maneja PDF multi-página), `useDragAndDrop.ts` (421 líneas de lógica compleja sin tests), `unifiedResize.ts` (DOM manipulation sin tests).

**Solución integral**:
1. Tests para `exportService.ts`: export SVG, PNG, PDF, multi-page, error handling
2. Tests para `useDragAndDrop.ts`: extracción de node IDs, movimiento, edge caching
3. Tests para `unifiedResize.ts`: resize handles, proporciones, límites
4. Tests para `validationService.ts`: validación de código, sanitización
5. Tests para `useHistoryEngine.ts`: undo/redo, coalescing, restore

**Criterios de validación**:
- [ ] Cada módulo listado tiene al menos 1 test suite
- [ ] Cobertura >60% en módulos core
- [ ] Tests de integración para flujos críticos (drag → move → undo)

---

### H6. EdgeCache Stats Hardcodeadas — Sin Tracking Real

**Archivo**: `src/features/canvas/utils/EdgeCache.ts:122-136`

**Descripción**: `getStats()` retorna `hitRate: 0` y `evictionCount: 0` hardcodeados con comentario "Would need to track this". El LRU tracking existe pero los contadores nunca se incrementan.

**Solución integral**:
1. Incrementar contadores en `get()` (hits) y `set()` (misses)
2. Incrementar `evictionCount` cuando se elimina entrada por límite
3. Retornar valores reales en `getStats()`

**Criterios de validación**:
- [ ] `getStats()` retorna valores reales
- [ ] Tests verifican hit/miss rates

---

### H7. WeakMap Cache en `nodeIdExtractor` Nunca Invalidado

**Archivo**: `src/features/canvas/utils/nodeIdExtractor.ts:83-84`

**Descripción**: `NODE_ID_CACHE` es un WeakMap que almacena node IDs extraídos. `clearNodeIdCache()` (línea 182) es no-op para WeakMaps. Cuando el diagrama cambia (nuevo render), las entradas en caché quedan stale.

**Solución integral**:
1. Reemplazar WeakMap con `Map<string, ...>` manejado manualmente
2. Agregar `renderEpoch` al estado del diagrama para invalidar caché
3. Llamar `clearNodeIdCache()` explícitamente en cada nuevo render

**Criterios de validación**:
- [ ] `clearNodeIdCache()` realmente invalida la caché
- [ ] Tests verifican que IDs stale no se usan tras re-render

---

## 🟢 MEDIOS

### M1. Archivos >300 Líneas (Violación de Estándar)

**Archivos que exceden el límite de 300 líneas**:
- `src/constants/shapes.constants.tsx` — **786 líneas** (debería ser 3-4 archivos)
- `src/constants/advanced-shapes.constants.tsx` — **740 líneas** (debería ser 3-4 archivos)
- `src/constants/demos.ts` — **614 líneas** (debería dividirse)
- `src/constants/svg-shapes.constants.tsx` — **459 líneas**
- `src/state/hooks/useDragAndDrop.ts` — **421 líneas**
- `src/store/slices/canvasElementsSlice.ts` — **316 líneas**
- `src/hooks/useCanvasElements.ts` — **356 líneas**

**Solución**: Dividir archivos que excedan 300 líneas según su responsabilidad. Mover SVG generation helpers a archivos separados.

**Criterios de validación**: Todos los archivos <300 líneas excepto casos justificados.

---

### M2. Código Duplicado en Shapes Constants

**Archivos**: `src/constants/shapes.constants.tsx`, `src/constants/advanced-shapes.constants.tsx`

**Descripción**: Las funciones `esc()`, `withDefaults()`, `textEl()`, `rectSVG()`, `ellipseSVG()`, `circleSVG()`, `diamondSVG()`, `cylinderSVG()` están duplicadas idénticamente entre ambos archivos.

**Solución**: Extraer funciones compartidas a `src/constants/shapes-utils.ts` o `src/utils/shapeGenerators.ts`.

---

### M3. Duplicación de Interfaces — `PlacingElementInfo`, `Point`, `Transform`, `CanvasDebugInfo`, `EdgeInfo`, `ShapeDefinition`

**Descripción**: Múltiples interfaces están definidas en 2+ archivos con estructuras diferentes. Ver ISSUES.md anterior para lista completa.

**Solución**: Definir cada interfaz UNA SOLA VEZ en `src/types/` y eliminar las duplicadas.

---

### M4. Tests que Suprimen Errores — `setupTests.ts` Silencia Console.error

**Archivo**: `src/setupTests.ts:46-54`

**Descripción**: El setup de tests suprime TODOS los `console.error` excepto un patrón específico de React, ocultando fallos reales en tests.

**Solución**: Reemplazar el spy genérico por validación explícita de errores esperados en cada test.

---

### M5. Comentarios en Español en Código de Producción

**Archivos**: `src/utils/canvasSpaceCalculator.ts`, `src/state/hooks/useDragAndDrop.ts`

**Solución**: Traducir todos los comentarios a inglés según estándar del proyecto.

---

### M6. Emojis en Código de Producción

**Archivos**: `src/store/middleware/historyEngineMiddleware.ts:158`, `src/constants/svg-shapes.constants.tsx`, `src/constants/shapes.constants.tsx`, `src/utils/canvasDebug.ts`

**Descripción**: Emojis usados en logs de producción, constantes y descripciones.

**Solución**: Reemplazar emojis por texto descriptivo en logs. Mantener solo en UI visible al usuario.

---

### M7. Dead Code: `historySlice.ts`, `useExport.ts`, `useDebounce.ts`, Mocks No Usados

**Archivos**: `src/store/slices/historySlice.ts` (stub), `src/state/hooks/useExport.ts` (duplicado), `src/hooks/useDebounce.ts` (duplicado de helpers/debounce.ts), mocks en `__mocks__/` sin consumidores, `src/test-undo-redo.js`, `src/comprehensive-undo-redo-test.js`

**Solución**: Eliminar todos los archivos muertos.

---

### M8. Comentario `eslint-disable` en 4 Archivos

**Archivos**: `useDragAndDrop.ts`, `useAccessibility.ts`, `useOptimizedMermaidRenderer.ts`, `useExportTrigger.ts`

**Solución**: Eliminar los disable comentando correctamente las deps o reestructurando los hooks.

---

### M9. Sin Tags de Versión — 150+ Commits, 0 Tags

**Descripción**: No hay tags SemVer a pesar de tener releases funcionales.

**Solución**: Crear tag `v1.0.0` para el estado actual y establecer política de tagging.

---

### M10. CHANGELOG.md Vacío

**Archivo**: `CHANGELOG.md`

**Solución**: Poblar con historial de cambios basado en commits y releases.

---

### M11. Dockerfile Ineficiente — Sin `.dockerignore` Específico

**Archivo**: `Dockerfile`

**Descripción**: El Dockerfile copia todo el contexto incluyendo `node_modules`, `dist`, `.git`, etc. Aunque existe `.dockerignore`, verificar que excluya todo lo necesario.

**Solución**: Verificar `.dockerignore` excluye `node_modules`, `.git`, `.wrangler`, `todo.json`, etc.

---

### M12. `loadPersistedState.ts` Hardcodea `interactionMode: 'pan'`

**Archivo**: `src/store/loadPersistedState.ts:89`

**Descripción**: Ignora el valor persistido de interactionMode y siempre lo setea a `'pan'`. Issue H3 relacionado.

---

### M13. Tests Faltantes en Store Types — `RootState = any`

**Archivo**: `src/store/types.ts:9-10`

**Solución**: Eliminar el archivo o actualizarlo con tipos reales. Ya están definidos en `store/index.ts:42-43`.

---

## 🔵 BAJOS

### L1. `lazyMermaidLoader.ts` SRI Hash Potencialmente Incorrecto
### L2. `esc()` duplicada en shapes constants
### L3. `withDefaults()` duplicada
### L4. `textEl()` duplicada
### L5. Mock en `src/services/__mocks__/` no sigue convención Vitest
### L6. Sin JSDoc en funciones críticas del middleware
### L7. Barrel `src/types/index.ts` incompleto
### L8. Barrel `src/constants/index.ts` incompleto
### L9. Sin `docs/DIAGRAMS.md` (se menciona en STANDARDS.md)
### L10. Sin `DEPLOYMENT.md` actualizado con nuevo stack
### L11. Sin issue tracker link en README

---

## Resumen

| Prioridad | Cantidad | Acción requerida |
|-----------|----------|------------------|
| 🔴 Críticos | 4 | Corrección inmediata |
| 🟡 Altos | 7 | Corrección esta iteración |
| 🟢 Medios | 13 | Corrección planificada |
| 🔵 Bajos | 11 | Backlog |

**Nota**: GitLab inaccesible (522). Los issues se importarán cuando el servicio esté disponible.
