// import useStateWithStorage from '@eplant/util/useStateWithStorage'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { Route, Routes } from 'react-router-dom'
import DirectPane from './DirectPane'
import EplantLayout from './EplantLayout'
import Sidebar from './UI/Sidebar'
import { useConfig } from './config'
import { dark, light } from './css/theme'
import {
  useDarkMode
} from './state'
export type EplantProps = Record<string, never>
export default function Eplant() {
  const { rootPath } = useConfig()
  const [darkMode, setDarkMode] = useDarkMode()

  return (
    <ThemeProvider theme={darkMode ? dark : light}>
      <CssBaseline/>
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
export function MainEplant() {
  return (
    <>
      <Sidebar />
      <EplantLayout />
    </>
  )
}
