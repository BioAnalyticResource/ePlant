import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ExpressionAngler from './ExpressionAngler'
import * as React from 'react'
describe('expression angler', () => {
  it('should render', () => {
    render(
      <ExpressionAngler
        open={false}
        URL={''}
        loadGenes={(s) => {}}
      ></ExpressionAngler>
    )
  })
})
