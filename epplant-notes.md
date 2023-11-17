vincent

Gene-centric tool

30 000
15 eplants
the dropdown should show the homologous gene in another plant

where in the cell this happens

copy gene sequence in gen info viewer
//./

First load: get started pane
Should not be able to delete all tabs
Entirety of cards at bottom should be clickable

Gene info:
copypaste buttons

Publications:
gene RIF should open in a new tab, not take from this one

Plant:
what does max stand for? What are AtGenExpress or Klepikova
is the sorting mechanism working?

tissue/exp:
- can't double click to zoom
- reset pan/zoom doesnt work tissue/experiement AT3G24650
- tab through thumbnails on tissue/experiemnt view
- singlecell efprna seq data shows n/a in the viewer (disable select dropdown iews for views that don't exist)
- "Cannot view tissue specific xylem and cork efp for AT3G24650"  clearer error message / capitalization

# ePlant
ePlant is a gene-first visualization tool for plant genomes. 

## Using ePlant
Create a new tab or choose a gene of interest (GOI) using the search bar on the left. 
> Currently the only plant genome available is that of _arabidopsis thaliania_. 

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
  Molecular
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

### Plant
A visual map of where the gene is expressed in the body of the plant.
  - Choose a data mode (relative/absolute)
  - Select diagram: AtGenExpress or Klepikova
  - Sort diagrams by name or expression level
  - Hover over images for more information

### Tissue & Experiment
Expression patterns in different cells.
 
<!-- 
### Heat map
Based on experiments done by the lab, the striated bars show [when?where?] a given gene is expressed.
Yellow: weak, red: strong

### World (KM scale)
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

## History
This repo is [ePlant 3](https://bar.utoronto.ca/~awaesep/ePlant3) - ePlant 1 and [ePlant 2](https://bar.utoronto.ca/eplant/) are old versions. 
<!-- by [this person]() and [these people](). -->

If you'd like to contribute, [guidelines are here]() and [issues are here](https://github.com/BioAnalyticResource/ePlant/issues)!

## Roadmap
More plant genomes.


## How to contribute

1. Create a fork and download it to your local machine.
    ```bash
    git clone <your fork address>
    npm install
    npm run dev
    ```
1. Comment on a ticket to take it.
1. Turn on notifications for that thread.

## Glossary

**BAR**: Bio-analytic resource; a group of bioinformatics tools created by the [lab of Dr. Nicholas Provart](http://provart.csb.utoronto.ca/the-lab/) at the University of Toronto.

**BAR API**: An application programming interface of bio-analytic resources available at https://bar.utoronto.ca/api/. 

**GOI**: Gene of interest; the gene displayed in ePlant.

**eFP**: Electronic fluorescent pictographic



// add a linter for the styles

destructure your props
useEffect not React.useEffect
Arrow functions unless you have a reason not to use one
Use interfaces

delete storybook folder

New window crash bc undefined inside flex layout

Replace the local API url with local host 
V dev server props the bar and rewriter the origin header

//
eplant:
Reducer function needs to be rewritten to use useReducerAtom or atomWithReducer