import arabidopsis from '@eplant/Species/arabidopsis'

describe('arabidopsis species', () => {
  it('should be able to search genes', async () => {
    const gene = await arabidopsis.api.searchGene('abc')
    expect(gene).toBeTruthy()
    expect(gene?.id).toEqual('AT1G02520')
    expect(gene?.species.name).toEqual('Arabidopsis')
    expect(gene?.aliases).toEqual(['ABCB11', 'MDR8', 'PGP11'])
    expect(gene?.annotation).toEqual('P-glycoprotein 11')
  })
})
