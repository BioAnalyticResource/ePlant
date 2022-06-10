import { GeneInfoView } from '@eplant/views/GeneInfoView'
import axios from 'axios'
import Species from './'

export default new Species(
  'Arabidopsis',
  {
    async autocomplete(s) {
      return (
        await axios.get(
          'https://bar.utoronto.ca/eplant/cgi-bin/idautocomplete.cgi?species=Arabidopsis_thaliana&term=' +
            s
        )
      ).data
    },
    async searchGene(s) {
      return null
    },
  },
  [GeneInfoView]
)
