import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as React from 'react'
import { Collection } from '@eplant/UI/LeftNav/Collections'
import geneticElements from '@eplant/__mocks__/geneticElements'
import userEvent from '@testing-library/user-event'

describe('Collection', () => {
  async function setup({
    name,
    activeId,
    open,
  }: {
    name: string
    activeId?: string
    open: boolean
  }) {
    const onNameChange = jest.fn(),
      setOpen = jest.fn(),
      deleteGene = jest.fn(),
      onRemove = jest.fn()

    const s = render(
      <Collection
        name={name}
        open={open}
        setOpen={setOpen}
        onNameChange={onNameChange}
        activeId={activeId}
        genes={geneticElements}
        deleteGene={deleteGene}
        onRemove={onRemove}
      ></Collection>
    )
    const parent = await s.findByText(name)
    return { onNameChange, setOpen, deleteGene, onRemove, s, parent }
  }
  it('should open when clicked while closed', async () => {
    const { parent, setOpen } = await setup({
      name: 'name',
      open: false,
    })
    await userEvent.click(parent)
    expect(setOpen).toHaveBeenCalledTimes(1)
  })
  it('should open when clicked while open', async () => {
    const { parent, setOpen } = await setup({
      name: 'name',
      open: true,
    })
    await userEvent.click(parent)
    expect(setOpen).toHaveBeenCalledTimes(1)
  })
})
