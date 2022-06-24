import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as React from 'react'
import { LeftNav } from '@eplant/UI/LeftNav'
import { SearchGroup } from '@eplant/UI/LeftNav/GeneSearch'
import { Collection } from '@eplant/UI/LeftNav/Collections'
import geneticElements from '@eplant/__mocks__/geneticElements'
import userEvent from '@testing-library/user-event'
import GeneticElementComponent from '@eplant/UI/GeneticElementComponent'

describe('Genetic Element Components', () => {
  it('renders correctly', async () => {
    const s = render(
      <>
        {[false, true].flatMap((v) =>
          geneticElements.map((g) => (
            <GeneticElementComponent
              selected={v}
              key={v + g.id}
              geneticElement={g}
            ></GeneticElementComponent>
          ))
        )}
      </>
    )
    expect(s).toMatchSnapshot()
  })
})
