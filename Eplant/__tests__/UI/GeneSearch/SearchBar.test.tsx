import * as React from 'react'
import SearchBar from '@eplant/UI/LeftNav/GeneSearch/SearchBar'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

const setup = async ({ props } = { props: {} }) => {
  const s = render(<SearchBar {...props} />)
  const input = await s.findByRole('combobox')
  return { s, input }
}

describe('search bar', () => {
  it('should render a combobox', async () => {
    const { input } = await setup()
    expect(input).toBeVisible()
  })

  it('the combobox should be a text input', async () => {
    const { input } = await setup()
    expect(input.tagName).toBe('INPUT')
    expect(input.getAttribute('type')).toBe('text')
  })

  it('should call the complete input while typing', async () => {
    const complete = jest.fn(async () => ['x', 'y', 'z'])
    const { input } = await setup({
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
  it('should submit when the user presses enter', async () => {
    const onSubmit = jest.fn((x: string) => x)
    const { input } = await setup({
      props: {
        onSubmit,
      },
    })

    await userEvent.type(input, 'test')
    expect(onSubmit).toHaveBeenCalledTimes(0)
    await userEvent.type(input, '{enter}')
    expect(onSubmit).toHaveBeenCalledTimes(0)
    await userEvent.type(input, '{enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(['test'])
  })
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
    const { input } = await setup({
      props: {
        placeholder: 'placeholder',
      },
    })
    expect(input.getAttribute('placeholder')).toEqual('placeholder')
  })
})
