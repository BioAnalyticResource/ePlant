// import useStateWithStorage from '@eplant/util/useStateWithStorage'

import { createContext, useState } from 'react';
import { Route, Routes } from 'react-router-dom'

import { CssBaseline, ThemeProvider } from '@mui/material'

import { dark, light } from './css/theme'
import Sidebar from './UI/Sidebar'
import { useConfig } from './config'
import DirectPane from './DirectPane'
import EplantLayout from './EplantLayout'
import { useDarkMode } from './state'
export type EplantProps = Record<string, never>
export default function Eplant() {
  const { rootPath } = useConfig()
  const [darkMode] = useDarkMode()

  return (
    <ThemeProvider theme={darkMode ? dark : light}>
      <CssBaseline />
      <Routes>
        <Route path={rootPath}>
          <Route index element={<MainEplant />} />
          <Route path='pane' element={<DirectPane />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}
/**
 * The main Eplant component. This is the root of the application. It contains the left nav and the layout.
 * @returns {JSX.Element} The rendered Eplant component
 */

// createContext type
export type CollapseContent = {
  collapse: boolean,
  setCollapse: (c: boolean) => void
}

// exporting the createContext
export const collapseContext = createContext<CollapseContent>({
  collapse: false,
  setCollapse: () => { }
})

// Adding context to SideBar and EplantLayout children
export function MainEplant() {
  const [collapse, setCollapse] = useState(false)
  return (
    <>
      <collapseContext.Provider value={{ collapse: collapse, setCollapse: setCollapse }}>
        <Sidebar />
        <EplantLayout />
      </collapseContext.Provider >
    </>
  )
}
