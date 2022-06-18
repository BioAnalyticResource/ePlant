import GeneticElement from '@eplant/GeneticElement'
import { DragIndicator, MoreVert } from '@mui/icons-material'
import {
  Box,
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

const SelectedIndicator = (props: SVGProps<SVGSVGElement>) => {
  const theme = useTheme()
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect
        x="0"
        y="0"
        width="10"
        height="24"
        fill={theme.palette.background.default}
      />
      <path
        d="M6 4C6 1.79086 7.79086 0 10 0H16V24H10C7.79086 24 6 22.2091 6 20V4Z"
        fill={theme.palette.background.default}
      />
      <path
        d="M6 4C6 1.79086 7.79086 0 10 0H14V24H10C7.79086 24 6 22.2091 6 20V4Z"
        fill={theme.palette.primary.light}
      />
    </svg>
  )
}

const scrollFrames = (a: string) => keyframes`
0%   { transform: translateX(0); }
100% { transform: translateX(-${a}); }`

export default function GeneticElementComponent({
  geneticElement,
  selected,
  onClickMenu,
}: {
  geneticElement: GeneticElement
  selected: boolean
  onClickMenu: (e: React.MouseEvent<HTMLElement>) => void
}) {
  const [hover, setHover] = useState<boolean>(false)
  const [textScroll, setTextScroll] = useState<boolean>(false)

  const textGroupRef = useRef<HTMLDivElement>()
  const textContainerRef = useRef<HTMLDivElement>()

  useEffect(() => {
    if (hover) {
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
      : theme.palette.background.default

  const iconSx = (theme: Theme) => ({
    cursor: 'pointer',

    color: hover ? theme.palette.text.primary : backgroundColor,
  })
  // TODO: Create an animation that morphs between the handle and the indicator
  const indicator = (
    <SelectedIndicator
      style={{
        display: hover || !selected ? 'none' : 'block',
      }}
    />
  )
  const Handle = (
    <DragIndicator
      sx={(theme) => ({
        ...iconSx(theme),
        display: selected && !hover ? 'none' : 'flex',
        background: selected ? theme.palette.primary.light : 'none',
        color: theme.palette.background.default,
      })}
    />
  )
  const Options = (
    <MoreVert
      sx={(theme) => ({
        ...iconSx(theme),
        position: 'sticky',
        right: 0,
      })}
    />
  )

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
        <Box minWidth={24} minHeight={24}>
          {indicator}
          {Handle}
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
                ? `${scrollFrames(
                    20 +
                      (textGroupRef.current?.clientWidth ?? 1000) -
                      (textContainerRef.current?.clientWidth ?? 1000) +
                      'px'
                  )} 3s linear forwards`
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
