import loadData from '.'
import GeneticElement from '@eplant/GeneticElement'
import { GeneInfoViewData } from '@eplant/views/GeneInfoView'
import arabidopsis from '@eplant/Species/arabidopsis'

describe('load data', () => {
  it('should correctly load data for AT3G24650', async () => {
    const gene = await arabidopsis.api.searchGene('AT3G24650')
    if (!gene) throw new Error("Couldn't find gene")
    const data = await loadData(gene, (loading: number) => {})
    GeneInfoViewData.parse(data)
  })
})
