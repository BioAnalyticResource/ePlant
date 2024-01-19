
import {Drawer, DrawerProps} from '@mui/material'
import {useState} from 'react'

const ResponsiveDrawer = (props: DrawerProps) => {
  const [open, setOpen] = useState(props.open);

  return (
    <Drawer 
      {...props} 
      open={open} 
      onClose={() => setOpen(false)}>
      {props.children}
    </Drawer>
  )
}

export default ResponsiveDrawer