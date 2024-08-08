import { FC } from 'react'

interface IconProps {
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}
export const ChromosomeIcon: FC<IconProps> = ({
  width = 24,
  height = 24,
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = 2,
}) => {
  return (
    // IconDna2 - Tabler Icons
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox='0 0 24 24'
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className='icon icon-tabler icons-tabler-outline icon-tabler-dna-2'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M17 3v1c-.01 3.352 -1.68 6.023 -5.008 8.014c-3.328 1.99 3.336 -2 .008 -.014c-3.328 1.99 -5 4.662 -5.008 8.014v1' />
      <path d='M17 21.014v-1c-.01 -3.352 -1.68 -6.023 -5.008 -8.014c-3.328 -1.99 3.336 2 .008 .014c-3.328 -1.991 -5 -4.662 -5.008 -8.014v-1' />
      <path d='M7 4h10' />
      <path d='M7 20h10' />
      <path d='M8 8h8' />
      <path d='M8 16h8' />
    </svg>
  )
}
