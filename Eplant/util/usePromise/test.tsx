import * as React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import usePromise from '.'
import delayed from '../delayed'
const TestComponent = ({
  promise,
  callback,
}: {
  promise: Promise<number>
  callback: (
    value: number | null,
    loading: boolean,
    error: Error | null
  ) => void
}) => {
  const [value, loading, error] = usePromise(promise)
  React.useEffect(() => {
    callback(value, loading, error)
  }, [value, loading, error])
  return <></>
}
describe('usePromise hook', () => {
  it('should update `loading` correctly', () => {
    const fn = jest.fn()
    render(<TestComponent promise={delayed.value(1, 250)} callback={fn} />)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(null, true, null)
    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).not.toHaveBeenCalledWith(1, false, null)
    }, 300)
  })
})
