import { Science } from '@mui/icons-material'
import React from 'react'
import EFPViewer from '../eFP/Viewer'
import ExperimentEFPIcon from './icon'
import Thumbnail from '../../../thumbnails/tissue_efp.png'

export default new EFPViewer(
  'tissue',
  'Tissue & Experiment eFP',
  [
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/Chemical/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/Chemical/Arabidopsis_thaliana.xml',
      name: 'Chemical eFP',
      id: 'ChemicalView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/AbioticStress/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/AbioticStress/Arabidopsis_thaliana.xml',
      name: 'Abiotic Stress eFP',
      id: 'AbioticStressView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/AbioticStressII/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/AbioticStressII/Arabidopsis_thaliana.xml',
      name: 'Abiotic Stress II eFP',
      id: 'AbioticStressIIView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/DNADamage/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/DNADamage/Arabidopsis_thaliana.xml',
      name: 'DNA Damage eFP (RNA-Seq data)',
      id: 'DNADamageView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/Heteroderaschachtii/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/Heteroderaschachtii/Arabidopsis_thaliana.xml',
      name: 'Heterodera schachtii eFP (RNA-Seq data)',
      id: 'HeteroderaschachtiiView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/GuardCellDrought/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/GuardCellDrought/Arabidopsis_thaliana.xml',
      name: 'Guard Cell Drought eFP',
      id: 'GuardCellDroughtView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/GuardCellMeristemoids/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/GuardCellMeristemoids/Arabidopsis_thaliana.xml',
      name: 'Guard Cell Meristemoids eFP',
      id: 'GuardCellMeristemoidsView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/GuardCellMutantAndWildTypeGuardCellABAResponse/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/GuardCellMutantAndWildTypeGuardCellABAResponse/Arabidopsis_thaliana.xml',
      name: 'Guard Cell Mutant And Wild Type Guard Cell ABA Response eFP',
      id: 'GuardCellMutantAndWildTypeGuardCellABAResponseView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/GuardCellSuspensionCellABAResponseWithROSScavenger/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/GuardCellSuspensionCellABAResponseWithROSScavenger/Arabidopsis_thaliana.xml',
      name: 'Guard Cell Suspension Cell ABA Response With ROS Scavenger eFP',
      id: 'GuardCellSuspensionCellABAResponseWithROSScavengerView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificGuardAndMesophyllCells/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificGuardAndMesophyllCells/Arabidopsis_thaliana.xml',
      name: 'Tissue Specific Guard And Mesophyll Cells eFP',
      id: 'TissueSpecificGuardAndMesophyllCellsView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificEmbryoDevelopment/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificEmbryoDevelopment/Arabidopsis_thaliana.xml',
      name: 'Tissue Specific Embryo Development eFP',
      id: 'TissueSpecificEmbryoDevelopmentView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificMicrogametogenesis/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificMicrogametogenesis/Arabidopsis_thaliana.xml',
      name: 'Tissue Specific Microgametogenesis eFP',
      id: 'TissueSpecificMicrogametogenesisView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificPollenGermination/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificPollenGermination/Arabidopsis_thaliana.xml',
      name: 'Tissue Specific Pollen Germination eFP',
      id: 'TissueSpecificPollenGerminationView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificRoot/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificRoot/Arabidopsis_thaliana.xml',
      name: 'Tissue Specific Root eFP',
      id: 'TissueSpecificRootView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificShootApicalMeristem/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificShootApicalMeristem/Arabidopsis_thaliana.xml',
      name: 'Tissue Specific Shoot Apical Meristem eFP',
      id: 'TissueSpecificShootApicalMeristemView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificStemEpidermis/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificStemEpidermis/Arabidopsis_thaliana.xml',
      name: 'Tissue Specific Stem Epidermis eFP',
      id: 'TissueSpecificStemEpidermisView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificStigmaAndOvaries/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificStigmaAndOvaries/Arabidopsis_thaliana.xml',
      name: 'Tissue Specific Stigma And Ovaries eFP',
      id: 'TissueSpecificStigmaAndOvariesView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificTrichomes/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificTrichomes/Arabidopsis_thaliana.xml',
      name: 'Tissue Specific Trichomes eFP',
      id: 'TissueSpecificTrichomesView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificXylemAndCork/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/TissueSpecificXylemAndCork/Arabidopsis_thaliana.xml',
      name: 'Tissue Specific Xylem And Cork eFP',
      id: 'TissueSpecificXylemAndCorkView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressBotrytiscinerea/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressBotrytiscinerea/Arabidopsis_thaliana.xml',
      name: 'Biotic Stress Botrytis cinerea eFP',
      id: 'BioticStressBotrytiscinereaView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressElicitors/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressElicitors/Arabidopsis_thaliana.xml',
      name: 'Biotic Stress Elicitors eFP',
      id: 'BioticStressElicitorsView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressErysipheorontii/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressErysipheorontii/Arabidopsis_thaliana.xml',
      name: 'Biotic Stress Erysiphe orontii eFP',
      id: 'BioticStressErysipheorontiiView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressHyaloperonosporaarabidopsidis/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressHyaloperonosporaarabidopsidis/Arabidopsis_thaliana.xml',
      name: 'Biotic Stress Hyaloperonospora arabidopsidis eFP',
      id: 'BioticStressHyaloperonosporaarabidopsidisView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressMyzuspersicaere/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressMyzuspersicaere/Arabidopsis_thaliana.xml',
      name: 'Biotic Stress Myzus persicaere eFP',
      id: 'BioticStressMyzuspersicaereView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressPhytophthorainfestans/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressPhytophthorainfestans/Arabidopsis_thaliana.xml',
      name: 'Biotic Stress Phytophthora infestans eFP',
      id: 'BioticStressPhytophthorainfestansView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressPseudomonassyringae/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressPseudomonassyringae/Arabidopsis_thaliana.xml',
      name: 'Biotic Stress Pseudomonas syringae eFP',
      id: 'BioticStressPseudomonassyringaeView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressGolovinomycesorontii/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/BioticStressGolovinomycesorontii/Arabidopsis_thaliana.xml',
      name: 'Biotic Stress Golovinomyces orontii eFP',
      id: 'BioticStressGolovinomycesorontiiView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/RootImmunityElicitation/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/RootImmunityElicitation/Arabidopsis_thaliana.xml',
      name: 'Root Immunity Elicitation eFP (RNA-Seq data)',
      id: 'RootImmunityElicitationView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/Germination/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/Germination/Arabidopsis_thaliana.xml',
      name: 'Germination eFP (RNA-Seq data)',
      id: 'GerminationView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/ShootApex/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/ShootApex/Arabidopsis_thaliana.xml',
      name: 'Shoot Apex eFP (RNA-Seq data)',
      id: 'ShootApexView',
    },
    {
      svgURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/SingleCell/Arabidopsis_thaliana.svg',
      xmlURL:
        'http://bar.utoronto.ca/eplant/data/experiment/efps/SingleCell/Arabidopsis_thaliana.xml',
      name: 'Single Cell eFP (RNA-Seq data)',
      id: 'SingleCellView',
    },
  ],
  () => <ExperimentEFPIcon />,
  'Visualize gene expression across multiple tissues and experiment samples.',
  Thumbnail
)
