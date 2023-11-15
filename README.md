# ePlant
ePlant is a gene-centered visualization tool for plant genomes.

## Using ePlant
Create a new tab or choose a gene of interest (GOI) using the search bar on the left. 
> Currently the only plant genome available is that of _Arabidopsis thaliania_. 

Use the navigation dropdown to discover more information about the expression of that gene from a phenotypic to a molecular level.

Currently available views:

  [ℹ️ Gene information]()

  [📑 Publications ]()

  [🌱 Plant]()

  [🔬 Tissue & Experiment]()

 > Coming views:
  🌡️ Heat map
  🌎 World
  🧬 Chromosome 
  Interactions 
  Molecule
  Sequence 
🔄 Pathways 

### Gene information
Contains a list of gene information:
- Which views are available for this gene
- The gene name and aliases
- Brief and computational descriptions
- Curator summary
- Location and gene model
- DNA sequence
- Protein sequence

### Publication
A list of relevant publications.
- Author, year, journal, title, and links to publications associated with the GOI
- Gene RIFs with annotations and links source to paper

### Plant (cm scale)
A visual map of where the gene is expressed in the body of the plant.
  - Choose a data mode (relative/absolute)
  - Select diagram origin: [AtGenExpress](https://www.arabidopsis.org/portals/expression/microarray/ATGenExpress.jsp) or Klepikova (for Anna Klepikova, author of [this paper](https://pubmed.ncbi.nlm.nih.gov/27549386/) on arabidopsis)
  - Sort diagrams by name or expression level
  - Hover over images for more information

### Tissue & Experiment (mm scale)
Expression patterns in different cells.
 
<!-- 
### Heat map
Based on experiments done by the lab, the striated bars show [when?where?] a given gene is expressed.
Yellow: weak, red: strong

### World (km scale)
Gene extression infomration plotted on a map.
You can overlay climate information (precipitation, historical max temp, historical min temp).


### Chromosome (micro-meter, sub-micrometer)
Localization of the gene on the chromosomes. Can see local genes as well

### Interaction level
 Protein-protein and protein-DNA interactions for a given gene and geen product.

### Molecule (nano meter) 
Protein sequence

### Sequence viewer
JBrowser instance from Araport

### Navigation
See the relations of the gene to other plant genes. -->

## Roadmap

## How to contribute
Read the [onboarding blueprint](https://github.com/BioAnalyticResource/ePlant/issues/29).

If you'd like to contribute, [pick an issue](https://github.com/BioAnalyticResource/ePlant/issues). We use a forking workflow. For an in-depth look at what that means, [read this article](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow).

### Quickstart
1. Create a fork and download it to your local machine.
    ```bash
    git clone <your fork address>
    ```
1. Set up the main ePlant project as your upstream branch.
    ```bash
    git remote add upstream https://github.com/BioAnalyticResource/ePlant
    ```
1. Verify your node and npm versions. Most folks are working with Node v18.0.0^ and npm 9.8.0^.
    ```bash
      node -v
      npm -v
    ```
    If that command doesn't return anything, [install the LTS version of Node](https://nodejs.org/en/download).

1. Download all dependencies.
    ```bash
    npm i
    ```
1. Run your local version of ePlant.
    ```bash
    npm run dev
    ```
1. Comment on a ticket to take it.
1. Turn on notifications for that thread.
1. Complete the necessary fix.
1. Push your changes to **your** fork.
    ```bash
    git push origin main
    ```
1. Create a pull request. 
    > Underneath where it says **Compare changes**, there is a line that says 
      > `Compare changes across branches, commits, tags, and more below. If you need to, you can also compare across forks.`
    Click that link to bring up a dropdown menu of ePlant forks. 
1. Choose your fork as the head repository and `https://github.com/BioAnalyticResource/ePlant/` as the base repository.
1. Give the pull request a descriptive title so that someone who didn't work on it will know what you did. Link the issue if possible.

### Reviewing a pull request




## Glossary

**AtGenExpress**: A multinational effort designed to uncover the transcriptome of the multicellular model organism _Arabidopsis thaliana_. 

**BAR**: Bio-analytic resource; a group of bioinformatics tools created by the [lab of Dr. Nicholas Provart](http://provart.csb.utoronto.ca/the-lab/) at the University of Toronto.

**BAR API**: An application programming interface of bio-analytic resources available at https://bar.utoronto.ca/api/. 

**GOI**: Gene of interest; the gene displayed in ePlant.

**eFP**: Electronic fluorescent pictographic

**GeneRIF**: Gene reference into function; A [standard](https://www.ncbi.nlm.nih.gov/gene/about-generif) that provides a mechanism to allow scientists to add to the functional annotation of genes described in [Gene](https://www.ncbi.nlm.nih.gov/gene).