import { ReactElement } from 'react'

import { SvgIconProps } from '@mui/material'

export type StateAction<T> = {
  name: string
  description: string
  mutation: (prevState: T, ...args: any[]) => T
  icon: ReactElement<SvgIconProps>
}
