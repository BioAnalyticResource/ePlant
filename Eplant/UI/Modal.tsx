import { Dialog, Slide } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import {forwardRef} from 'react'

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function Modal(
  props: React.PropsWithChildren<{
    open: boolean
    onClose: () => void
  }>
) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      TransitionComponent={Transition}
      sx={{
        p: 2,
      }}
    >
      {props.children}
    </Dialog>
  )
}
