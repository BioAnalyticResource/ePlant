import * as React from 'react'
import SearchBar from '@eplant/UI/GeneSearch/SearchBar'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

const setup = async ({ props } = { props: {} }) => {
  const s = render(<SearchBar {...props} />)
  const input = await s.findByRole('combobox')
  return { s, input }
}

describe('search bar', () => {
  it('should render a combobox', async () => {
    const { s, input } = await setup()
    expect(input).toBeVisible()
  })

  it('the combobox should be a text input', async () => {
    const { s, input } = await setup()
    expect(input.tagName).toBe('INPUT')
    expect(input.getAttribute('type')).toBe('text')
  })

  it('should call the complete input while typing', async () => {
    const complete = jest.fn(async (inp) => ['x', 'y', 'z'])
    const { s, input } = await setup({
      props: {
        complete,
      },
    })
    await userEvent.type(input, 'x')
    await waitFor(() => {
      expect(complete).toHaveBeenCalledTimes(1)
      expect(complete).toHaveBeenCalledWith('x')
    })
  })
  it('should render predictions while typing', async () => {
    const complete = jest.fn(async (inp) => ['aaa', 'abb', 'acb', 'abc'])
    const { s, input } = await setup({
      props: {
        complete,
      },
    })
    await userEvent.type(input, 'ab')

    await waitFor(async () => {
      const popup = (
        (await s.findAllByRole('presentation')).find(
          (x) => x.children.length > 0
        ) as HTMLElement
      ).children[0].children[0]

      expect(popup.children.length).toEqual(2)
      const rows = new Set()
      for (let i = 0; i < popup.children.length; i++) {
        rows.add(popup.children[i].textContent)
      }
      expect(rows.size).toEqual(2)
      expect(rows).toContain('abb')
      expect(rows).toContain('abc')
    })
  })
  // Unnecessary if we decide to use a multiselect box
  // TODO: decide whether or not we are using a multiselect box
  /*it('should submit when the user presses enter', async () => {
    const onSubmit = jest.fn((x: string) => x)
    const { s, input } = await setup({
      props: {
        onSubmit,
      },
    })

    await userEvent.type(input, 'test')
    expect(onSubmit).toHaveBeenCalledTimes(0)
    await userEvent.type(input, '{enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith('test')
  })*/
  it('should display its label', async () => {
    const { s, input } = await setup({
      props: {
        label: 'Label test',
      },
    })
    expect(await s.findByLabelText('Label test')).toEqual(input)
  })
  it('should render a submit button', async () => {
    const { s } = await setup()
    const button = await s.findByRole('button')
    expect(button).toBeVisible()
  })
  test('clicking the button should submit', async () => {
    const onSubmit = jest.fn((x: string) => x)
    const { s, input } = await setup({
      props: {
        onSubmit,
      },
    })
    const button = await s.findByRole('button')
    await userEvent.type(input, 'test')
    await userEvent.type(input, '{enter}')
    await userEvent.click(button)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(['test'])
  })
  it('renders placeholder text', async () => {
    const { s, input } = await setup({
      props: {
        placeholder: 'placeholder',
      },
    })
    expect(input.getAttribute('placeholder')).toEqual('placeholder')
  })
})
