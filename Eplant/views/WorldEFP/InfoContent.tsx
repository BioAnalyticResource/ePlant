import { styled, Theme } from '@mui/material'

interface InfoContentProps {
  id: string
  mean: number
  std: number
  sampleSize: number
}

const InfoContent = ({ id, mean, std, sampleSize }: InfoContentProps) => {
  return (
    <StyledInfoContent>
      <p>
        <strong>
          {id.split(/<br\s*\/?>/i).map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </strong>
      </p>
      <p>Mean: {mean.toFixed(2)}</p>
      <p>Standard error: {std.toFixed(2)}</p>
      <p>Sample size: {sampleSize}</p>
    </StyledInfoContent>
  )
}

const StyledInfoContent = styled('div')(() => ({
  wordWrap: 'break-word',
  maxWidth: '300px',
  '& p': {
    margin: '5px 0',
    color: 'black',
  },
  '& strong': {
    display: 'block',
    marginBottom: '10px',
  },
}))

export default InfoContent
