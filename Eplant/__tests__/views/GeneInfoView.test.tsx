import '@eplant/__mocks__/ResizeObserver'
import * as React from 'react'
import { GeneInfoView, GeneInfoViewData } from '@eplant/views/GeneInfoView'
import exampleData from '@eplant/Species/arabidopsis/loaders/GeneInfoView/exampleData'
import { render, act, prettyDOM } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ViewProps } from '@eplant/views/View'

function testForDataset(props: ViewProps<GeneInfoViewData>) {
  const { activeData } = props
  describe('Gene info view for ' + props.geneticElement?.id, () => {
    let rows: HTMLDivElement[]
    beforeAll(async () => {
      const s = render(<GeneInfoView.component {...props} />)
      const table = await s.findByTestId('gene-info-stack')
      rows = Array.from(table.children).filter(
        (c) => c.tagName == 'DIV'
      ) as HTMLDivElement[]
    })
    it('contains a row for `Gene`', async () => {
      const [label, value] = rows[0].children
      expect(label.textContent).toEqual('Gene')
      expect(value.textContent).toEqual(props.geneticElement?.id)
    })
    it('contains a row for `Aliases`', async () => {
      const [label, value] = rows[1].children
      expect(label.textContent).toEqual('Aliases')
      expect(value.textContent).toEqual(
        props.geneticElement?.aliases.join(', ')
      )
    })
    it('contains a row for `Full name`', async () => {
      const [label, value] = rows[2].children
      expect(label.textContent).toEqual('Full name')
      expect(value.textContent).toEqual(activeData.name)
    })
    it('contains a row for `Brief description`', async () => {
      const [label, value] = rows[3].children
      expect(label.textContent).toEqual('Brief description')
      expect(value.textContent).toEqual(activeData.brief_description)
    })
    it('contains a row for `Computational description`', async () => {
      const [label, value] = rows[4].children
      expect(label.textContent).toEqual('Computational description')
      expect(value.textContent).toEqual(activeData.computational_description)
    })
    it('contains a row for `Curator summary`', async () => {
      const [label, value] = rows[5].children
      expect(label.textContent).toEqual('Curator summary')
      expect(value.textContent).toEqual(activeData.curator_summary)
    })
    it('renders a row for `Location & Gene model`', async () => {
      const [label, value] = rows[6].children
      expect(label.textContent).toEqual('Location & Gene model')
      expect(
        value.textContent?.startsWith?.(
          `${activeData.location}: ${activeData.chromosome_start} to ${activeData.chromosome_end}, Strand ${activeData.strand}`
        )
      ).toEqual(true)
      expect(value.querySelectorAll('svg').length).toBeGreaterThan(0)
    })
    it('renders a row for the dna sequence', async () => {
      const [label, value] = rows[7].children
      expect(label.textContent).toEqual('DNA sequence')
    })
  })
}

describe('Gene Info View', () => {
  it('should be named `Gene info`', () => {
    expect(GeneInfoView.name).toEqual('Gene info')
  })

  it('contains a table', () => {
    const s = render(<GeneInfoView.component {...exampleData} />)
    s.getByTestId('gene-info-stack')
  })
  testForDataset(exampleData)
})
