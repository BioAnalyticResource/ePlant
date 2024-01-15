import { Theme } from '@mui/system'
export function updateColors(theme: Theme) {
  ;(
    Array.from(
      document.getElementsByClassName('flexlayout__layout')
    ) as HTMLDivElement[]
  ).map((el) => {
    el.style.setProperty('--color-text', theme.palette.text.primary)
    el.style.setProperty('--color-background', theme.palette.background.default)
    el.style.setProperty('--color-base', theme.palette.background.default)
    el.style.setProperty('--color-primary', theme.palette.primary.main)
    el.style.setProperty(
      '--color-primary-light',
      theme.palette.primary.pale ?? theme.palette.primary.main
    )
    el.style.setProperty('--color-1', theme.palette.background.default)
    el.style.setProperty('--color-2', theme.palette.background.paper)
    el.style.setProperty('--color-active', theme.palette.background.active)
    el.style.setProperty('--color-6', theme.palette.background.active)
    el.style.setProperty('--color-divider', theme.palette.divider)
  })
}