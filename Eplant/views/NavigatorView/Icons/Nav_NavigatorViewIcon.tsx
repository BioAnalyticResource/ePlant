import { FC } from 'react'

interface IconProps {
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export const NavigatorIcon: FC<IconProps> = ({
  width = 24,
  height = 24,
  fill = 'currentColor',
  stroke = 'currentColor',
  strokeWidth = 2,
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox='0 0 512 512'
      fill='none'
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path
        fill={fill}
        d='M161.43 214h-79.04v86.76h86.69v-29.44h56.92v5.74c0 41-0.14 82-0.13 123-0.05 7.33 5.71 13.17 13.14 13.09 30.49-0.33 61-0.14 91.49-0.14h5.75v29.78h86.5v-86.49h-86.91v30.35h-83.45V128.24h83.69v29.45h86.58V71.38h-86.83v30.62h-5.67c-30.33 0-60.66 0.2-91-0.14-7.52-0.09-13.37 5.63-13.31 13.44 0.32 41-0.15 82-0.15 123v5.42h-57.17v-29.72h-7.4z'
      />
    </svg>
  )
}
