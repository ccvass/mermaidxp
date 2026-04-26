# Standards — MermaidXP

## Language & Runtime

- TypeScript 5.7 (strict mode)
- Node.js 18+ (build tooling)
- ES2020 target

## Framework & Libraries

| Category | Library | Version |
|----------|---------|---------|
| UI | React | 19.1.0 |
| State | Redux Toolkit | 2.8.2 |
| Styling | Tailwind CSS | 4.x (PostCSS pipeline, not CDN) |
| Diagrams | Mermaid | 10.9.3 (CDN with SRI) |
| Auth | Firebase Auth | Google provider |
| PDF Export | jsPDF | 4.2.1 (lazy-loaded) |
| Build | Vite | 6.x |
| Deploy | Cloudflare Workers | wrangler CLI |

## Code Quality

- **Linter**: ESLint with React, TypeScript, and Prettier plugins
- **Formatter**: Prettier (`.prettierrc`)
- **Testing**: Jest + ts-jest (274 tests)
- **Type checking**: `tsc --noEmit` via Vite build

## Conventions

- Conventional Commits: `<type>(<scope>): <subject> (#issue)`
- File naming: PascalCase for components, camelCase for utilities
- One component per file
- Redux slices in `src/store/slices/`
- Custom hooks in `src/hooks/`
- Constants in `src/constants/`

## Build & Deploy

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build (Vite)
npm run lint         # ESLint
npm run format       # Prettier
npm test             # Jest (274 tests)
npm run deploy       # Cloudflare Workers (wrangler)
```
