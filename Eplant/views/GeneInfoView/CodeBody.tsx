import { styled } from '@mui/material'

import { SecondaryText } from './SecondaryText'

export const CodeBody = styled(SecondaryText)(({ theme }) => ({
  fontFamily: 'Roboto Mono',
  wordBreak: 'break-word',
  fontSize: '.65rem',
}))
