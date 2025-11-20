# ePlant AI Agent Instructions

ePlant is a gene-centric visualization tool for plant genomes built with React, TypeScript, and Vite.

## Core Architecture

### View System
- **Views** are the central abstraction - data visualization components that implement the `View<Data, State, Action>` interface
- Each View defines: `component`, `getInitialData`, `getInitialState`, `reducer`, `actions`, `icon`, and `citation`
- Views are configured in `Eplant/config.ts` as `genericViews` (non-gene-specific) and `userViews` (gene-specific)
- View components receive props: `{ activeData, state, dispatch, geneticElement }`

#### View Interface Pattern
Views implement `View<Data, State, Action>` with these required/optional properties:

**Required:**
- `component`: React component receiving `ViewProps<Data, State, Action>`
- `getInitialData`: Async function that loads view data for a gene
- `name`: Display name for the view
- `id`: Unique identifier used in routing and storage

**Optional:**
- `getInitialState()`: Returns initial state (defaults to `null`)
- `reducer(state, action)`: Handles state updates via actions
- `actions[]`: Menu items with `{action, render()}` for view options
- `icon()`: JSX icon component for view selector
- `citation()`: JSX component for data attribution

**Two Implementation Patterns:**
1. **Object views** (simple): `const MyView: View = { name, id, component, ... }`
2. **Class views** (complex): `class MyView implements View { constructor(...) { this.component = this.component.bind(this) } }`

**Routing & View Registration:**
1. **Add to config**: Register view in `Eplant/config.ts` in `userViews` or `genericViews` array
2. **View ID routing**: The `id` property automatically becomes the URL route (e.g., `id: 'my-view'` → `/my-view`)
3. **Default view**: Set `defaultView: 'view-id'` in config to control initial view
4. **View switching**: Use `useSetActiveViewId()` to programmatically change views

Example view registration:
```typescript
// In Eplant/config.ts
import MyNewView from './views/MyNewView'

const userViews = [
  GeneInfoView,
  MyNewView,  // Add your view here
  // ... other views
]
```

Example minimal view:
```typescript
const SimpleView: View<string> = {
  name: 'Simple View',
  id: 'simple',  // This becomes the route
  component: ({ activeData }) => <div>{activeData}</div>,
  async getInitialData(gene) {
    return gene ? `Data for ${gene.id}` : 'No gene'
  }
}
```

### State Management
- Uses **Jotai** atoms for global state, not Redux/Context extensively
- Custom `atomWithStorage` pattern persists state to IndexedDB via `Storage` utility class
- Key atoms: `genesAtom`, `activeViewIdAtom`, `activeGeneIdAtom`, `darkModeAtom`
- State persistence can be disabled with `persistAtom`

### Data Loading Pattern
- Views load data via `getInitialData(gene, loadEvent)` with progress callbacks
- `useViewData` hook manages loading states and caches data in `viewDataStorage`
- Species-specific loaders in `Species/arabidopsis/loaders/` handle API calls to BAR (Bio-Analytic Resource)

## File Organization Conventions

### View Structure
```
views/
  ViewName/
    index.tsx          # View configuration object
    component.tsx      # React component implementation
    types.tsx          # TypeScript interfaces
    icon.tsx          # Icon component
```

### Import Aliases
- Use `@eplant/*` imports via TypeScript path mapping
- Example: `import { View } from '@eplant/View'`

### Component Patterns
- Views can be classes (`EFP`) or objects (`GeneInfoView`)
- Use `ViewProps<Data, State, Action>` for component props
- Actions rendered via `view.actions[].render()` for view options menu

#### Data Loading & Error Handling
Views must handle three scenarios in `getInitialData`:
1. **Success**: Return the loaded data
2. **Unsupported gene**: `throw ViewDataError.UNSUPPORTED_GENE`
3. **Loading failure**: `throw ViewDataError.FAILED_TO_LOAD`

The `loadEvent` callback reports progress (0-1 float):
```typescript
async getInitialData(gene, loadEvent) {
  loadEvent(0.0)  // Starting
  const data = await api.fetchData(gene.id)
  loadEvent(0.5)  // Halfway
  const processed = await processData(data)
  loadEvent(1.0)  // Complete
  return processed
}
```

Species-specific loaders live in `Species/arabidopsis/loaders/` and are referenced by view ID:
```typescript
// In Species definition
loaders: {
  'gene-info': GeneInfoViewLoader,
  'publication-viewer': PublicationViewerLoader
}
```

## Development Workflow

### Key Commands
```bash
npm run dev          # Vite dev server
npm run build        # Production build for GitHub Pages
npm run lint         # ESLint + Prettier check
npm run lint:fix     # Auto-fix linting issues
```

### Build Configuration
- Vite with React, TypeScript paths, and ESLint plugins
- GitHub Pages deployment via `.github/workflows/deploy.yml`
- Environment variables: `BASE_URL='/ePlant'`, `VITE_MAPS_API_KEY`

## Unique Patterns

### GeneticElement & Species
- `GeneticElement` represents genes with species-specific APIs
- `Species` class provides `searchGene`, `autocomplete`, and `loaders`
- Currently only supports Arabidopsis via BAR API at `bar.utoronto.ca`

### ViewContainer Architecture
- `ViewContainer` wraps views with toolbar, loading states, and error handling
- Renders `<view.component />` with standardized props structure
- Handles view switching, gene selection, and print functionality

### Storage & Persistence
- Custom `Storage` class wraps IndexedDB with key-value persistence
- View data cached by `${viewId}-${geneId}` keys
- Loading progress tracked globally via `pageLoad` singleton

## Common Pitfalls

- Views must handle both loading and error states in `getInitialData`
- Use `ViewDataError.UNSUPPORTED_GENE` for genes that don't support a view
- State updates should go through `dispatch` actions, not direct state mutation
- SVG manipulation in eFP views requires careful DOM querying with view-specific IDs

## Integration Points

- **BAR API**: External service for gene data, expression data, and annotations
- **Jotai DevTools**: Available in development for state debugging
- **Material-UI**: Consistent theming via `css/theme.tsx` with dark/light modes
- **FlexLayout**: For complex layouts (currently commented out but present)

When implementing new views, follow the View interface pattern and ensure proper error handling for unsupported genes.
