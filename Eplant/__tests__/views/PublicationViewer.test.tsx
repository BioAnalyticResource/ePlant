import exampleData from '@eplant/Species/arabidopsis/loaders/PublicationViewer/exampleData'
import { PublicationViewer } from '@eplant/views/PublicationViewer'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import * as React from 'react'

describe('Publication Viewer', () => {
  it('renders correctly', () => {
    const s = render(<PublicationViewer.component {...exampleData} />)
    expect(s).toMatchSnapshot()
  })
})
