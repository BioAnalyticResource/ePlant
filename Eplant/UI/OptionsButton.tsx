import { MoreVert } from '@mui/icons-material'
import { IconButton, IconButtonProps } from '@mui/material'
import React from 'react'

export default function OptionsButton({
  onClick,
  ...props
}: {
  onClick: (e: React.MouseEvent<HTMLElement>) => void
} & IconButtonProps) {
  return (
    <IconButton onClick={onClick} {...props}>
      <MoreVert />
    </IconButton>
  )
}
