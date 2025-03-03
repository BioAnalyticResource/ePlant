# **Major Change - Routing**

## Introduction

This Pull Request includes the implementation of a major feature (routing) along with some more large scale changes that will affect the user and developer experience. The intention of these changes are to:

1. Provide a modern routing solution to ePlant3 which not only supports view navigation through the URL but also allows for full encoding of the view's state in the URL.
2. Bring parts of the application more in-line with standard React practive (i.e. breaking the views into components rather than objects)
3. Replace some hand-rolled code with easier to maintain libraries which significantly reduce maintainance burden.

ePlant3 was created with a design philosophy which emphasized the importance of the developer experience. It was designed in a way which minimized the amount of code required to be modified by a developer creating a new view, allowing the developer to focus solely on ensuring that their view behaved as intended, only needing to worry about conforming to the `View` interface, and nothing more.

This change intends to preserve this philosophy to the best of its ability. There will be slightly more required of new developers in terms of implementing new views, however these remain quite minimal, and can sufficiently described in supplementing documentation.

This document intends to provide an overview of each of the major changes, as well as a comparison between "old" and "new" ePlant, from the perspectives of both the developer and the user.

## Views Old vs. New

The old method of implementing a view involved creating a Javascript object which implemented the `View` interface (see [here](https://github.com/BioAnalyticResource/ePlant/blob/b45ce9f09b1c5ada57b6c63125e6fc1a992e6c8d/Eplant/View/index.ts#L20)). This interface would define a view's data fetching (via the `getInitialData` function), its initial state, as well as the component to be rendered when the view is active. While useful for defining a standard interface for how view's interact with the rest of the application, it was very abnormal for a React applciation to define its components in this way, leading to confusion for developers when being onboarded. This method of defining views also limited the flexibility of the potential routing options that could be pursued, because of this, a slightly more orthodox approach to creating views has been implemented in this change.

**Views are Components**

Views are now defined as standard React components which are responsible for all of their own data fetching and state management. These components will be defined as sub-routes under a parent route which renders the top level `Eplant` component. Each subroute will be rendered via the ReactRouterDOM [Outlet component](https://api.reactrouter.com/v7/functions/react_router.Outlet.html) which will be rendered in the `ViewContainer` component. The view corresponding to the current matching route will be rendered in place of the Outlet component, e.g. if navigating to `/cell-efp/` the `CellEFP` view will be rendered. Note that changing and interacting with views does **not** trigger a re-render of the entire application, preserving the "Reacty" behaviour that is desired.

**Views Interact with ViewContainer via useOutletContext**

Since views no longer follow a defined interface, interaction with ViewContainer must be done by passing callback functions to the view which it can use to communicate data loading status and set its view actions (more on these later). Since view can no longer take arguments directly, this is achieved by passing props to the `Outlet` component and receiving them via the `useOutletContext` hook provided by ReactRouterDOM.

```
const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()
```

As you an see there are 3 key props that will be passed to every view, the currently active geneticElement, as well as the setIsLoading and setLoadAmount callbacks. The latter two callbacks should be used by the view's dataloaders to indicate loading status.

**View Objects for Metadata**

While the bulk of what defines a view has been moved to components, view objects remain as a way of defining metadata for each view. The ViewMetadata object interface now only requires an id, full name, description, citation, icon and actions for the view.

See an example of the CellEFP ViewMetadata object

```
const CellEFP: ViewMetadata<CellEFPViewerData, CellEFPViewerState> = {
  id: 'cell-efp',
  name: 'Cell eFP',
  icon: () => <CellEFPIcon />,
  citation() {
    ....
  },
  actions: [
    {
      name: 'Reset Pan/Zoom',
      description: 'Reset the pan and zoom of the viewer',
      icon: <YoutubeSearchedForRoundedIcon />,
      mutation: (prevState) => ({
        ...prevState,
        transform: {
          offset: {
            x: 0,
            y: 0,
          },
          zoom: 1,
        },
      }),
    },
  ],
}
```

**View Actions**

Previously each view would define "Actions" and "Reducers" for state manipulation. These actions would modify the view's current state and could be accessed via a "View Options" dropdown on the topbar. To keep this behaviour standardized, the idea of StateActions are retained and will be defined in each view's ViewMetaData object. StateActions define a function which takes in a viewState object and returns a mutated version of the object depending on the function of the action. Each StateAction object also defines some metadata and an icon for rendering as clickable elements.

```
export type StateAction<T> = {
  name: string
  description: string
  mutation: (prevState: T, ...args: any[]) => T
  icon: JSX.Element
}
```

**Data Loading with ReactQuery**

Previously, views would define a `getInitialData` function which would be invoked in the `ViewContainer` to fetch and pass the necessary data to the rendered view component. This data would be stored in the browser's [Indexed DB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for persistance across tabs and sessions. While this method of retrieving and storing data worked in the past, there were many problems with properly invalidating the IndexDB store when updating the application, leading to some friction for developers as they would need to manually clear this cache in their browser when testing changes to data fetching.

To replace this hand-rolled approach, this change introduces the use of [React Query](https://tanstack.com/query/latest/docs/framework/react/overview), a popular data-fetching library that provides a standardized way of dealing with data fetching and error handling that will be much easier to maintain. Views will define a data-loader function (replacing its getInitialData function) and a key for the specific query. This key will typically be `${view.id}-${geneticElement?.id}` for most views, although some views may not need fresh data for different loaded genes (i.e. the Chromosome View). This loader and key will be passed to the `useQuery` hook which will asynchronously fetch the data while providing the current state of fetching as well as error status. This loading status can be passed back to the ViewContainer via the `setLoading` callback function. See an example of the useQuery hook in the CellEFP view:

```
  const { data, isLoading, isError, error } = useQuery<CellEFPViewerData>({
    queryKey: [`cell-efp-${geneticElement?.id}`],
    queryFn: async () => {
      return cellEFPLoader(geneticElement, setLoadAmount)
    },
  })
```

As you can see the queryFn is just a thin wrapper around `cellEFPLoader` which is identical to the `getInitialData` function present in the CellEFP view in v1:

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

## URL State Encoding

The largest feature added in this change is the addition of dynamic view state encoding
into the URL in the form of URL query parameters. With the addition of routing, links
can now be shared which allow for the full reconstruction of an exported view state,
including the active gene, active view and full view state. To integrate this feature
elegantly into ePlant, two key bits of functionality were necessary; automated query
parameter validation, and state context management. The proposed solution requires minimal repeated work when developing new views, and is powerful enough to accomodate for complex view states, which can include nested object structures.

**Query Parameter Validation**

Allowing for URL state encoding implicitly allows the user to pass in arbitrarily
structured query parameters which necessitates some form of validation. To enforce a
standard way for handling validation, this PR introduces the use of [Zod](https://zod.dev/),
a powerful validation library which makes graceful handling of query parameters easy and
efficient. The main change to ePlant that this brings is the definition of viewState. Previously,
each view would define its own State Type, which would define the state belonging to each view.
With the introduction of Zod, each view will define a **State Schema** which not only defines the
type of each member in the view's state object, but also can defines, constraints (i.e. minimums and maximums),
as well as default values.

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

Above is an example of the View State Schema for EFPViewer views (this is shared between the Plant eFP and Experiment eFP views). As you can see, schema definition is very similar to Type definition, but allows for the definition of constraints and defulat values.

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

**URL State Context Management**

In order to synchronize view state with URL query parameters, this change introduces the `URLStateProvider` context manager. This will wrap the `ViewContainer` component (responsible for rendering views) and will provide three pieces of context to each view:

1. Active State
   - The active state object for the loaded view
   - Will have the type corresponding to the view's defined view state type
   - Will be guarenteed to be valid as defined by the view state schema
2. Set State Function
   - Similar to the setState function provided by React's useState hook, this function will be used to update the active view's state.
   - This will also expect a state object of the corresponding view state type
   - This **will not** validate the incoming state object, each view will be responsible for validating state changes before setting the state (this was also true pre-routing changes).
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

From this point, the `state` variable can be used in the same way that it is used before the routing changes. Any update to the state can be done using the `setState` function. This means that any state setting that was previously performed using reducer functions should now be done using this setState function. Using this `setState` function, all changes to the view state will automatically be synced with the url search params, allowing for link sharing of exact view states.

## Creating a New View (Tutorial)

Given the changes, the developer process for view creation has changed slightly. This short tutorial will provide a more clear understanding of what is necessary to create a new view.

### Defining Types

Similar to in the past, a new view will need to define several different types to specify the shape of data that it will be using. The key types will be its `Data` type and its `State` type.

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

As mentioned above, a majority of View functionality has been moved to a functional component form, despite this, the `View` object remains, now called the `ViewMetadata` object, which as the name suggests, holds metadata about the view which can be accessed by the rest of the application.

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

As you can see, the ViewMetadata interface is significanly smaller than before, without any new field additions. All remaining fields are used the same as in the old `View` object definition, with the `actions` field. In this example, our view would have one StateAction, which changes the `colour` field in the view state.

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
   - Note that the function
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

**Adding metadata**

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

**Adding new Route**

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
