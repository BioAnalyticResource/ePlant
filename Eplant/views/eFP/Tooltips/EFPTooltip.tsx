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
import React from 'react'
import { EFPGroup, EFPTissue, EFPData, EFPState } from '../types'

export const setStroke = (
  el: Element | null,
  colour: string,
  width: string,
) => {
  // For multigroup SVGs, recursively sets stroke of all path elements
  if (el) {
    if (el.firstElementChild?.children.length === 0) {
      for (const child of el.children) {
        child.setAttribute('stroke-width', width)
        child.setAttribute('stroke', colour)
      }
    } else {
      for (const child of el.children) {
        setStroke(child, colour, width)
      }
    }
  }
}

function SVGTooltip(props: {
  el: SVGElement | null
  group: EFPGroup
  tissue: EFPTissue
  data: EFPData
  state: EFPState
}) {
  const [open, setOpen] = React.useState(false)
  const theme = useTheme()
  React.useEffect(() => {
    const enterListener = () => {
      setOpen(true)
      setStroke(props.el, theme.palette.secondary.contrastText, '1.5')
      // props.el?.firstElementChild?.setAttribute('stroke-width', '1.5')
      // props.el?.firstElementChild?.setAttribute(
      //   'stroke',
      //   theme.palette.secondary.contrastText,
      // )
    }
    const leaveListener = () => {
      setOpen(false)
      setStroke(props.el, theme.palette.secondary.dark, '0.5')
      // props.el?.firstElementChild?.setAttribute('stroke-width', '0.5')
      // props.el?.firstElementChild?.setAttribute(
      //   'stroke',
      //   theme.palette.secondary.dark,
      // )
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
  }, [props.el])
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
            })}
          >
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell
                    sx={{
                      color: theme.palette.secondary.main,
                      textAlign: 'right',
                    }}
                  >
                    Sample name
                  </TableCell>
                  <TableCell>{props.tissue.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      color: theme.palette.secondary.main,
                      textAlign: 'right',
                    }}
                  >
                    Level
                  </TableCell>
                  <TableCell>
                    {props.tissue.mean.toFixed(2)}±{props.tissue.std.toFixed(2)}
                  </TableCell>
                </TableRow>
                {props.state.colorMode == 'relative' ? (
                  <>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: theme.palette.secondary.main,
                          textAlign: 'right',
                        }}
                      >
                        Samples
                      </TableCell>
                      <TableCell>{props.tissue.samples}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: theme.palette.secondary.main,
                          textAlign: 'right',
                          borderBottom: 'none',
                        }}
                      >
                        Log2 fold change vs control
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        {Math.log2(
                          props.tissue.mean / (props.data.control ?? 1),
                        ).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: theme.palette.secondary.main,
                          textAlign: 'right',
                          borderBottom: 'none',
                        }}
                      >
                        Samples
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        {props.tissue.samples}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </Box>
        </Grow>
      )}
    </Popper>
  )
}

export default SVGTooltip
