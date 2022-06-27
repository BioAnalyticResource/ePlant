import * as React from 'react'
import { Logo, LogoWithText } from '@eplant/UI/Logo'
import { ComponentMeta } from '@storybook/react'

export const Default = () => <Logo></Logo>
export const WithText = () => <LogoWithText text="ePlant"></LogoWithText>

export default {
  title: 'Logo',
  component: Logo,
} as ComponentMeta<typeof Logo>
