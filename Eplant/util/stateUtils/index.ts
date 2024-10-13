import { SvgIconProps } from '@mui/material'

export type StateAction<T> = {
  icon: React.ReactElement<SvgIconProps>
  mutation: (prevState: T) => T
  description: string
}
