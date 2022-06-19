import GeneticElement from '@eplant/GeneticElement'
import { DragIndicator, MoreVert } from '@mui/icons-material'
import {
  Box,
  BoxProps,
  Divider,
  keyframes,
  Paper,
  Stack,
  Theme,
  ThemeProvider,
  Typography,
  useTheme,
} from '@mui/material'
import React, { SVGProps, useEffect, useRef, useState } from 'react'

const SelectedIndicator = (props: BoxProps & { hover: boolean }) => {
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
  onClickMenu?: (e: React.MouseEvent<HTMLElement>) => void
  hovered?: boolean
  animateText?: boolean
}

export default function GeneticElementComponent({
  geneticElement,
  selected,
  onClickMenu,
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
        transition: '0.1s ease all',
      })}
    />
  )
  const Options = (
    <MoreVert
      sx={(theme) => ({
        ...iconSx(theme),
        position: 'sticky',
        right: 0,
        transition: '0.1s ease all',
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
        overflow: 'hidden',
      })}
      elevation={0}
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
        <Box minWidth={24} minHeight={24}>
          {Options}
        </Box>
      </Stack>
    </Paper>
  )
}
