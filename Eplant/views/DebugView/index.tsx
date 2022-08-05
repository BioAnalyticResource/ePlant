import { useViewID } from '@eplant/state'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import React from 'react'
import { View } from '../View'

type DebugViewData = {
  testToggle: boolean
}

type DebugViewAction = { type: 'test-toggle' }

const DebugView: View<DebugViewData, DebugViewAction> = {
  name: 'Debug view',
  component: (props) => {
    const viewID = useViewID()
    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Toggle value</TableCell>
              <TableCell>
                {props.activeData.testToggle ? 'true' : 'false'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>View ID</TableCell>
              <TableCell>{viewID}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Button onClick={() => localStorage.clear()}>Wipe localstorage</Button>
      </div>
    )
  },
  getInitialData: async () => ({
    testToggle: false,
  }),
  reducer: (state, action) => {
    switch (action.type) {
      case 'test-toggle':
        return {
          ...state,
          testToggle: !state.testToggle,
        }
      default:
        return state
    }
  },
  actions: [
    {
      action: { type: 'test-toggle' },
      render(props) {
        return <>{props.activeData.testToggle ? 'Turn off' : 'Turn on'}</>
      },
    },
  ],
  id: 'debug-view',
}

export default DebugView
