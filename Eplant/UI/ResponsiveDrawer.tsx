import { useState } from 'react'

import { Drawer, DrawerProps } from '@mui/material'
// TODO: Make this drawer support opening/closing on mobile

const ResponsiveDrawer = (props: DrawerProps) => {
  const [open, setOpen] = useState(props.open)

  return (
    <Drawer {...props} open={open} onClose={() => setOpen(false)}>
      {props.children}
    </Drawer>
  )
}

export default ResponsiveDrawer
