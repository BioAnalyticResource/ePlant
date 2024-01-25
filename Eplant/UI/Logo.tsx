import { Stack, Typography, useTheme } from '@mui/material'
import { SVGProps } from 'react'

/**
 * The BAR logo in ePlant.
 * @param props Props are forwarded to the underlying SVG element.
 * @returns
 */
export function Logo(props: SVGProps<SVGSVGElement>) {
  const theme = useTheme()
  return (
    <a href='http://bar.utoronto.ca/' rel='noreferrer' target='_blank'>
      <svg
        {...props}
        width='42'
        height='42'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <circle cx='12' cy='12' r='12' fill={theme.palette.primary.main} />
        <path
          d='M6.07617 12.1919H4.43262L4.42383 11.2866H5.80371C6.04688 11.2866 6.24609 11.2559 6.40137 11.1943C6.55664 11.1299 6.67236 11.0376 6.74854 10.9175C6.82764 10.7944 6.86719 10.645 6.86719 10.4692C6.86719 10.27 6.8291 10.1089 6.75293 9.98584C6.67969 9.86279 6.56396 9.77344 6.40576 9.71777C6.25049 9.66211 6.0498 9.63428 5.80371 9.63428H4.88965V15H3.57129V8.60156H5.80371C6.17578 8.60156 6.5083 8.63672 6.80127 8.70703C7.09717 8.77734 7.34766 8.88428 7.55273 9.02783C7.75781 9.17139 7.91455 9.35303 8.02295 9.57275C8.13135 9.78955 8.18555 10.0474 8.18555 10.3462C8.18555 10.6099 8.12549 10.853 8.00537 11.0757C7.88818 11.2983 7.70215 11.48 7.44727 11.6206C7.19531 11.7612 6.86572 11.8389 6.4585 11.8535L6.07617 12.1919ZM6.01904 15H4.07227L4.58643 13.9717H6.01904C6.25049 13.9717 6.43945 13.9351 6.58594 13.8618C6.73242 13.7856 6.84082 13.6831 6.91113 13.5542C6.98145 13.4253 7.0166 13.2773 7.0166 13.1104C7.0166 12.9229 6.98438 12.7603 6.91992 12.6226C6.8584 12.4849 6.75879 12.3794 6.62109 12.3062C6.4834 12.23 6.30176 12.1919 6.07617 12.1919H4.80615L4.81494 11.2866H6.39697L6.7002 11.6426C7.08984 11.6367 7.40332 11.7056 7.64062 11.8491C7.88086 11.9897 8.05518 12.1729 8.16357 12.3984C8.2749 12.624 8.33057 12.8657 8.33057 13.1235C8.33057 13.5337 8.24121 13.8794 8.0625 14.1606C7.88379 14.439 7.62158 14.6484 7.27588 14.7891C6.93311 14.9297 6.51416 15 6.01904 15ZM12.0709 9.6958L10.3307 15H8.92881L11.3063 8.60156H12.1983L12.0709 9.6958ZM13.5167 15L11.7721 9.6958L11.6314 8.60156H12.5323L14.9229 15H13.5167ZM13.4376 12.6182V13.6509H10.0582V12.6182H13.4376ZM15.6662 8.60156H18.0524C18.5417 8.60156 18.9621 8.6748 19.3137 8.82129C19.6682 8.96777 19.9406 9.18457 20.1311 9.47168C20.3215 9.75879 20.4167 10.1118 20.4167 10.5308C20.4167 10.8735 20.3581 11.168 20.2409 11.4141C20.1267 11.6572 19.9641 11.8608 19.7531 12.0249C19.5451 12.186 19.3005 12.3149 19.0192 12.4116L18.6018 12.6313H16.5275L16.5188 11.603H18.0612C18.2927 11.603 18.4846 11.562 18.6369 11.48C18.7893 11.3979 18.9035 11.2837 18.9797 11.1372C19.0588 10.9907 19.0983 10.8208 19.0983 10.6274C19.0983 10.4224 19.0603 10.2451 18.9841 10.0957C18.9079 9.94629 18.7922 9.83203 18.6369 9.75293C18.4816 9.67383 18.2868 9.63428 18.0524 9.63428H16.9846V15H15.6662V8.60156ZM19.2434 15L17.7844 12.1479L19.1774 12.1392L20.654 14.9385V15H19.2434Z'
          fill={theme.palette.background.default}
        />
      </svg>
    </a>
  )
}

/**
 * Draws the ePlant logo with text beside it
 * @param props.text Text to display beside the logo
 * @param props Props other than text are forwarded to the underlying SVG element.
 * @returns
 */
export function LogoWithText({
  text,
  ...props
}: SVGProps<SVGSVGElement> & { text: string }) {
  const theme = useTheme()
  return (
    <Stack direction={'row'} gap={'12px'} style={{ alignItems: 'center' }}>
      <Logo {...props}></Logo>
      <Typography
        variant='h6'
        color={theme.palette.primary.main}
        sx={{ paddingBottom: 1 }}
      >
        {text}
      </Typography>
    </Stack>
  )
}
