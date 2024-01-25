import GeneticElement from '@eplant/GeneticElement'
import { Box, Divider, Typography } from '@mui/material'

export default function GeneHeader({
  geneticElement,
}: {
  geneticElement: GeneticElement | null
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: 'fit-content',
      }}
    >
      {geneticElement ? (
        <>
          <Typography variant='h6'>{geneticElement.id}</Typography>
          <Divider
            orientation='vertical'
            variant='middle'
            sx={{
              borderColor: (theme) => theme.palette.text.secondary,
              borderRightWidth: '3px',
              mx: 1,
            }}
            flexItem
          />
          <Typography variant='h6'>
            {geneticElement.aliases.join(', ')}
          </Typography>
        </>
      ) : (
        <Typography variant='h4'>No gene selected</Typography>
      )}
    </Box>
  )
}
