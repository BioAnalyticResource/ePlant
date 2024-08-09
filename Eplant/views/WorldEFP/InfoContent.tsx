import { styled } from '@mui/material'

interface InfoContentProps {
  id: string
  mean: number
  std: number
  sampleSize: number
  pos: { x: number; y: number }
}

const InfoContent = ({ id, mean, std, sampleSize, pos }: InfoContentProps) => {
  return (
    <StyledInfoContent x={pos.x} y={pos.y}>
      <p>
        <strong>{id}</strong>
      </p>
      <p>Mean: {mean.toFixed(2)}</p>
      <p>Standard error: {std.toFixed(2)}</p>
      <p>Sample size: {sampleSize}</p>
    </StyledInfoContent>
  )
}

const StyledInfoContent = styled('div')<{ x: number; y: number }>(
  ({ theme, x, y }) => ({
    position: 'absolute',
    top: y,
    left: x,
    border: '1px solid #ccc',
    backgroundColor: theme.palette.background.active,
    padding: '10px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    wordWrap: 'break-word',
    '& p': {
      margin: '5px 0',
    },
    '& strong': {
      display: 'block',
      marginBottom: '10px',
    },
  })
)

export default InfoContent
