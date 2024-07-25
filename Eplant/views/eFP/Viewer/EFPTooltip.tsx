import { useEffect, useState } from 'react'

import {
  Box,
  Grow,
  Popper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  useTheme,
} from '@mui/material'

import { EFPData, EFPGroup, EFPState, EFPTissue } from '../types'

export const setStroke = (el: Element | null, color: string, width: string) => {
  // For multigroup SVGs, recursively sets stroke of all path elements
  if (el) {
    if (el.firstElementChild?.children.length === 0) {
      for (const child of el.children) {
        child.setAttribute('stroke-width', width)
        child.setAttribute('stroke', color)
      }
    } else {
      for (const child of el.children) {
        setStroke(child, color, width)
      }
    }
  }
}

function KeyValueRow(props: { label: string; value: string | number }) {
  return (
    <TableRow>
      <TableCell
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          textAlign: 'left',
          border: 'none',
          paddingTop: 0,
          paddingBottom: 0,
        })}
      >
        {props.label}
      </TableCell>
      <TableCell
        sx={(theme) => ({
          color: theme.palette.text.primary,
          textAlign: 'right',
          border: 'none',
          paddingTop: 0,
          paddingBottom: 0,
        })}
      >
        {props.value}
      </TableCell>
    </TableRow>
  )
}

function SVGTooltip(props: {
  el: SVGElement | null
  group: EFPGroup
  tissue: EFPTissue
  data: EFPData
  state: EFPState
}) {
  const [open, setOpen] = useState(false)
  const theme = useTheme()
  useEffect(() => {
    const enterListener = () => {
      setOpen(true)
      setStroke(props.el, theme.palette.secondary.contrastText, '1.5')
    }
    const leaveListener = () => {
      setOpen(false)
      setStroke(props.el, theme.palette.secondary.dark, '0.5')
    }
    if (props.el) {
      props.el.addEventListener('mouseenter', enterListener)
      props.el.addEventListener('mouseleave', leaveListener)
      return () => {
        if (props.el) {
          props.el.removeEventListener('mouseenter', enterListener)
          props.el.removeEventListener('mouseleave', leaveListener)
          setOpen(false)
        }
      }
    }
  }, [props.el, theme])
  return (
    <Popper transition anchorEl={props.el} open={open}>
      {({ TransitionProps }) => (
        <Grow {...TransitionProps} timeout={350}>
          <Box
            sx={(theme) => ({
              backgroundColor: theme.palette.background.transparentOverlay,
              backdropFilter: 'blur(7px)',
              boxShadow: theme.shadows[3],
              borderRadius: 1,
              paddingBottom: 1.5,
            })}
          >
            <Table size='small'>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={2}
                    sx={{
                      fontSize: 'medium',
                      fontWeight: '500',
                      border: 'none',
                    }}
                  >
                    {props.tissue.name}
                  </TableCell>
                </TableRow>
                <KeyValueRow
                  label='Level'
                  value={`${props.tissue.mean.toFixed(
                    2
                  )}±${props.tissue.std.toFixed(2)}`}
                />
                <KeyValueRow
                  label='Log2 fold change vs control'
                  value={Math.log2(
                    props.tissue.mean / (props.data.control ?? 1)
                  ).toFixed(2)}
                />
              </TableBody>
            </Table>
          </Box>
        </Grow>
      )}
    </Popper>
  )
}

export default SVGTooltip
