import * as React from 'react'

import { ComponentMeta, Story } from '@storybook/react'

import SearchBar from '@eplant/UI/LeftNav/SearchBar'
import { range } from 'lodash'
import * as _ from 'lodash'

const sxOptions = {
  width100: { width: 100 },
  width300: { width: 300 },
}

const complete = {
  none: null,
  static: () =>
    range(26).flatMap((x) =>
      range(26).map(
        (y) => String.fromCharCode(x + 97) + String.fromCharCode(y + 97)
      )
    ),
  async dynamic(s: string) {
    await new Promise<void>((res, rej) => {
      setTimeout(() => {
        res()
      }, 300)
    })
    return range(26).flatMap((x) =>
      range(26).map(
        (y) => s + String.fromCharCode(x + 97) + String.fromCharCode(y + 97)
      )
    )
  },
}

export default {
  title: 'SearchBar',
  component: SearchBar,
  argTypes: {
    sx: {
      options: Object.keys(sxOptions),
      mapping: sxOptions,
      control: { type: 'radio' },
    },
    complete: {
      options: Object.keys(complete),
      mapping: complete,
      control: { type: 'radio' },
    },
  },
} as ComponentMeta<typeof SearchBar>

const Template = SearchBar
export const Default: Story = Template.bind({})
Default.args = {
  label: 'test',
  sx: { width: 100 },
  placeholder: 'This is what a placeholder looks like',
}
