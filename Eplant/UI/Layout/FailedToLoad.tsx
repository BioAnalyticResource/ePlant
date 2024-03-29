import { SVGProps } from 'react'

import GeneticElement from '@eplant/GeneticElement'
import { Link, Stack, Typography, useTheme } from '@mui/material'

import { View } from '../../View'

const Illustration = ({
  color,
  ...props
}: { color: string } & SVGProps<SVGSVGElement>) => (
  <svg
    width='100'
    height='200'
    viewBox='0 0 119 241'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M114.751 137.718H57.3764C59.5017 133.219 62.902 126.023 64.6008 117.477C65.4509 114.777 65.8759 111.628 65.8759 108.93L91.3761 81.9407C93.0763 80.1412 93.0763 77.4418 91.3761 75.6442C89.6759 73.8447 87.1254 73.8447 85.4271 75.6442L65.8779 96.3352C64.6028 85.9897 60.7775 76.9936 53.9779 69.7955C51.0025 66.1965 48.4523 63.0491 46.7535 59.45L67.1528 37.8592C68.8531 36.0597 68.8531 33.3603 67.1528 31.5627C65.4526 29.7631 62.9022 29.7631 61.2038 31.5627L43.7766 50.0027C38.2527 27.9619 53.5528 9.06851 54.4013 8.16864C56.1016 6.36912 55.6765 3.66972 53.9763 1.87213C52.2761 0.0726101 49.7256 0.522502 48.0273 2.32203C48.0273 2.32203 35.7025 16.7165 34.0021 36.508L24.6526 23.0134C23.3775 21.2139 20.402 20.764 18.7036 22.1137C17.0034 23.4633 16.5783 26.6126 17.8534 28.4119L35.7026 53.1518C37.8278 60.3482 41.6516 67.9963 48.4524 75.6426C58.227 86.438 59.0772 99.9326 57.3768 111.628L34.0021 97.6834V97.2335L25.5025 71.5936C24.6524 69.3442 22.1021 67.9946 19.9769 68.8944C17.8518 69.7941 16.5765 72.4934 17.4266 74.7427L22.9522 90.9369L8.50188 82.389C6.80325 81.4892 4.25287 81.9391 2.97797 84.1885C1.70306 86.4379 2.5529 89.1373 4.67818 90.485L55.2522 120.622C52.2768 130.518 48.0279 137.266 48.0279 137.266L4.25064 137.267C1.70034 137.267 0 139.067 0 141.766V173.253C0 175.952 1.70022 177.752 4.25064 177.752H10.6248L18.2742 236.678C18.6993 238.927 20.3995 240.727 22.5248 240.727H96.4735C98.5988 240.727 100.299 238.927 100.724 236.678L108.374 177.752L114.749 177.75C117.3 177.75 119 175.951 119 173.251V141.765C119 139.515 117.3 137.717 114.749 137.717L114.751 137.718ZM92.6516 232.179H26.3523L19.128 178.199H99.8775L92.6516 232.179ZM110.502 169.205H8.5016V146.714H110.498L110.502 169.205Z'
      fill='url(#failed-to-load-gradient)'
    />
    <defs>
      <linearGradient
        id='failed-to-load-gradient'
        x1='59.5'
        y1='0.726562'
        x2='59.5'
        y2='240.727'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#ABCFA1' />
        <stop offset='1' stopColor='#89BBB4' />
      </linearGradient>
    </defs>
  </svg>
)

/**
 * The view shown when a view is not supported. Shown when the user switches active genes to a gene that does not support this view
 */
export default function FailedToLoad(props: {
  geneticElement: GeneticElement | null
  view: View
}) {
  const theme = useTheme()
  return (
    <Stack
      gap={2}
      alignItems='center'
      direction='column'
      width='100%'
      height='100vh'
      justifyContent='center'
    >
      <Illustration color={theme.palette.primary.main} />
      <Typography
        sx={{
          textAlign: 'center',
          maxWidth: 600,
          fontWeight: 400,
          marginTop: 2,
        }}
      >
        {props.geneticElement
          ? `There was an error while trying to load ${props.view.name.toLowerCase()} for ${
              props.geneticElement.id
            }`
          : `There was an error while trying to load ${props.view.name.toLowerCase()} without a selected gene.`}
      </Typography>
      <Typography
        variant='body1'
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          textAlign: 'center',
          marginBottom: 10,
        })}
      >
        You can let us know by opening an issue on{' '}
        <Link href='https://github.com/BioAnalyticResource/ePlant/issues'>
          GitHub
        </Link>
      </Typography>
    </Stack>
  )
}
