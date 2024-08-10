import { SVGProps } from 'react'

import GeneticElement from '@eplant/GeneticElement'
import { Stack, Typography, useTheme } from '@mui/material'

import { View } from '../../View'

const Illustration = ({
  color,
  ...props
}: { color: string } & SVGProps<SVGSVGElement>) => (
  <svg
    width='204'
    height='200'
    viewBox='0 0 204 386'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M196.053 220.328H98.3851C102.003 213.092 107.791 201.518 110.683 187.773C112.13 183.432 112.854 178.367 112.854 174.028L156.262 130.619C159.156 127.725 159.156 123.384 156.262 120.493C153.368 117.598 149.026 117.598 146.135 120.493L112.857 153.771C110.686 137.132 104.175 122.663 92.5998 111.086C87.5349 105.297 83.1938 100.235 80.302 94.4469L115.027 59.7216C117.922 56.8274 117.922 52.4859 115.027 49.5947C112.133 46.7005 107.792 46.7005 104.9 49.5947L75.2344 79.2524C65.8312 43.8035 91.8762 13.4166 93.3207 11.9693C96.2149 9.07511 95.4914 4.73359 92.5971 1.84246C89.7029 -1.05177 85.3614 -0.328197 82.4703 2.56604C82.4703 2.56604 61.4901 25.7171 58.5955 57.5485L42.6801 35.8447C40.5095 32.9505 35.4444 32.2269 32.5533 34.3976C29.659 36.5682 28.9354 41.6333 31.1061 44.5272L61.4902 84.3173C65.108 95.8915 71.6171 108.192 83.194 120.49C99.833 137.853 101.28 159.556 98.3857 178.366L58.5956 155.939V155.215L44.1269 113.978C42.6797 110.36 38.3384 108.189 34.7209 109.637C31.1033 111.084 28.9324 115.425 30.3796 119.043L39.7856 145.088L15.1872 131.34C12.2956 129.893 7.95416 130.617 5.78392 134.235C3.61367 137.852 5.06034 142.194 8.67815 144.361L94.7691 192.832C89.7042 208.747 82.4713 219.601 82.4713 219.601L7.95037 219.603C3.60905 219.603 0.7146 222.497 0.7146 226.839V277.48C0.7146 281.822 3.60884 284.716 7.95037 284.716H18.8009L31.8223 379.488C32.5459 383.106 35.4402 386 39.0581 386H164.939C168.557 386 171.451 383.106 172.175 379.488L185.196 284.716L196.05 284.713C200.391 284.713 203.285 281.819 203.285 277.478V226.836C203.285 223.218 200.391 220.327 196.05 220.327L196.053 220.328ZM158.433 372.252H45.5735L33.2757 285.435H170.734L158.433 372.252ZM188.82 270.969H15.1867V234.797H188.813L188.82 270.969Z'
      fill={color}
    />
  </svg>
)

/**
 * The view shown when a view is not supported. Shown when the user switches active genes to a gene that does not support this view. Has a picture of a dead plant.
 */
export default function NotSupported(props: {
  geneticElement: GeneticElement | null
  view: View
}) {
  const theme = useTheme()
  return (
    <Stack
      gap={2}
      alignItems='center'
      textAlign='center'
      justifyContent='center'
      direction='column'
      width='100%'
      minHeight='70vh'
    >
      <Illustration color={theme.palette.primary.dark} />

      <Typography variant='h6'>
        {props.geneticElement
          ? `Cannot view ${props.view.name.toLowerCase()} for ${
              props.geneticElement.id
            }`
          : `There is no gene selected`}
      </Typography>
      <Typography
        variant='body1'
        sx={(theme) => ({
          color: theme.palette.text.secondary,
        })}
      >
        {props.geneticElement
          ? 'No data is available for this gene.'
          : `The ${props.view.name.toLowerCase()} requires a selected gene.`}
      </Typography>
    </Stack>
  )
}
