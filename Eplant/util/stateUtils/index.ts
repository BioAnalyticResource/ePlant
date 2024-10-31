import { ReactElement } from 'react'

import { SvgIconProps } from '@mui/material'

type StateAction<T> = {
  mutation: (prevState: T, ...args: any[]) => T
} & (
  | { rendered: true; icon: ReactElement<SvgIconProps> }
  | { rendered: false; icon?: never }
)
export type StateActions<T> = {
  [key: string]: StateAction<T>
}
