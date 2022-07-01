import GeneticElement from '@eplant/GeneticElement'
import { DragIndicator } from '@mui/icons-material'
import {
  Box,
  BoxProps,
  Divider,
  keyframes,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Theme,
  ThemeProvider,
  Typography,
  useTheme,
} from '@mui/material'
import React, { SVGProps, useEffect, useId, useRef, useState } from 'react'
import OptionsButton from './OptionsButton'

/**
 * Mark whether or not a genetic element component is selected
 *
 * @param {(BoxProps & { hover: boolean })} props Set hover to whether or not the genetic element component is hovered
 */
function SelectedIndicator(props: BoxProps & { hover: boolean }) {
  const theme = useTheme()
  return (
    <Box {...props} position={'relative'}>
      <Box
        position="absolute"
        sx={(theme) => ({
          left: 0,
          top: 0,
          width: props.hover ? '24px' : '16px',
          height: '24px',
          background: theme.palette.background.paper,
          transition: '0.1s ease all',
        })}
      />
      <Box
        position="absolute"
        sx={(theme) => ({
          left: props.hover ? 0 : '6px',
          top: 0,
          width: props.hover ? '22px' : '8px',
          height: '24px',
          background: theme.palette.primary.main,
          borderTopLeftRadius: theme.shape.borderRadius,
          borderBottomLeftRadius: theme.shape.borderRadius,
          transition: '0.1s ease all',
        })}
      />
    </Box>
  )
}
const scrollFrames = (a: string) => keyframes`
0%   { transform: translateX(0); }
100% { transform: translateX(-${a}); }`

export type GeneticElementComponentProps = {
  geneticElement: GeneticElement
  selected: boolean
  hovered?: boolean
  animateText?: boolean
  onRemove?: () => void
  onClick?: () => void
}

/**
 * Displays a marker for a genetic element component
 *
 * @export
 * @param {GeneticElementComponentProps} props
 * @param {boolean} props.animateText When set to true the name of the genetic element will scroll after it is hovered for long enough
 * @param {boolean} props.hovered When set to true the component is forced to be in hovered state
 * @param {() => void} props.onRemove Called when this genetic element is deleted
 * @param {boolean} props.selected Defines whether this component should be rendered as if it is currently active
 * @param {GeneticElement} props.geneticElement The genetic element being rendered
 */
export default function GeneticElementComponent({
  geneticElement,
  selected,
  onRemove,
  onClick,
  // Force the genetic element component to render in hovered state
  hovered,
  // Defaults to true
  animateText,
}: GeneticElementComponentProps) {
  const [_hover, setHover] = useState<boolean>(false)
  const hover = hovered || _hover

  const [textScroll, setTextScroll] = useState<boolean>(false)

  const textGroupRef = useRef<HTMLDivElement>()
  const textContainerRef = useRef<HTMLDivElement>()

  const menuId = useId()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuEl, setMenuEl] = useState<HTMLElement>()

  useEffect(() => {
    if (hover && (animateText ?? true)) {
      const timeout = setTimeout(() => {
        setTextScroll(true)
      }, 1000)
      return () => clearTimeout(timeout)
    } else {
      setTextScroll(false)
    }
  }, [hover])

  const theme = useTheme()

  const backgroundColor =
    hover || selected
      ? theme.palette.secondary.main
      : theme.palette.background.paper

  const iconSx = (theme: Theme) => ({
    cursor: 'pointer',

    transition: '0.1s ease all',
    color: hover ? theme.palette.text.primary : backgroundColor,
  })
  // TODO: Create an animation that morphs between the handle and the indicator
  const indicator = <SelectedIndicator hover={hover} />
  const Handle = (
    <DragIndicator
      sx={(theme) => ({
        ...iconSx(theme),
        color: theme.palette.background.paper,
        opacity: hover ? '1' : '0',
      })}
    />
  )

  const transformDist =
    20 +
    (textGroupRef.current?.clientWidth ?? 1000) -
    (textContainerRef.current?.clientWidth ?? 1000)

  return (
    <Paper
      onMouseOver={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
      sx={(theme) => ({
        background: backgroundColor,
        transition: '0.1s ease all',
      })}
      elevation={0}
      onClick={onClick}
    >
      <Stack
        direction="row"
        gap={1}
        height={24}
        overflow="hidden"
        whiteSpace={'nowrap'}
        sx={(theme) => ({})}
      >
        <Box sx={{ position: 'relative' }} minWidth={24} minHeight={24}>
          <Box sx={{ position: 'absolute' }} minWidth={24} minHeight={24}>
            {selected && indicator}
          </Box>
          <Box sx={{ position: 'absolute' }} minWidth={24} minHeight={24}>
            {Handle}
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            ':before': {
              content: '""',
              background: `linear-gradient(to right, transparent 80%, ${backgroundColor})`,
              width: '100%',
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 5,
            },
          }}
          ref={textContainerRef}
        >
          <Stack
            direction="row"
            gap={1}
            sx={(theme) => ({
              animation: textScroll
                ? `${scrollFrames(transformDist + 'px')} ${
                    transformDist / 50
                  }s linear forwards`
                : '',
              position: 'absolute',
              userSelect: 'none',
            })}
            ref={textGroupRef}
          >
            <Typography>{geneticElement.id}</Typography>
            <Divider orientation="vertical" flexItem></Divider>
            <Typography>{geneticElement.aliases.join(', ')}</Typography>
          </Stack>
        </Box>
        <OptionsButton
          sx={(theme) => ({
            width: '24px',
            height: '24px',
            ...iconSx(theme),
          })}
          onClick={openMenu}
        />
      </Stack>
      <Menu
        id={menuId}
        anchorEl={menuEl}
        open={menuOpen}
        onClose={closeMenu}
        MenuListProps={{
          dense: true,
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => (closeMenu(), onRemove?.())}>
          Remove gene from list
        </MenuItem>
      </Menu>
    </Paper>
  )

  function openMenu(e: React.MouseEvent<HTMLElement>) {
    setMenuEl(e.currentTarget)
    setMenuOpen(true)
  }
  function closeMenu() {
    setMenuEl(undefined)
    setMenuOpen(false)
  }
}
