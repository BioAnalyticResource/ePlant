# Tutorial <!-- omit in toc -->

- [Main Component](#main-component)
- [Eplant Layout (`Eplant/EplantLayout.tsx`)](#eplant-layout-eplanteplantlayouttsx)
  - [useViewData](#useviewdata)
- [View Interface](#view-interface)
  - [getInitialState:](#getinitialstate)
  - [getInitialData:](#getinitialdata)
  - [reducer:](#reducer)
  - [actions:](#actions)
  - [component:](#component)
  - [icon:](#icon)
  - [name:](#name)
  - [id:](#id)
  - [description:](#description)
  - [thumbnail:](#thumbnail)
  - [citation:](#citation)
  - [header:](#header)
- [state](#state)
  - [Atoms:](#atoms)
  - [Hooks:](#hooks)
  - [Simplicity:](#simplicity)
  - [Reactivity:](#reactivity)
- [When you create a new `view`](#when-you-create-a-new-view)
  - [Define GetStartedView Object:](#define-getstartedview-object)
  - [Define GetStartedView Component:](#define-getstartedview-component)
  - [Define Tile Component:](#define-tile-component)
  - [Summary](#summary)
- [`config.ts` file](#configts-file)
  - [Breakdown of `config.ts`](#breakdown-of-configts)
  - [Usage](#usage)
  - [How to create a new `View`](#how-to-create-a-new-view)
    - [Steps to Update `config.ts`](#steps-to-update-configts)
    - [Example](#example)
- [Eplant2](#eplant2)
  - [API](#api)

## Main Component

In the root(`Eplant/main.tsx`), you can see the `Eplant` component, which is our main component of our application.

`main.tsx`

```
<React.StrictMode>
  <Provider>
    <BrowserRouter>
      <Config.Provider value={defaultConfig}>
        <Eplant />
      </Config.Provider>
    </BrowserRouter>
  </Provider>
</React.StrictMode>
```

We only have one single Route which is handled by `Eplant.tsx` at the moment but we will have one Route for one component.

`Eplant.tsx`

```
<ThemeProvider theme={darkMode ? dark : light}>
  <CssBaseline />
  <Routes>
    <Route path={rootPath}>
      <Route index element={<MainEplant />} />
    </Route>
  </Routes>
</ThemeProvider>
```

Eplant app consists of `Sidebar` and `EplantLayout` as shown in `Eplant.tsx` (`Eplant/Eplant.tsx`)

```
export function MainEplant() {
  return (
    <>
      <Sidebar />
      <EplantLayout />
    </>
  )
}
```

## Eplant Layout (`Eplant/EplantLayout.tsx`)

ViewContainer (`Eplant/UI/Layout/ViewContainer/index.tsx`) hosts the actual views, and handles the viewing options available to the view. It also provides a topbar, and a preview stack if necessary.

`view` will be passed as a prop to the ViewContainer which will be rendered in

```
<view.component
    state={state}
    geneticElement={gene}
    activeData={activeData}
    dispatch={dispatch}
/>
```

### useViewData

The `useViewData` function is a custom React hook designed to manage and load view data in the application. It leverages TypeScript generics to handle different types of view data, state, and actions.

See `Eplant/View/viewData.ts` for more details.

## View Interface

Please see the `View` interface in `View/index.ts`
This is the interface we use for most of the `views`

The View interface is a TypeScript interface that defines the structure and functionality expected from a view component in a React application.

### getInitialState:

An optional method that returns the initial state of the view. If not defined, the state defaults to null.
This method initializes the state when the view is first rendered.

### getInitialData:

A required method that fetches the data needed for the view based on a given gene and provides loading feedback.

> **Error Handling:**
> This method is crucial for fetching the necessary data for views, and if it fails, it can lead to a poor user experience. Here are some points you might consider:

> **NOTE**
>
> The following code demonstrates basic error handling. It uses a `try-catch` block to catch any errors during the data fetching process, logs them, and returns a fallback value (defaultData) in case of an error. This ensures the function returns a predictable result, even if the data fetching fails.
>
> ```typescript
> getInitialData: async (
>   gene: GeneticElement | null,
>   loadEvent: (amount: number) => void
> ): Promise<Data> => {
>   try {
>     // Fetch data from an API or data source
>     const response = await fetchDataFromAPI(gene) // Replace with your data fetching logic
>
>     // Return the fetched data
>     return response.data
>   } catch (error) {
>     console.error('Error occurred while fetching data:', error)
>
>     // You can return a default value or an empty object as a fallback
>     return defaultData
>   }
> }
> ```

### reducer:

An optional reducer function used to handle actions and update the state. This is useful for managing state changes based on different actions.

### actions:

An optional array of actions that can be shown in the view’s options menu. Each action allows interaction with the view.

### component:

A required React component that renders the view.
Takes props of type `ViewProps<Data, State, Action>`.

### icon:

An optional React component that returns an icon representing the view. This is used in the gene info viewer to visually identify the view.

### name:

A required string that represents the name of the view. This is used to identify the view in various contexts.

### id:

A required string that provides a unique identifier for the view.

### description:

An optional string that provides a description of the view.

### thumbnail:

An optional string that represents the URL or path to a thumbnail image for the view.

### citation:

An optional React component that renders citations related to the gene. This helps in displaying references or additional information.
Takes props which may include state, activeData, and gene.

### header:

An optional function that returns the title of the view's tab.
Takes props of type `ViewProps<Data, State, Action>`.

## state

`state` (`Eplant/state/index.tsx`) is a React module that manages state using [`Jotai`](https://jotai.org/docs/core/use-atom)and provides various hooks and utility functions for managing application state in the application, which is similar to `Redux` and `React Hooks`.

### Atoms:

Basic units of state. An atom holds a piece of state that can be read from and written to.

### Hooks:

useAtom is used to interact with atoms, allowing components to access and update state.

### Simplicity:

Minimal boilerplate and API surface, making it easy to understand and use.

### Reactivity:

Components automatically re-render when atom state changes.

## When you create a new `view`

If you are going to a build new View, `GetStartedView` (`Eplant/views/GetStartedView/index.tsx`) is the right one to look at. (You may also use it as a template/boilerplate code to get started.)

First, create `index.tsx` by defining and exporting a View configuration object that uses the `GetStartedView` component.

### Define GetStartedView Object:

**name**: Set a descriptive name for the view ("Get started").  
**component**: Assign the GetStartedView component.  
**getInitialData**: Define a method to fetch initial data (returns null in this case).  
**id**: Assign a unique identifier ("get-started").  
**icon**: Specify an icon (HomeOutlinedIcon) for the view.

Next, create the `GetStartedView` component that serves as an introductory view, guiding users on how to interact with the application.

### Define GetStartedView Component:

**Theme**: Use useTheme hook to access the theme for styling.  
**Render Component**:  
Display introductory text about the application.
Provide instructions using Material-UI's Stack and Typography components.
Create a Grid layout to display multiple Tile components for each view, filtered by the presence of description and thumbnail.

If you need an additional component, follow `Tile.tsx`. This is used in `component.tsx`.

Create a UI component ( `Tile.tsx`) that displays a view's information and allows users to activate a specific gene and view when interacting with it.

### Define Tile Component:

**Props**: Accept a view object which includes information about the view.  
**State and Hooks**:
Use useGeneticElements, useSetActiveGeneId, and useSetActiveViewId hooks to manage genetic elements and active view/gene states.  
**`setView` Function**:
Fetch a specific gene (AT3G24650) using the arabidopsis.api.searchGene method.
Set this gene as the active gene and update the active view.  
**Render Component**:  
Use Material-UI's Card component to structure the tile, including CardMedia, CardContent, and CardActions.
Display the view's thumbnail, name, and description.
Add a button to activate the view and gene when clicked.

### Summary

1. Create `index.tsx`: An object that configures the view with the GetStartedView component and relevant metadata.
2. Create `component.tsx`: A component that provides a guide for getting started and displays a grid of Tile components.
3. Create `Tile.tsx`: A component for displaying individual view tiles with an interactive button to set active genes and views.

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

- `genericViews`: Contains views like `GetStartedView` and `FallbackView`.
- `userViews`: Contains views like `GeneInfoView`, `PublicationViewer`, and others.
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

### How to create a new `View`

You will need to update config.ts to include your new view in the appropriate lists. This ensures that your new view is recognized by the application and can be accessed by users.

#### Steps to Update `config.ts`

1. Import the New View: Add an import statement for your new view at the top of `config.ts`.
2. Add to View Lists: Include your new view in the appropriate lists (`genericViews`, `userViews`, or both) depending on its purpose.
3. Ensure Unique ID: Make sure that the id of your new view is unique within the `views` list to avoid conflicts.

#### Example

Suppose you have created a new view called NewView. Here’s how you might update `config.ts`:

```
import NewView from './views/NewView'

// Add NewView to the appropriate list
const userViews = [
  GeneInfoView,
  PublicationViewer,
  DebugView,
  PlantEFP,
  CellEFP,
  ExperimentEFP,
  NewView, // Add your new view here
]

// If NewView is a generic view, add it to genericViews as well
const genericViews = [GetStartedView, FallbackView, NewView]

// Update the views list
const views = [...genericViews, ...userViews]
```

## Eplant2

https://bar.utoronto.ca/eplant/

### API

> [!IMPORTANT]
> It is not the smartest approach, but please use the browser's Developer Console and poke around ePlant2 to find the BAR APIs that you need to call.
