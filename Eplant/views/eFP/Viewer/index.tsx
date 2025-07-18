import { useEffect, useState } from 'react'

import GeneticElement from '@eplant/GeneticElement'
import { getCitation } from '@eplant/util/citations'
import { StateAction, ViewMetadata } from '@eplant/View'

import EFP from '..'

import EFPViewerCitation from './EFPViewerCitation'
import { EFPViewerData, EFPViewerState } from './types'

interface ICitationProps {
  activeData?: EFPViewerData
  state?: EFPViewerState
  gene?: GeneticElement | null
}

export default class EFPViewer
  implements ViewMetadata<EFPViewerData, EFPViewerState>
{
  constructor(
    public id: string,
    public name: string,
    public views: EFPViewerData['views'],
    public efps: EFP[],
    public icon: () => JSX.Element,
    public description?: string,
    public thumbnail?: string,
    public actions?: StateAction<EFPViewerState>[]
  ) {}
  citation = ({ activeData, state }: ICitationProps) => {
    const [xmlData, setXMLData] = useState<string[]>([])

    const viewID = activeData?.views.find((v) => v.id == state?.activeView)
      ?.name
    const viewXML = activeData?.views.find((v) => v.id == state?.activeView)
      ?.xmlURL
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

        // Extract <li> tags
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
    }, [viewXML])

    if (viewID) {
      const citation = getCitation(viewID) as { [key: string]: string }
      return (
        <EFPViewerCitation
          viewID={viewID}
          citation={citation}
          xmlData={xmlData}
        ></EFPViewerCitation>
      )
    } else {
      return <p>No Citation information provided.</p>
    }
  }
}
