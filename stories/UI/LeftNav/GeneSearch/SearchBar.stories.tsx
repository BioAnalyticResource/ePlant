import * as React from 'react'

import { ComponentMeta, Story } from '@storybook/react'

import SearchBar from '@eplant/UI/LeftNav/GeneSearch/SearchBar'
import { range } from 'lodash'
import axios from 'axios'

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
  async genes(s: string) {
    return (
      await axios.get(
        'https://bar.utoronto.ca/eplant/cgi-bin/idautocomplete.cgi?species=Arabidopsis_thaliana&term=' +
          s
      )
    ).data
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
  label: 'Enter a gene name',
  sx: { width: 100 },
  placeholder: '',
}
