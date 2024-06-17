import * as React from 'react'

import { styled } from '@mui/material'
export default styled(function ChomosomeIcon(props) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M19 21C19 20.663 18.9818 20.3293 18.9463 20M5 3C5 3.33701 5.01817 3.67071 5.0537 4M5 21C5 16.8566 7.74671 13.2152 11.7307 12.077L12.2693 11.923C16.2533 10.7848 19 7.14339 19 3M15 4H5.0537M12.5 8H6.46206M9 20H18.9463M11.5 16H17.5379M18.9463 20C18.7899 18.5509 18.2974 17.187 17.5379 16M17.5379 16C16.3482 14.1405 14.5033 12.7152 12.2693 12.077L11.7307 11.923C9.49674 11.2848 7.65184 9.8595 6.46206 8M5.0537 4C5.21006 5.44909 5.70259 6.81301 6.46206 8" stroke="#fff" strokeWidth="2" />
		</svg>
	)

})(({ theme }) => ({
	fill: theme.palette.text.primary,
}))
