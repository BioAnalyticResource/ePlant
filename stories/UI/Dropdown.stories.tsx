import * as React from 'react'
import { ComponentMeta } from '@storybook/react'
import Dropdown from '@eplant/UI/Dropdown'
import { MenuItem } from '@mui/material'

export const Default = () => (
  <Dropdown
    options={[
      <MenuItem key={0} onClick={() => console.log('clicked')}>
        test
      </MenuItem>,
    ]}
  >
    Dropdown test
  </Dropdown>
)
export const Secondary = () => (
  <Dropdown
    color="secondary"
    variant="outlined"
    options={[
      <MenuItem key={0} onClick={() => console.log('clicked')}>
        test
      </MenuItem>,
    ]}
  >
    Dropdown test
  </Dropdown>
)

export default {
  title: 'Dropdown',
  component: Dropdown,
} as ComponentMeta<typeof Dropdown>
