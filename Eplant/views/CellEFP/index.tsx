import { useEffect, useState } from 'react'

import { getCitation } from '@eplant/util/citations'
import { ViewMetadata } from '@eplant/View'
import YoutubeSearchedForRoundedIcon from '@mui/icons-material/YoutubeSearchedForRounded'

import EFPViewerCitation from '../eFP/Viewer/EFPViewerCitation'

import { CellEFPDataObject } from './CellEFPDataObject'
import CellEFPIcon from './icon'
import { CellEFPViewerData, CellEFPViewerState } from './types'

const CellEFP: ViewMetadata<CellEFPViewerData, CellEFPViewerState> = {
  id: 'cell-efp',
  name: 'Cell eFP',
  icon: () => <CellEFPIcon />,
  citation() {
    const [xmlData, setXMLData] = useState<string[]>([])

    const viewID = CellEFP.name
    const viewXML = CellEFPDataObject.xmlURL
    useEffect(() => {
      const xmlLoad = async () => {
        let xmlString = ''
        if (viewXML) {
          try {
            const response = await fetch(viewXML)
            const data = await response.text()
            xmlString = data
          } catch (error) {
            console.error('Error fetching xmlData:', error)
          }
        }

        if (xmlString !== '') {
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
          const listItems = xmlDoc.querySelectorAll('info li')
          const itemsArray = Array.from(listItems).map((liElement) =>
            liElement.textContent ? liElement.textContent : ''
          )
          setXMLData(itemsArray)
        } else {
          setXMLData([])
        }
      }
      xmlLoad()
    })

    const citation = getCitation(viewID) as { [key: string]: string }
    return (
      <EFPViewerCitation
        viewID={viewID}
        citation={citation}
        xmlData={xmlData}
      ></EFPViewerCitation>
    )
  },
  actions: [
    {
      name: 'Reset Pan/Zoom',
      description: 'Reset the pan and zoom of the viewer',
      icon: <YoutubeSearchedForRoundedIcon />,
      mutation: (prevState) => ({
        ...prevState,
        transform: {
          offset: {
            x: 0,
            y: 0,
          },
          zoom: 1,
        },
      }),
    },
  ],
}

export default CellEFP
