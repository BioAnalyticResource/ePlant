import { Box, Theme } from '@mui/material'
import { styled } from '@mui/material'

interface ModalContentProps {
  theme: Theme
  id: string
  mean: number
  std: number
  sampleSize: number
}
export const ModalContent = ({
  theme,
  id,
  mean,
  std,
  sampleSize,
}: ModalContentProps) => {
  return (
    <StyledBox theme={theme}>
      <p>
        <strong>{id}</strong>
      </p>
      <p>Mean: {mean.toFixed(2)}</p>
      <p>Standard error: {std.toFixed(2)}</p>
      <p>Sample size: {sampleSize}</p>
    </StyledBox>
  )
}

const StyledBox = styled(Box)(({ theme }: { theme: any }) => ({
  top: '50%',
  left: '50%',
  width: 400,
  borderRadius: '24px',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background,
  '& p': {
    margin: '5px 0',
    color: theme.palette.secondary.contrastText,
  },
  '& strong': {
    display: 'block',
    marginBottom: '10px',
  },
}))
