import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as React from 'react'
import { LeftNav } from '@eplant/UI/LeftNav'
import { SearchGroup } from '@eplant/UI/LeftNav/GeneSearch'
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
      setOpen = jest.fn()
    const s = render(
      <Collection
        name={name}
        open={open}
        setOpen={setOpen}
        onNameChange={onNameChange}
        activeId={activeId}
        genes={geneticElements}
      ></Collection>
    )
    const parent = await s.findByTestId('collection')
    return { onNameChange, setOpen, s, parent }
  }

  it('should render correctly when closed', async () => {
    const { s } = await setup({
      name: 'name',
      open: false,
    })
    expect(s).toMatchSnapshot()
  })
  it('should render correctly when open', async () => {
    const { s } = await setup({
      name: 'name',
      open: true,
    })
    expect(s).toMatchSnapshot()
  })

  it('should open when clicked while closed', async () => {
    const { parent, setOpen } = await setup({
      name: 'name',
      open: false,
    })
    await userEvent.click(parent.children[0])
    expect(setOpen).toHaveBeenCalledTimes(1)
  })
  it('should open when clicked while open', async () => {
    const { parent, setOpen } = await setup({
      name: 'name',
      open: true,
    })
    await userEvent.click(parent.children[0])
    expect(setOpen).toHaveBeenCalledTimes(1)
  })
})
