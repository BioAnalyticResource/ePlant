import React from 'react'
import {
  alpha,
  Button,
  ButtonProps,
  Menu,
  MenuProps,
  styled,
} from '@mui/material'
import { KeyboardArrowDown } from '@mui/icons-material'

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={1}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 3,
    marginTop: theme.spacing(1),
    minWidth: 180,
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}))

/**
 * A dropdown menu.
 * @param { props.options } - The options to display in the dropdown. Everything should be
 * wrapped in `<MenuItem>` tags
 * @param { props.children } - The content to display in the dropdown button.
 * @returns
 */
export default function Dropdown({
  options,
  ...buttonProps
}: { options: React.ReactNode[] } & ButtonProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const buttonId = React.useId()
  const menuId = React.useId()

  return (
    <div>
      <Button
        id={buttonId}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
        {...buttonProps}
      ></Button>
      <StyledMenu
        id={menuId}
        MenuListProps={{
          'aria-labelledby': buttonId,
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {options}
      </StyledMenu>
    </div>
  )
}
