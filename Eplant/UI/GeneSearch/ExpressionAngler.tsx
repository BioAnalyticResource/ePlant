import Dialog from '@mui/material/Dialog'
import * as React from 'react'

export default function ExpressionAngler({
  URL,
  open,
  loadGenes,
}: {
  URL: string
  open: boolean
  loadGenes: (genes: string[]) => void
}) {
  return <Dialog open={open}>{URL}</Dialog>
}
