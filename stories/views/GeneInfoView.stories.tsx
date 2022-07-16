import * as React from 'react'
import { ComponentMeta, Story } from '@storybook/react'
import data from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'
import { GeneInfoView, GeneInfoViewData } from '@eplant/views/GeneInfoView'
import arabidopsis from '@eplant/Species/arabidopsis'
import GeneticElement from '@eplant/GeneticElement'

export default {
  title: 'Gene Info View',
  component: GeneInfoView.component,
} as ComponentMeta<typeof GeneInfoView.component>

export const Default: Story = () => (
  <GeneInfoView.component {...data}></GeneInfoView.component>
)
export const Second: Story<{ search: string }> = ({
  search,
}: {
  search: string
}) => {
  const [gene, setGene] = React.useState<GeneticElement>()
  const [data, setData] = React.useState<GeneInfoViewData>()

  React.useEffect(() => {
    ;(async () => {
      const x = await arabidopsis.api.searchGene(search ?? 'x')
      if (x) {
        setData(await arabidopsis.api.loaders['gene-info'](x, () => {}))
        setGene(x)
      }
    })()
  })
  if (!gene || !data) return <></>
  return (
    <GeneInfoView.component
      geneticElement={gene}
      activeData={data}
    ></GeneInfoView.component>
  )
}
Second.args = { search: 'x' }
