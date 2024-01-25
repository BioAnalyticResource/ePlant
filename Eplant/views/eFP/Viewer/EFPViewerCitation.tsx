import { Link } from '@mui/material'

interface IEFPViewerCitationProps {
  viewID: string
  citation: { [key: string]: string }
  xmlData: string[]
}
const EFPViewerCitation = ({
  viewID,
  citation,
  xmlData,
}: IEFPViewerCitationProps) => {
  return (
    // Need to set inner HTML to capture nested HTML tags in some citations
    <div>
      <div dangerouslySetInnerHTML={{ __html: citation.source }} />
      {citation.notes && (
        <p
          style={{ marginTop: '1em' }}
          dangerouslySetInnerHTML={{ __html: citation.notes }}
        />
      )}
      {citation.URL && (
        <a href={citation.URL}>
          <p>citation.URL</p>
        </a>
      )}
      {xmlData.length > 0 && (
        <ul>
          {xmlData.map((item, index) => {
            if (item) {
              return <li key={index}> {item}</li>
            }
          })}
        </ul>
      )}
      <p>
        This image was generated with the {viewID} at bar.utoronto.ca/eplant by
        Waese et al. 2017.
      </p>
      <Link href='http://creativecommons.org/licenses/by/4.0/'>
        <img
          alt='Creative Commons License'
          src='https://i.creativecommons.org/l/by/4.0/80x15.png'
          title='The ePlant output for your gene of interest is available under a Creative Commons Attribution 4.0 International License and may be freely used in publications etc.'
        />
      </Link>
    </div>
  )
}

export default EFPViewerCitation
