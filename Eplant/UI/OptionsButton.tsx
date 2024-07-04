import { MouseEvent } from 'react'

import { MoreVert } from '@mui/icons-material'
import { IconButton, IconButtonProps } from '@mui/material'

export default function OptionsButton({
  onClick,
  ...props
}: {
  onClick: (e: MouseEvent<HTMLElement>) => void
} & IconButtonProps) {
  return (
    <IconButton onClick={onClick} {...props}>
      <MoreVert />
    </IconButton>
  )
}
