This is a little map of the current (June 5 2024) component tree.

Indentation denotes nesting in the component tree.

`[]` indicates functionality that is not its own component yet.


Current layout:
```
Eplant
  Sidebar
    LeftNav
      SearchGroup
        SearchBar
      Collections
      SearchIcon
      DarkModeIcon
      [Collapse arrow]
  EplantLayout
    ViewContainer
      AppBar
        [Dropdown to select view]
        ViewOptions
        [Data sources button]
        [Download]
      Modal (to view citations)
      view.component (view sourced from, for example, views/CellEFP, index)
```

What we'd like:
```
Eplant
  Sidebar
    SearchGroup
      SearchBar
      SearchIcon
    Collections
    DarkModeIcon
    CollapseArrow
  ViewContainer
    AppBar
      ViewSelect
      ViewOptions
      DataSources
      Download
    Modal
    View (e.g. CellEFPView)
```