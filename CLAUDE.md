# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Run Jest tests
npm run lint       # ESLint + Prettier check
npm run lint:fix   # ESLint + Prettier auto-fix
```

Run a single test file:
```bash
npx jest path/to/test.test.ts
```

## Architecture

ePlant is a gene-centric visualization SPA for plant genomes (primarily *Arabidopsis thaliana*). It is built with React 18, TypeScript, and Vite.

### State Management

- **Jotai atoms** (`Eplant/state/index.tsx`) manage all UI state: active gene, active view, dark mode, collections, sidebar open/closed.
- **IndexedDB-backed atoms** (`atomWithOptionalStorage`) persist state across sessions via the `idb` library.
- **URL state**: React Router routes include `:geneid?` params so the active gene/view survives navigation.
- **TanStack React Query** handles all async data fetching with built-in caching.

### View System

Views are the core concept. Each view is a self-contained module in `Eplant/views/` and exports a `ViewMetadata` object:

```ts
{
  icon, name, id, description, thumbnail,
  citation,   // React component for attribution
  actions,    // state mutations
}
```

Views are registered in `Eplant/config.tsx` which drives both routing and the sidebar nav. To add a new view, follow `Eplant/tutorial.md` — it explains the full pattern with examples.

### Key Directory Layout

| Path | Purpose |
|---|---|
| `Eplant/views/` | All 12 visualization views (eFP, chromosome, interactions, etc.) |
| `Eplant/UI/` | Shared MUI-based components (Sidebar, Layout, SearchBar) |
| `Eplant/state/` | Jotai atoms and storage layer |
| `Eplant/Species/arabidopsis/` | Species registry, gene search API, GeneticElement class |
| `Eplant/util/` | Hooks (useDimensions, useStateWithStorage), pan/zoom, citations |
| `Eplant/config.tsx` | View registry — maps view IDs to metadata and routes |

### GeneticElement Abstraction

`GeneticElement` (`Eplant/Species/`) is the central data object passed into views. It holds gene id, annotation, species reference, and aliases, and supports serialization for IndexedDB storage.

### Tech Stack Highlights

- **MUI v5** for all UI components and theming (light/dark via Jotai atom)
- **D3 v7** for custom SVG visualizations
- **Cytoscape** for the Interactions view graph
- **Google Maps** (`@vis.gl/react-google-maps`) for World eFP
- **FlexLayout React** for the dynamic multi-panel layout

## Code Style

Prettier config (`.prettierrc`): 2-space indent, single quotes, no semicolons, trailing commas (`es5`). ESLint enforces import ordering. Run `npm run lint:fix` before committing.

TypeScript path alias: `@eplant/*` resolves to `Eplant/*` (configured in `tsconfig.json` and `vite.config.ts`).

Node ≥ 18 and npm ≥ 9.8 are required (per `CONTRIBUTING.md`).
