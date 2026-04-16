# CLAUDE.md

Guidance for Claude Code when working in this repository. Keep this file honest — if the architecture changes, update it here.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production (outputs to dist/)
npm run lint       # ESLint + Prettier check
npm run lint:fix   # Auto-fix lint issues
npm test           # Jest (runs with --passWithNoTests)
```

Formatting: 2-space indent, single quotes, no semicolons, trailing commas. Enforced by Prettier. Lint is set to `--max-warnings 0`, so warnings fail CI.

Path alias: `@eplant/*` maps to `Eplant/*` (see `tsconfig.json` and `vite-tsconfig-paths`).

## What ePlant Is

A gene-centric visualization tool for plant genomes (currently _Arabidopsis thaliana_ only). The user picks a gene of interest, then explores it through multiple "views" — each a distinct visualization (gene info, publications, eFP expression maps, chromosome viewer, interaction network, etc.). External data comes from the BAR API at `bar.utoronto.ca`.

## Architecture

### Routing Is the Backbone

Routes are defined in [`Eplant/main.tsx`](Eplant/main.tsx) using React Router v6's `createBrowserRouter`. The root route renders [`Eplant/Eplant.tsx`](Eplant/Eplant.tsx), and each view is a child route matching a path like `/{view-id}/:geneid?`. The child route renders inside `<Outlet />` in [`Eplant/UI/Layout/ViewContainer/index.tsx`](Eplant/UI/Layout/ViewContainer/index.tsx).

The component tree:
```
main.tsx (Providers: Jotai, Config, QueryClient, Router)
  └─ Eplant.tsx (ThemeProvider, Sidebar, URLStateProvider)
      └─ ViewContainer (TopBar, ErrorBoundary, Outlet)
          └─ {view component} — e.g. PlantEFPView, GeneInfoView
```

### Views Are Plain React Components

A view has two parts that are registered separately:

1. **The component** — a React function component under `Eplant/views/{Name}/{Name}.tsx`. It reads the current gene via `useOutletContext<ViewContext>()`, fetches its own data with `useQuery`, manages URL-synced state with `useURLState`, and renders. Registered as a route in `main.tsx`.

2. **The metadata** — a `ViewMetadata` object (see [`Eplant/View/index.ts`](Eplant/View/index.ts)) exported as default from `Eplant/views/{Name}/index.tsx`. Holds `id`, `name`, `icon`, `description`, `thumbnail`, `citation`, and `actions`. Registered in [`Eplant/config.tsx`](Eplant/config.tsx) under `userViewMetadata` (gene-specific) or `genericViewMetadata` (standalone like GetStarted).

**These two registrations must stay in sync** — the `id` in the metadata must match the path in `main.tsx`.

### Data Fetching

Each view owns its data fetching via `useQuery` from `@tanstack/react-query`. The `QueryClient` is constructed in `main.tsx` and provided app-wide. Pattern used in existing views:

```tsx
const { data, isLoading, isError, error } = useQuery<TData, ViewDataError>({
  queryKey: [`view-id-${geneticElement?.id}`],
  queryFn: async () => loaderFn(geneticElement, setLoadAmount),
  retry: false,
})
```

Loader functions live in the view's own directory (e.g. `views/GeneInfoView/loader.ts`). There is **no shared API client yet** — loaders call `fetch` or `axios` directly against hardcoded `bar.utoronto.ca` URLs. When new backend APIs arrive, wrap them in a proper client layer before adopting.

### State Management

Four layers, each with a specific job. Respect the boundaries.

| Layer | Purpose | Where |
|---|---|---|
| **TanStack Query** | Server data, caching, loading states | Per-view `useQuery` |
| **URL search params** | View-specific state that should be shareable/bookmarkable | `useURLState<T>()` from [`state/URLStateProvider.tsx`](Eplant/state/URLStateProvider.tsx), validated by Zod schemas |
| **Jotai atoms** | Global UI state (dark mode, sidebar, active gene/view ids, gene collections) | [`state/index.tsx`](Eplant/state/index.tsx) |
| **IndexedDB** | Persisting Jotai atoms across sessions | `atomWithOptionalStorage` wrapper over [`util/Storage/index.tsx`](Eplant/util/Storage/index.tsx) |

**URL state pattern:** define a Zod schema with `.default(...)` on each field, call `initializeState(schema)` in a `useEffect` on mount, read `state` and call `setState(...)` to update. The provider serializes to query params with a 50ms debounce. See any eFP view for an example.

### Active Gene / Active View

Stored in Jotai atoms (`activeGeneIdAtom`, `activeViewIdAtom`) and also reflected in the URL. `ViewContainer` has two `useEffect`s that sync them — one reads URL → atoms on mount, one writes atoms → URL on change. This is fragile and worth keeping in mind when editing routing logic.

## Adding a New View

1. Create `Eplant/views/{Name}/{Name}.tsx` — the component. Read gene via `useOutletContext<ViewContext>()`, fetch with `useQuery`, handle loading/error states via `<LoadingPage />`.
2. Create `Eplant/views/{Name}/index.tsx` — export `ViewMetadata` as default. Include `id`, `name`, `icon`, `citation`.
3. If the view has URL-persisted state, define a Zod schema alongside it.
4. Register the route in [`Eplant/main.tsx`](Eplant/main.tsx) with path `{view-id}/:geneid?`.
5. Register the metadata in [`Eplant/config.tsx`](Eplant/config.tsx) under `userViewMetadata`.

Copy [`views/PlantEFP/`](Eplant/views/PlantEFP/) or [`views/GeneInfoView/`](Eplant/views/GeneInfoView/) as templates — they follow the current pattern cleanly.

## Known Legacy Code — Don't Copy These Patterns

These exist but predate the routing refactor. Treat them as refactor targets, not references.

- **`EFP` class** in [`Eplant/views/eFP/index.tsx`](Eplant/views/eFP/index.tsx) — defines a `component` method that calls React hooks. Violates rules-of-hooks assumptions. Mixes data fetching (`getInitialData`) with rendering. Should be split into a hook + function component.
- **`Species` static registry** in [`Eplant/GeneticElement.ts`](Eplant/GeneticElement.ts) — species self-register into a static array at module load. Hidden global mutation, hard to test. Eventually replace with explicit registration via Config context.
- **Top-level `await`** in [`Eplant/state/index.tsx`](Eplant/state/index.tsx) (`citationsAtom`) — blocks module load on a network request. Move to a React Query call.
- **`atomWithOptionalStorage`** is marked with a `TODO` for removal.
- **`dangerouslySetInnerHTML`** in eFP views renders SVGs from the BAR server. If the source ever becomes untrusted, route through `dompurify` (already a dep).
- **`flexlayout-react`** is still imported in `state/index.tsx` but the dockable-panel layout it provided was replaced by React Router. Remove when convenient.
- **eFP colour calculation** has historically been a source of confusion. Downstream renderers (`useStyles`, `EFPTooltip`) must use `group.control` (per-group) not `data.control` (cross-group average) for correct relative-mode colours and log2 fold change values. `data.control` is a valid fallback only.

## Stack

React 18 · TypeScript 5 · Vite 4 · MUI v5 · Jotai · TanStack Query v5 · React Router v6 · Zod · Cytoscape (+ cose-bilkent, automove, popper) · D3 · idb (IndexedDB) · axios · lodash · flexlayout-react (legacy) · Jest + React Testing Library + MSW · ESLint + Prettier

## Environment Variables

Set via `.env` (Vite convention: must be prefixed `VITE_`):

- `VITE_MAPS_API_KEY` — Google Maps API key for the WorldEFP view
- `VITE_MAP_ID` — Google Maps style ID for the WorldEFP view
- `BASE_URL` — build-time base path (set to `/ePlant` in CI for GitHub Pages)

## CI / Deploy

Three workflows in `.github/workflows/`:
- `build.yml` — runs on branches other than main/staging; Node 22
- `linting.yml` — Prettier + ESLint on all pushes/PRs; Node 20
- `deploy.yml` — builds and publishes to GitHub Pages from `staging-debug`; Node 22
- `node.js.yml` — legacy, runs on main with Node 16 (EOL — scheduled for removal/update)

## When In Doubt

- Check [`RoutingChanges.md`](RoutingChanges.md) for the rationale behind the current view architecture.
- Prefer editing an existing working view as a reference over inferring patterns from this file.
- If you find this file contradicts the code, trust the code and flag the discrepancy.