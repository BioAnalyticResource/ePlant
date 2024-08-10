import { MouseEvent, useEffect, useId, useRef, useState } from 'react'

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
  Typography,
  useTheme,
} from '@mui/material'

import OptionsButton from './OptionsButton'

/**
 * Mark whether or not a genetic element component is selected
 *
 * @param {(BoxProps & { hover: boolean })} props Set hover to whether or not the genetic element component is hovered
 */
function SelectedIndicator(props: BoxProps & { hover: string }) {
  const theme = useTheme()
  return (
    <Box {...props} position={'relative'}>
      <Box
        position='absolute'
        sx={(theme) => ({
          left: 0,
          top: 0,
          width: props.hover ? '24px' : '16px',
          height: '24px',
          background: theme.palette.background.default,
          transition: '0.1s ease all',
        })}
      />
      <Box
        position='absolute'
        sx={(theme) => ({
          left: props.hover ? '0' : '0px',
          top: 0,
          width: props.hover ? '22px' : '22px',
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
 * Displays a genetic element.
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

  const textGroupRef = useRef<HTMLDivElement>(null)
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

  const backgroundColor = theme.palette.background.default

  const iconSx = (theme: Theme) => ({
    cursor: 'pointer',

    transition: '0.1s ease all',
    color: hover ? theme.palette.text.primary : backgroundColor,
  })
  const indicator = <SelectedIndicator hover={hover.toString()} />
  const Handle = (
    <DragIndicator
      sx={(theme) => ({
        ...iconSx(theme),
        color: theme.palette.background.default,
        ':hover': {
          color: selected
            ? theme.palette.primary.dark
            : theme.palette.secondary.main,
        },

        //opacity: hover ? '1' : '0',
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
        transition: '0.1s ease all',
        background: selected
          ? theme.palette.background.selected
          : theme.palette.background.default,
        ':hover': {
          background: theme.palette.background.hover,
        },
      })}
      elevation={0}
      onClick={onClick}
    >
      <Stack
        direction='row'
        gap={1}
        height={24}
        overflow='hidden'
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
              background: `linear-gradient(to right, transparent, 95%, ${
                selected
                  ? theme.palette.background.selected
                  : theme.palette.background.default
              })`,

              width: '100%',
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: 5,
            },
            ':hover::before': {
              background: `linear-gradient(to right, transparent, 95%, ${theme.palette.background.selected})`,
            },
          }}
          ref={textContainerRef}
        >
          <Stack
            direction='row'
            gap={1}
            sx={(theme) => ({
              animation: textScroll
                ? `${scrollFrames(transformDist + 'px')} ${
                    transformDist / 50
                  }s linear forwards`
                : '',
              position: 'absolute',
              userSelect: 'none',
              top: '2px',
            })}
            ref={textGroupRef}
          >
            <Typography
              variant='body2'
              // sx={{ fontWeight: selected ? 'bold' : 'regular' }}
            >
              {geneticElement.id}
            </Typography>
            <Divider orientation='vertical' flexItem></Divider>
            <Typography
              variant='body2'
              // sx={{ fontWeight: selected ? 'bold' : 'regular' }}
            >
              {geneticElement.aliases.join(', ')}
            </Typography>
          </Stack>
        </Box>
        <OptionsButton
          sx={(theme) => ({
            width: '24px',
            height: '24px',
            ':hover': {
              background: theme.palette.background.hover,
              color: theme.palette.secondary.main,
            },
            ...iconSx(theme),
            color: theme.palette.background.default,
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

  function openMenu(e: MouseEvent<HTMLElement>) {
    setMenuEl(e.currentTarget)
    setMenuOpen(true)
  }
  function closeMenu() {
    setMenuEl(undefined)
    setMenuOpen(false)
  }
}
