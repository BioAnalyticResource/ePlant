// import useStateWithStorage from '@eplant/util/useStateWithStorage'
import Sidebar from './UI/Sidebar'
import EplantLayout from './EplantLayout'
import DirectPane from './DirectPane'
import { Route, Routes } from 'react-router-dom'
import { useConfig } from './config'
import {
  useDarkMode
} from './state'

export type EplantProps = Record<string, never>

export default function Eplant() {
  const { rootPath } = useConfig()
  const [darkMode, setDarkMode] = useDarkMode()

  return (
    <Routes>
      <Route path={rootPath}>
        <Route index element={<MainEplant />} />
        <Route path='pane' element={<DirectPane />} />
      </Route>
    </Routes>
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
