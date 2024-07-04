import { forwardRef, PropsWithChildren, ReactElement, Ref } from 'react'

import { Dialog, Slide } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>
  },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export default function Modal(
  props: PropsWithChildren<{
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
