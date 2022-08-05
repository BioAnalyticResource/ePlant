import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as React from 'react'
import { SearchGroup } from '@eplant/UI/LeftNav/GeneSearch'

describe('left nav', () => {
  it('should have a dropdown to select species', async () => {
    const s = render(<SearchGroup addGeneticElements={() => {}} />)
    const select = await s.findAllByText('Species')
    expect(select[0]).toBeVisible()
  })
  it('should have a button to search by expression', async () => {
    const s = render(<SearchGroup addGeneticElements={() => {}} />)
    const button = await s.findByText('Search by expression')
    expect(button).toBeVisible()
  })
  it('should have a button to search by phenotype', async () => {
    const s = render(<SearchGroup addGeneticElements={() => {}} />)
    const button = await s.findByText('Search by phenotype')
    expect(button).toBeVisible()
  })
  it('should have a search bar', async () => {
    const s = render(<SearchGroup addGeneticElements={() => {}} />)
    const search = await s.findAllByText('Search by gene name')
    expect(search[0]).toBeVisible()
  })
})
