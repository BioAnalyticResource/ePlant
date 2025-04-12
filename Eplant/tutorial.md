# Tutorial <!-- omit in toc -->

- [Main Component](#main-component)
- [Eplant Layout](#eplant-layout)
- [View Metadata and View Components](#view-metadata-and-view-components)
  - [View Metadata](#view-metadata)
    - [icon:](#icon)
    - [name:](#name)
    - [id:](#id)
    - [description:](#description)
    - [thumbnail:](#thumbnail)
    - [citation:](#citation)
    - [actions:](#actions)
  - [View Components](#view-components)
  - [View Actions](#view-actions)
- [States and Data](#states-and-data)
  - [Atoms](#atoms)
  - [React Query](#react-query)
  - [URL State Encoding](#url-state-encoding)
  - [URL State Context Management](#url-state-context-management)
- [Creating a New View (Tutorial)](#creating-a-new-view-tutorial)
  - [Defining Types](#defining-types)
  - [Creating the ViewMetadata Object](#creating-the-viewmetadata-object)
  - [Creating the View Component](#creating-the-view-component)
  - [Final Steps](#final-steps)
    - [Adding Metadata](#adding-metadata)
    - [Adding a New Route](#adding-a-new-route)
- [`config.ts` file](#configts-file)
  - [Breakdown of `config.ts`](#breakdown-of-configts)
  - [Usage](#usage)
- [Documentation and Commenting Style](#documentation-and-commenting-style)
- [Eslint Code Standards](#eslint-code-standards)
- [Local Testing Requirements](#local-testing-requirements)
- [Eplant2](#eplant2)
  - [API](#api)

## Main Component

In the root(`Eplant/main.tsx`), you can see the `Eplant` component, which is our main component of our application.

`main.tsx`

```
const router = createBrowserRouter([<View Routes Here>])

function RootApp() {
  return (
    <StrictMode>
      <Provider>
        <Config.Provider value={defaultConfig}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </Config.Provider>
      </Provider>
    </StrictMode>
  )
}
```

We use createBrowserRouter to define the default routes to every view component.

`Eplant.tsx`

```
<ThemeProvider theme={darkMode ? dark : light}>
  <CssBaseline />
  <Sidebar />
  <URLStateProvider>
    ...
  </URLStateProvider>
</ThemeProvider>
```

Eplant app consists of `Sidebar` and `URLStateProvider` wrapped in a `ThemeProvider` as shown in `Eplant.tsx` (`Eplant/Eplant.tsx`)

## Eplant Layout

ViewContainer (`Eplant/UI/Layout/ViewContainer/index.tsx`) hosts the actual views, and handles the viewing options available to the view. It also provides a topbar, and a preview stack if necessary.

The selection and rendering of the active view is handled via React Router, and the ViewContainer uses `<Outlet>` (from React Router) to render whichever view matches the current route.

```
<Outlet
  context={{
    geneticElement: gene,
    setLoadAmount: setLoadAmount,
    setIsLoading: setLoading,
  }}
></Outlet>
```

Retrieval of props in a view is done use the `useOutletContext` hook provided by ReactRouterDOM.

```
const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()
```

As you an see there are 3 key props that will be passed to every view, the currently active geneticElement, as well as the setIsLoading and setLoadAmount callbacks. The latter two callbacks should be used by the view's dataloaders to indicate loading status.

## View Metadata and View Components

### View Metadata

View metadata is the interface used to define the metadata for a view and contains multiple parts.

#### icon:

An optional React component that returns an icon representing the view. This is used in the gene info viewer to visually identify the view.

#### name:

A required string that represents the name of the view. This is used to identify the view in various contexts.

#### id:

A required string that provides a unique identifier for the view.

#### description:

An optional string that provides a description of the view.

#### thumbnail:

An optional string that represents the URL or path to a thumbnail image for the view.

#### citation:

An optional React component that renders citations related to the gene. This helps in displaying references or additional information.
Takes props which may include state, activeData, and gene.

#### actions:

An optional list of view actions a specific view may have available.

### View Components

Views are defined as standard React components which are responsible for all of their own data fetching and state management. These components will be defined as sub-routes under a parent route which renders the top level `Eplant` component. Each subroute will be rendered via the ReactRouterDOM [Outlet component](https://api.reactrouter.com/v7/functions/react_router.Outlet.html) which will be rendered in the `ViewContainer` component. The view corresponding to the current matching route will be rendered in place of the Outlet component, e.g. if navigating to `/cell-efp/` the `CellEFP` view will be rendered. Note that changing and interacting with views does **not** trigger a re-render of the entire application, preserving the "Reacty" behaviour that is desired.

### View Actions

StateActions define a function which takes in a viewState object and returns a mutated version of the object depending on the function of the action. Each StateAction object also defines some metadata and an icon for rendering as clickable elements.

```
export type StateAction<T> = {
  name: string
  description: string
  mutation: (prevState: T, ...args: any[]) => T
  icon: JSX.Element
}
```

## States and Data

### Atoms

ePlant uses Jotai for global states, such as “darkMode,” “sidebar open,” etc. For view-specific states, however, we rely on React Query and URLState (Zod-based).

### React Query

[React Query](https://tanstack.com/query/latest/docs/framework/react/overview), a popular data-fetching library that provides a standardized way of dealing with data fetching and error handling that is easy to maintain. Views will define a data-loader function and a key for the specific query. This key will typically be `${view.id}-${geneticElement?.id}` for most views, although some views may not need fresh data for different loaded genes (i.e. the Chromosome View). This loader and key will be passed to the `useQuery` hook which will asynchronously fetch the data while providing the current state of fetching as well as error status. This loading status can be passed back to the ViewContainer via the `setLoading` callback function. See an example of the useQuery hook in the CellEFP view:

```
  const { data, isLoading, isError, error } = useQuery<CellEFPViewerData>({
    queryKey: [`cell-efp-${geneticElement?.id}`],
    queryFn: async () => {
      return cellEFPLoader(geneticElement, setLoadAmount)
    },
  })
```

As you can see the queryFn is just a thin wrapper around `cellEFPLoader`:

```
export const cellEFPLoader = async (
  geneticElement: GeneticElement | null,
  loadEvent: (loaded: number) => void
) => {
  if (!geneticElement) throw ViewDataError.UNSUPPORTED_GENE
  let totalLoaded = 0
  const viewData = await CellEFPDataObject.getInitialData(
    geneticElement,
    (progress) => {
      totalLoaded += progress
      loadEvent(totalLoaded)
    }
  )

  return {
    viewData: viewData,
  }
}
```

### URL State Encoding

To allow a user to share a direct link that reconstructs the exact view state (including e.g. active tabs, pan/zoom, color modes, etc.), we incorporate Zod schemas to parse and validate URL query params for each view.

1. Zod – A schema definition library that ensures any incoming URL params are safe and valid.
2. useURLState – A custom hook that pairs Zod with React Router to keep the view’s state in sync with the URL’s `search params`.

With the use of Zod, each view will define a **State Schema** which not only defines the type of each member in the view's state object, but also can define constraints (i.e. minimums and maximums), as well as default values.

```
export const EFPViewerStateSchema = z.object({
  activeView: z.string().default(''),
  colorMode: z.enum(['absolute', 'relative']).default('absolute'),
  transform: z.object({
    offset: z.object({
      x: z.number().default(0),
      y: z.number().default(0),
    }),
    zoom: z.number().min(0.25).max(4).default(1),
  })
  ,
  sortBy: z.enum(['name', 'expression-level']).default('name'),
  maskingEnabled: z.boolean().default(false),
  maskThreshold: z.number().default(100),
  maskModalVisible: z.boolean().default(false),
})
```

Above is an example of the View State Schema for EFPViewer views (this is shared between the Plant eFP and Experiment eFP views). As you can see, schema definition is very similar to Type definition, but allows for the definition of constraints and default values.

Note that the following would also be a valid definition of the same schema, meaning complex schemas can be broken up for readability:

```
import { z } from 'zod'

const transformSchema = z.object({
  offset: z.object({
    x: z.number().default(0),
    y: z.number().default(0),
  }),
  zoom: z.number().min(0.25).max(4).default(1),
})

export const EFPViewerStateSchema = z.object({
  activeView: z.string().default(''),
  colorMode: z.enum(['absolute', 'relative']).default('absolute'),
  transform: transformSchema,
  sortBy: z.enum(['name', 'expression-level']).default('name'),
  maskingEnabled: z.boolean().default(false),
  maskThreshold: z.number().default(100),
  maskModalVisible: z.boolean().default(false),
})
```

Zod also allows for easy type inference meaning that we can quickly define a Typescript type from the schema object without having to have redundant typing.

```
export type EFPViewerState = z.infer<typeof EFPViewerStateSchema>

// This is equivalent to:
type ColorMode = 'absolute' | 'relative'
type EFPViewerSortTypes = 'expression-level' | 'name'

export type EFPViewerState = {
  activeView: string
  transform: Transform
  colorMode: ColorMode
  sortBy: EFPViewerSortTypes
  maskingEnabled: boolean
  maskModalVisible: boolean
  maskThreshold: number
}
```

### URL State Context Management

In order to synchronize view state with URL query parameters, we use the `URLStateProvider` context manager. This will wrap the `ViewContainer` component (responsible for rendering views) and will provide three pieces of context to each view:

1. Active State
   - The active state object for the loaded view
   - Will have the type corresponding to the view's defined view state type
   - Will be guarenteed to be valid as defined by the view state schema
2. Set State Function
   - Similar to the setState function provided by React's useState hook, this function will be used to update the active view's state.
   - This will also expect a state object of the corresponding view state type
   - This **will not** validate the incoming state object, each view will be responsible for validating state changes before setting the state.
3. Initialize State Function
   - This function takes a zod schema object is responsible for initializing the active view's state, either recovering the saved state from earlier, or reading and validating state from the supplied query params.
   - Views will need to call this function on-mount to ensure that the active state is correctly updated. The easiest way to do this is via a useEffect.

These pieces of context can be accessed via the `useURLState` hook, which will be called by each view. From a developer's perspective, each new view will need to call `useURLState` and call `initializeState` in a useEffect. From there, state updates will be synchronized with search params, allowing for link sharing as desired.

The following is an example of the `useURLState` hook is used, and how a view will call the `initializeState` function on component mount.

```
export const CellEFPView = () => {
  const { state, setState, initializeState } = useURLState<CellEFPViewerState>()
  ...

  useEffect(() => {
    // On mount, initialize state
    initializeState(CellEFPStateSchema)
  }, [])
  ...
}
```

Any update to the state can be done using the `setState` function. Using this `setState` function, all changes to the view state will automatically be synced with the url search params, allowing for link sharing of exact view states.

## Creating a New View (Tutorial)

### Defining Types

A new view will need to define several different types to specify the shape of data that it will be using. The key types will be its `Data` type and its `State` type.

The `Data` type will be the type of the data which the view fetches from its corresponding backend. There has been no change to the definition of thee types, they are defined in the same way.

The `State` defines the shape of the object encoding the view's state. Unlike `Data` types which can be defined using Typescript's typing system, `State` types are defined using Zod's schema definition Since view state can be "user defined" via url query params, Zod is necessary for defining constraints and default values to state, to ensure that any passed values are handled gracefully.

```
// Another example of Zod schema definition
// See that we can define schemas with arbitrarily nested object, numbers, strings and more.

export const TutorialViewStateSchema = z.object({
  transform: z.object({
    offset: z.object({
      x: z.number().default(0),
      y: z.number().default(0),
    }),
    zoom: z.number().min(0.25).max(4).default(1),
  }),
  count: z.number().min(0).default(0),
  colour: z.enum(['red', 'blue', 'green']).default('red'),
})

// Directly infering Typescript type from Zod schema

export type TutorialViewState = z.infer<typeof TutorialViewStateSchema>

/*
The TutorialViewState type will look like this

{
  transform: {
    offset: {
      x: number,
      y: number,
    },
    zoom: number,
  },
  count: number
  colour: 'red' | 'blue' | 'green'
}
*/
```

### Creating the ViewMetadata Object

Example ViewMetadata object for our new Tutorial View

```
const TutorialView: ViewMetadata<TutorialViewData, TutorialViewState> = {
  id: 'tutorial',
  name: 'Tutorial View',
  icon: () => <TutorialViewIcon />,
  citation: () => <TutorialViewCitations/>
  actions: [
    {
      name: 'Change Colour',
      description: 'Change view colour',
      icon: <PaintBucketIcon />,
      mutation: (prevState, newColour) => ({
        ...prevState,
        colour: newColour,
      }),
    },
  ],
}
```

In this example, our view would have one StateAction, which changes the `colour` field in the view state.

### Creating the View Component

A new view will need a component which can be rendered within `ViewContainer` and will need a few new bits of boilerplate to interface with the rest of the ePlant application.

There are 5 important parts which must be included in most views (in the case that a view has no state, the state related parts can be ommitted.)

1. **A call to useOutletContext**
   - This allows the view to access the active geneticElement, as well as communicate its loading status to `ViewContainer`
2. **A call to useURLState**
   - This provides access to the view state and state setter functions
   - Also provides access to the initializeState function for initializing the view state on component mount
3. **A call to useQuery**
   - Fetches data from the view's corresponding backend and stores it in a key-value store.
   - Allows for data to be cached and accessed **globally**.
4. **A call to initializeState**
   - As mentioned above, initializeState must be called on component mount, the easiest way to achieve this is with a useEffect with an empty dependency array.
   - This function takes the Zod schema which defines the view state.
5. **Setting load status**
   - In another useEffect, setting `isLoading` is necessary to communicate the loading status of the useQuery fetch.
   - Note that `isLoading` is a variable that is provided by the useQuery hook which provides loading status

```
export const TutorialView = () => {

  // 1. useOutletContext Call
  const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()

  // 2. useURLState call
  const { state, setState, initializeState } = useURLState<TutorialViewState>()

  // 3. useQuery Call
  const { data, isLoading, isError, error } = useQuery<TutorialViewData>({
    queryKey: [`tutorial-${geneticElement?.id}`],
    queryFn: async () => {
      return tutorialViewLoader(geneticElement, setLoadAmount)
    },
  })

  // 4. Initialize State call
  useEffect(() => {
    // On mount, initialize state
    initializeState(TutorialViewStateSchema)
  }, [])

  // 5. Setting load status
  useEffect(() => {
    setIsLoading(isLoading)
  }, [isLoading])
  ...
  // The rest of your view component logic and rendering here
}
```

### Final Steps

The last two things that need to be done are adding your view to the `userViewMetadata` array in `config.tsx` and adding a new Route for your view in `main.tsx`.

#### Adding Metadata

```
// List of views that a user can select from
// Can contain views from the genericViews list too
const userViewMetadata = [
  GetStartedView,
  GeneInfoView,
  PublicationViewer,
  PlantEFP,
  CellEFP,
  ExperimentEFP,
  ChromosomeViewerObject,
  TutorialViewMetadata
]
```

#### Adding a New Route

```
const router = createBrowserRouter([
  {
    path: '/',
    element: <Eplant />,
    children: [
      {
        element: <Navigate to={'gene-info/'} replace={true}></Navigate>,
        index: true,
      },
      {
        path: 'cell-efp/:geneid?',
        element: <CellEFPView></CellEFPView>,
      },
      {
        path: 'publications/:geneid?',
        element: <PublicationsView></PublicationsView>,
      },
      {
        path: 'chromosome/:geneid?',
        element: <ChromosomeView></ChromosomeView>,
      },
      {
        path: 'plant-efp/:geneid?',
        element: <PlantEFP></PlantEFP>,
      },
      {
        path: 'tissue/:geneid?',
        element: <ExperimentEFP></ExperimentEFP>,
      },
      {
        path: 'gene-info/:geneid?',
        element: <GeneInfoView></GeneInfoView>,
      },
      {
        path: 'get-started/:geneid?',
        element: <GetStartedView></GetStartedView>,
      },
      {
        path: 'tutorial/:geneid?',
        element: <TutorialView></TutorialView>,
      }
    ],
    errorElement: <ErrorBoundary></ErrorBoundary>,
  },
])
```

Congratulations, you have successfully created a new view!

## `config.ts` file

The config.ts file in your project is responsible for defining the configuration settings for the Eplant application. It sets up the context and provides default configurations for the views available in the application. Here's a detailed breakdown of its components and how it can be used:

### Breakdown of `config.ts`

1. Imports:

- The file imports various view components such as `CellEFP`, `DebugView`, `ExperimentEFP`, etc., which are likely different parts of the application that users can interact with.
- It also imports `createContext` and `useContext` from React to manage the configuration context.

2. EplantConfig Type:

- This is a TypeScript type that defines the structure of the configuration object. It includes:
  - `genericViews`: Views not associated with individual genes.
  - `userViews`: Views that a user can select from, which may include generic views.
  - `views`: A combined list of all views.
  - `rootPath`: The base URL for the application.
  - `defaultView`: The default view to be displayed.
  - `defaultSpecies`: The default species, which is currently an empty string.

3. View Lists:

- `genericViewMetadata`: Contains views like `GetStartedView` and `FallbackView`.
- `userViewMetadata`: Contains views like `GeneInfoView`, `PublicationViewer`, and others.
- `views`: A combination of `genericViews` and `userViews`.

4. Default Configuration:

- `defaultConfig` is an object that holds the default settings for the application, including the lists of views and other configuration details.

5. Context Creation:

- `Config` is a React context created using `createContext`, initialized with `defaultConfig`.
- `useConfig` is a custom hook that uses `useContext` to provide access to the configuration context.

### Usage

- Accessing Configuration:

  - You can use the `useConfig` hook in your React components to access the configuration settings. This allows components to dynamically adjust based on the configuration, such as determining which views are available or what the default view should be.
  - Example Usage in a Component:

  ```
  import React from 'react';
  import { useConfig } from './config'

  const MyComponent = () => {
    const { views, defaultView } = useConfig();

    return (
      <div>
        <h1>Default View: {defaultView}</h1>
        <ul>
          {views.map((view) => (
            <li key={view.id}>{view.name}</li>
          ))}
        </ul>
      </div>
    );
  };

  export default MyComponent;
  ```

  This example demonstrates how to use the `useConfig` hook to access the list of views and the default view, which can then be rendered in a component.

  or, you can also use

  ```
  import { useConfig } from './config'
  const config = useConfig()
  ```

  so that you can access the`config` using `config.defaultView`, for example.

## Documentation and Commenting Style

It is important to maintain a common standard for commenting code and documentation. If you want to make contributions to the project, we ask that you follow the TSdoc(typescript) commenting style. As an example this includes adding function/class headers and comments as seen below:

```
/**
 * Extracts the species name from the API URL
 *
 * @param url - The complete API URL containing query parameters
 * @returns The species name, or an empty string if not found
 *
 * Uses regex to find the species parameter in the URL
*/
export const extractSpecies = (url: string): string => {
  const match = url.match(/species=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}
```

## ESlint Code Standards

The codebase relies on ESlint to handle automatic checking for issues with the code. With ESlint, you will not need to manually parse all of your code for accurate documentation, imports order, etc. When running ePlant locally in a browser, if there are any outstanding issues, it will be made known to you automatically. A common way to fix any issues without much thought is to run `npx eslint . --fix`. The `.` can be replaced if you do not want to check and fix every file in your current working directory. Documentation issues are not as big of a concern as others and your local site may work as normal, but to keep in line with our standards, please resolve any issues and warnings before making a pull request.

## Local Testing Requirements

To allow ESlint to work, and to run the site locally you are required to install Node.js and NPM on your system. Once installed, you can activate a local connection to the site using `npm run dev` and connecting to the generated web access point.

## Eplant2

https://bar.utoronto.ca/eplant/

### API

> [!IMPORTANT]
> It is not the smartest approach, but please use the browser's Developer Console and poke around ePlant2 to find the BAR APIs that you need to call.
