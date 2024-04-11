import { styled } from '@mui/material'
export default styled(function CellEFPIcon(props) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='28'
      height='28'
      viewBox='0 0 100 100'
      {...props}
    >
      <path d='M39.4 20.5C20.9 24.5 7 38 7 52c0 14.1 14 27.6 32.8 31.6C68.5 89.6 98 73.6 98 52c0-14.1-14-27.6-32.8-31.6-8.2-1.7-17.7-1.7-25.8.1zm9.5 17.1c4.4.9 9.1 5.5 9.1 8.9 0 8.8-17.3 12.7-25 5.5-4-3.7-4-7.3 0-11 3.9-3.7 9.1-4.7 15.9-3.4z' />
    </svg>
  )
})(({ theme }) => ({
  fill: theme.palette.text.primary,
}))
