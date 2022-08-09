import { useViewID } from '@eplant/state'
import { BugReport, BugReportOutlined } from '@mui/icons-material'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'
import EFPPreview from '../eFP/EFPPreview'
import { AtGenExpress } from '../PlantEFP'
import { View } from '../../View'
import { viewDataStorage } from '@eplant/View/viewData'

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
        <Button onClick={() => viewDataStorage.clear()}>Wipe view data</Button>
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
  header: ({ geneticElement }) => (
    <Typography variant="h6">Debug view for {geneticElement?.id}</Typography>
  ),
  icon: () => <BugReportOutlined />,
}

export default DebugView
