import * as React from 'react'
import { ComponentMeta, Story } from '@storybook/react'
import ExpressionAngler from '@eplant/UI/GeneSearch/ExpressionAngler'
import * as _ from 'lodash'

export default {
  title: 'ExpressionAngler',
  component: ExpressionAngler,
} as ComponentMeta<typeof ExpressionAngler>

const Template = (args: Parameters<typeof ExpressionAngler>[0]) => (
  <ExpressionAngler {...args} />
)
export const Default: Story = Template.bind({
  open: true,
  loadGenes: (g: string[]) => undefined,
  URL: '',
})
Default.args = {
  open: true,
  loadGenes: (genes: string[]) => undefined,
  URL: 'https://bar.utoronto.ca/eplant/ExpressionAngler',
}
