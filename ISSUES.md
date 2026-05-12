# Mermaid Pro Viewer — ISSUES.md

Hallazgos, gaps y mejoras detectados en el proyecto. Generado el 2026-05-12.

## ✅ RESUELTO — Ver abajo

### M1. PROYECTO DUPLICADO
- **Estado**: ✅ **RESUELTO** 2026-05-12
- **Este repo es ahora la versión CANÓNICA**
- Se añadieron remotos gitlab.com y se forzó push reemplazando versión anterior
- Symlink: `ccvass/mermaid-pro-viewer/` → `oss-projects/mermaid-pro-viewer/`
- Backup: `ccvass/mermaid-pro-viewer.old/` (pendiente de eliminar)

- **Aquí**: `/ccvass/mermaid-pro-viewer/` — 149 commits, versión anterior (Monaco Editor, Jest)
- **Allí**: `/ccvass/oss-projects/mermaid-pro-viewer/` — 73 commits, versión más avanzada (CodeMirror, Vitest, SheetsView, Dockerfile, docs/)
- **Impacto**: Confusión severa sobre cuál es la copia oficial; posible pérdida de cambios
- **Solución**: URGENTE: Determinar copia canónica y eliminar la otra. La copia en oss-projects/ parece más avanzada

### M2. REMOTE.md ausente (en esta copia)
- **Archivo**: No existe en ccvass/mermaid-pro-viewer/
- **Nota**: En oss-projects/mermaid-pro-viewer/ SÍ existe REMOTE.md
- **Solución**: Tras la consolidación, mantener REMOTE.md

### M3. docs/ ausente (en esta copia)
- **Archivo**: No existe carpeta docs/
- **Nota**: En oss-projects/ existe docs/ARCHITECTURE.md y docs/STANDARDS.md
- **Solución**: Tras consolidación, mantener docs/

### M4. .env con credenciales reales de Firebase trackeado
- **Archivo**: `.env` contiene API key, auth domain, project ID de Firebase
- **Impacto**: Credenciales de Firebase expuestas en git
- **Solución**: Añadir .env a .gitignore; eliminar del tracking; rotar claves

### M5. TECHNICAL_DOCUMENTATION.md (1522 líneas) con problemas
- **Contiene**: Diagramas Mermaid inline (deben ir en docs/DIAGRAMS.md)
- **Mezcla**: Inglés y español
- **Referencias**: A documentos que no existen (TODO.md, PROJECT_STRUCTURE.md, README.es.md)
- **Duplicación**: Secciones enteras repetidas
- **Solución**: Refactorizar: mover Mermaid a DIAGRAMS.md, traducir, eliminar referencias rotas, deduplicar

## 🟡 Altos

### M6. AGENTS.md versionado en git
- **Regla**: AGENTS.md: "Agent files NEVER in git"
- **Solución**: Añadir a .gitignore

### M7. Sin LICENSE file
- **Solución**: Añadir LICENSE

### M8. Sin CHANGELOG.md
- **Solución**: Implementar CHANGELOG.md

### M9. Sin tags de versión (149 commits, 0 tags)
- **Solución**: Crear tag para release actual

### M10. Dockerfile ausente en esta copia (sí existe en oss-projects/)
- **Problema**: Inconsistencia entre las dos copias
- **Solución**: Tras consolidación, mantener Dockerfile

## 🟢 Medios

### M11. Tres remotos git
- **Problema**: 3 orígenes (origin, glab, gitlab-cloud) — confuso
- **Solución**: Simplificar a 1-2 remotos

### M12. .wrangler/ directorio de cache
- **Problema**: Cache de Cloudflare Wrangler presente
- **Solución**: Añadir a .gitignore

## 🔵 Overlap con otros proyectos

### O1. DUPLICADO CON OSS-PROJECTS
- **Acción**: Urgente consolidar. Ver M1

### O2. Sin overlaps con otros proyectos
- **Análisis**: Mermaid Pro Viewer es único en su dominio (editor de diagramas Mermaid)
- **Recomendación**: Mantener como proyecto independiente tras consolidación

---

**Estado**: Pendiente de revisión
**Generado por**: Auditoría automática de codebase
