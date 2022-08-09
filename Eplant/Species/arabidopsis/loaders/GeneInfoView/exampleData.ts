import arabidopsis from '@eplant/Species/arabidopsis'
import { GeneInfoViewData } from '@eplant/views/GeneInfoView/data'
import { ViewProps } from '@eplant/View'

const a: ViewProps<GeneInfoViewData> = {
  geneticElement: {
    id: 'AT3G24650',
    annotation: 'AP2/B3-like transcriptional factor family protein',
    species: arabidopsis,
    aliases: ['ABI3', 'AtABI3', 'SIS10'],
  },
  activeData: {
    name: 'ABA INSENSITIVE 3',
    brief_description: 'AP2/B3-like transcriptional factor family protein',
    computational_description:
      'AP2/B3-like transcriptional factor family protein;(source:Araport11)',
    curator_summary:
      'Homologous to the maize transcription factor Viviparous-1. Full length ABI3 protein binds to the highly conserved RY motif [DNA motif CATGCA(TG)], present in many seed-specific promoters, and the B3 domains of this transcription factor is necessary for the specific interaction with the RY element. Transcriptional activity of ABI3 requires the B3 DNA-binding domain and an activation domain. In addition to the known N-terminal-located activation domain, a second transcription activation domain was found in the B1 region of ABI3. ABI3 is essential for seed maturation. Regulator of the transition between embryo maturation and early seedling development. Putative seed-specific transcriptional activator. ABI3 is a central regulator in ABA signaling and is unstable in vivo.  It interacts with and can by polyubiquitinated by AIP2 in vivo. Based on double mutant analyses, ABI3 interacts genetically with both FUS3 and LEC1 and is involved in controlling accumulation of chlorophyll and anthocyanins, sensitivity to abscisic acid, and expression of the members of the 12S storage protein gene family. In addition, both FUS3 and LEC1 regulate positively the abundance of the ABI3 protein in the seed.  Alternative splicing of ABI3 is developmentally regulated by SUA (AT3G54230).',
    location: 'Chr3',
    chromosome_start: 8997370,
    chromosome_end: 9001185,
    strand: '+',
    geneSequence:
      'GAAAGAAAGAGAGAGTCTTCTTGTTGGAGTAAACCCAAACGGTTTTAGATTACTTATTAGCTGTTCATCAGTTCTTCCTCTCTAAAAGAGTAAAACCTAAACATCTCTCTCTGTTCTATTAGAACCAAAGACCAATCTTTGTGAACAAAACACATCTCGTATACTTCAGATCTAGACTCGAAAATTTTAGACCTCTTTACAATTGGTCTTTGTTCATCTGAAGTTGGAGAAAATAGTTAGCTTAGGTCGGATCTTTTCATATGCTTTGGATCCTCCTTCGTCTCTTTTGTATAATTTTAACCTTATCAAGAGTTCTTTTTGAATCTCAAAAGATTATATAGTAGTATAGAAGGTTTATATGTATATGTATAGCCAGATAGTTTATGTTGTTTAAAGATTCGATGATAGCCAAGTTGGGTTAACTTTCTTTTTCCTTGCCTCCTTACTCACATACAAACCCTATCTGTCCGTACAAAATACTAAAAACCCTAACTTTTCTCTCTCCACCAATCTAGTTTATTGTTTCATTTCCACTTCAACGATGAAAAGCTTGCATGTGGCGGCCAACGCCGGAGATCTGGCTGAGGATTGTGGAATACTCGGTGGAGACGCTGATGATACTGTTTTGATGGATGGAATTGATGAAGTTGGTAGAGAGATCTGGTTAGATGACCATGGAGGAGATAATAATCATGTTCATGGTCATCAAGATGATGATTTGATTGTTCATCATGACCCTTCAATCTTCTATGGAGATCTCCCAACGCTTCCTGATTTCCCATGCATGTCGTCTTCATCATCGTCTTCAACATCTCCAGCTCCTGTCAACGCAATCGTCTCCTCAGCCTCTTCTTCTTCGGCAGCTTCTTCCTCCACTTCCTCAGCTGCTTCTTGGGCTATATTGAGATCAGATGGAGAAGATCCGACTCCAAACCAAAACCAATACGCATCAGGAAACTGTGACGACTCTTCTGGTGCATTGCAATCCACAGCTTCCATGGAGATTCCATTAGACAGCAGTCAAGGTTTTGGTTGCGGCGAAGGCGGTGGTGATTGCATTGATATGATGGAGACTTTCGGGTACATGGATCTACTTGATAGCAACGAGTTCTTTGACACCTCAGCTATATTTAGCCAAGACGACGACACGCAAAACCCTAACTTGATGGACCAAACCCTTGAGAGACAAGAAGACCAGGTCGTTGTTCCGATGATGGAGAATAACAGTGGTGGAGACATGCAAATGATGAATTCTTCCTTGGAACAGGACGATGATCTCGCTGCTGTGTTTTTGGAGTGGCTAAAGAACAACAAGGAGACTGTGTCGGCTGAGGATTTGAGGAAAGTAAAGATAAAGAAAGCTACGATTGAATCAGCGGCAAGAAGACTAGGCGGTGGTAAAGAAGCGATGAAGCAGCTTTTAAAGCTGATTCTTGAATGGGTCCAAACTAATCACTTACAAAGAAGACGCACCACCACCACCACCACCAACCTCTCTTATCAACAATCATTCCAACAAGATCCATTTCAAAACCCTAACCCTAATAACAACAACCTAATCCCACCGTCCGACCAAACCTGTTTCTCACCTTCAACATGGGTTCCTCCACCACCACAACAACAAGCTTTTGTCTCGGACCCGGGTTTTGGATACATGCCTGCTCCAAACTATCCGCCACAGCCAGAGTTCCTTCCTTTACTTGAATCTCCACCGTCATGGCCACCACCACCACAGTCTGGTCCCATGCCACATCAACAATTCCCCATGCCGCCAACCTCGCAGTATAATCAATTTGGAGATCCAACAGGTTTCAATGGATACAACATGAATCCGTACCAATATCCTTATGTTCCTGCAGGACAAATGAGAGATCAGAGATTACTCCGTTTGTGTTCCTCAGCAACTAAAGAGGCAAGAAAGAAACGGATGGCGAGACAGAGGAGGTTCTTGTCTCATCACCACAGACATAACAACAACAACAACAACAACAACAATAATCAGCAGAACCAAACCCAAATCGGAGAAACCTGTGCCGCGGTGGCTCCACAACTTAACCCCGTGGCCACAACCGCCACGGGAGGGACCTGGATGTATTGGCCTAATGTCCCGGCAGTGCCGCCTCAATTACCGCCAGTGATGGAGACTCAGTTACCTACCATGGACCGAGCTGGCTCAGCTTCTGCTATGCCACGTCAGCAGGTGGTACCAGATCGCCGGCAGGTAGACATGCACAATCATCTTTCTCATTGTTTATTCTTTAATTTAGCAATACTCGAATAGTTTGTGTAATTGCACCACTCGTTTGGTTTGATGAAGAAGCTAAAGATTTTACATGTGTTTTTTTTGATAAAATGTGAATCGGAAGATTATACATTTGCAATGGAAATGAAATGATTTTGATCTTTTTGGTTTGATTTTAGGGATGGAAACCAGAAAAGAATTTGCGGTTTCTCTTGCAGAAAGTCTTGAAGCAAAGCGACGTGGGTAACCTCGGAAGGATCGTTTTGCCAAAAGTAATTTTTCTTCTAATTTCTTGTAGCCTTTGCTTTCCATTTTCTAAAAAAGGTTCAATGTTTGTGTAAAAATATTGTCAAGTTTTTATTTTATTTTTACTCTTATTGGTTAAGTTATATTTTACTGAATTTTTATTTTTTTTAGAAAGAAGCTGAGACACACTTGCCGGAGCTAGAGGCAAGAGACGGCATCTCTCTGGCCATGGAAGACATCGGAACCTCTCGTGTTTGGAACATGCGCTACAGGTAACTGATTATGATGCTAACATGTTAACATTGATTCTTTTTATAAAAACAATTCGTGTATTTTGTCAAAAATTGGAACTCGACCAAAATGTTTTTTCGGTTATTTAATTGTCTTCTTAAATTGGTTTTGCAGGTTTTGGCCTAACAACAAAAGCAGGATGTATCTCCTCGAGAACACCGGTACGTTTTTGAAAATGTACCCGTTAATAATTTTCCTTTCTTTTGGTTTGTTTGTTCTCTTGTAATTATTGTTGTGGACGCATACATATCTAATTTTCCTTGAAATTACGTTTACAGGCGATTTTGTGAAAACCAATGGGCTCCAAGAAGGTGATTTCATAGTCATATACTCCGACGTCAAATGTGGCAAATATGTAAGAGAAGCATCACAATATTTTTCTATACTTTTCATTAGTATTTAACTCTCATCATTACTTTTGTTGGTATTTATCTTGTCATAATTAATTGAGAATAATATTATGACAGTTGATACGAGGGGTTAAAGTAAGACAACCGAGCGGACAAAAGCCGGAGGCCCCACCGTCGTCAGCAGCTACGAAGAGACAAAACAAGTCGCAAAGGAACATAAACAATAACTCTCCGTCGGCGAATGTGGTGGTCGCTTCACCAACTTCTCAAACTGTTAAATGAAAAACAGAGACAAAAAGAAACAATATAAATATTATTATGTACCAAATAAGAAAGAGGGCAAAAGGAAAAAATGGCAGCGTACCCGAGTGTGCCACTTCTCGTGCATGCATGGGATCTTGAAGACAAATGGAGGGTCATGATTAAAGCTGTTTGGTCGGGGTCCGGGTTTTTACTCCATTTTTTGCTTTTTCTTGTCGAGTCGGTTCTTTTATAACTCTTTACTCTTTTTACCTTCAGGATATTGTAGAGATGATTAATTCTGGAAATGGTGTTTGTGTTATATTTCTGGAGAGATGATTATATAGTTCTTTTGTTGTTGTAATTGGTTAATATTACATATGTGGCTCATTTCTTGAGTCGAGCTTACATATCGTTTATAATGTGAATGTTTTAAGAAGAGTTGAA',
    geneticElementType: 'protein_coding',
    features: [
      {
        type: 'mRNA',
        uniqueID: 'AT3G24650.1',
        start: 8997370,
        end: 9001185,
        subfeatures: [
          {
            type: 'CDS',
            uniqueID: 'AT3G24650:CDS:1',
            start: 8997911,
            end: 8999590,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'CDS',
            uniqueID: 'AT3G24650:CDS:2',
            start: 8999791,
            end: 8999883,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'CDS',
            uniqueID: 'AT3G24650:CDS:3',
            start: 9000029,
            end: 9000129,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'CDS',
            uniqueID: 'AT3G24650:CDS:4',
            start: 9000263,
            end: 9000309,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'CDS',
            uniqueID: 'AT3G24650:CDS:5',
            start: 9000427,
            end: 9000503,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'CDS',
            uniqueID: 'AT3G24650:CDS:6',
            start: 9000616,
            end: 9000780,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'exon',
            uniqueID: 'AT3G24650:exon:1',
            start: 8997370,
            end: 8999590,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'exon',
            uniqueID: 'AT3G24650:exon:2',
            start: 8999791,
            end: 8999883,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'exon',
            uniqueID: 'AT3G24650:exon:3',
            start: 9000029,
            end: 9000129,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'exon',
            uniqueID: 'AT3G24650:exon:4',
            start: 9000263,
            end: 9000309,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'exon',
            uniqueID: 'AT3G24650:exon:5',
            start: 9000427,
            end: 9000503,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'exon',
            uniqueID: 'AT3G24650:exon:6',
            start: 9000616,
            end: 9001185,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'five_prime_UTR',
            uniqueID: 'AT3G24650:five_prime_UTR:1',
            start: 8997370,
            end: 8997910,
            subfeatures: [],
            strand: '1',
          },
          {
            type: 'three_prime_UTR',
            uniqueID: 'AT3G24650:three_prime_UTR:1',
            start: 9000781,
            end: 9001185,
            subfeatures: [],
            strand: '1',
          },
        ],
        strand: '1',
      },
    ],
    proteinSequence:
      'MKSLHVAANAGDLAEDCGILGGDADDTVLMDGIDEVGREIWLDDHGGDNNHVHGHQDDDLIVHHDPSIFYGDLPTLPDFPCMSSSSSSSTSPAPVNAIVSSASSSSAASSSTSSAASWAILRSDGEDPTPNQNQYASGNCDDSSGALQSTASMEIPLDSSQGFGCGEGGGDCIDMMETFGYMDLLDSNEFFDTSAIFSQDDDTQNPNLMDQTLERQEDQVVVPMMENNSGGDMQMMNSSLEQDDDLAAVFLEWLKNNKETVSAEDLRKVKIKKATIESAARRLGGGKEAMKQLLKLILEWVQTNHLQRRRTTTTTTNLSYQQSFQQDPFQNPNPNNNNLIPPSDQTCFSPSTWVPPPPQQQAFVSDPGFGYMPAPNYPPQPEFLPLLESPPSWPPPPQSGPMPHQQFPMPPTSQYNQFGDPTGFNGYNMNPYQYPYVPAGQMRDQRLLRLCSSATKEARKKRMARQRRFLSHHHRHNNNNNNNNNNQQNQTQIGETCAAVAPQLNPVATTATGGTWMYWPNVPAVPPQLPPVMETQLPTMDRAGSASAMPRQQVVPDRRQGWKPEKNLRFLLQKVLKQSDVGNLGRIVLPKKEAETHLPELEARDGISLAMEDIGTSRVWNMRYRFWPNNKSRMYLLENTGDFVKTNGLQEGDFIVIYSDVKCGKYLIRGVKVRQPSGQKPEAPPSSAATKRQNKSQRNINNNSPSANVVVASPTSQTVK',
  },
}

export default a
