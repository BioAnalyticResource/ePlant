# ePlant
ePlant is a gene-centric visualization tool for plant genomes.

## Using ePlant
Choose a gene of interest (GOI) using the search bar on the left. Currently we only support the _Arabidopsis thaliania_ genome.

Use the navigation dropdown to select different views. Each view displays information from the organism level to the molecular leve. Nanometer scale all the way to the kilometer scale.

Available views:

  ℹ️ Gene information. This view provides a brief description, location, gene model, DNA sequence, and protein sequence

  📑 Publications. This view displays publications and Gene RIFs related to your gene of interest.

  🌱 Plant eFP. This view displays expression levels for your gene of interest at the organism level.

  🔬 Tissue & Experiment eFP: This view displays expression levels for your gene of interest after experimental treatment.


## Roadmap

## How to contribute
Read the [onboarding blueprint](https://github.com/BioAnalyticResource/ePlant/issues/29).

If you'd like to contribute, [pick an issue](https://github.com/BioAnalyticResource/ePlant/issues). We use a forking workflow. For an in-depth look at what that means, [read this article](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow).

### Quickstart
1. [Make a fork of eplant](https://github.com/BioAnalyticResource/ePlant/fork).

2. Go to the new fork. There is a big green button to clone
   ```bash
   git clone <fork_address>
   ```

3. Set up the main ePlant project as your upstream branch.
    ```bash
    git remote add upstream https://github.com/BioAnalyticResource/ePlant
    ```

4. Verify your node and npm versions. Most folks are working with ___Node v18.0.0^__ and __npm 9.8.0^__.
    ```bash
      node -v
      npm -v
    ```
    If that command doesn't return anything, [install the LTS version of Node](https://nodejs.org/en/download).

5. Download all dependencies.
    ```bash
    npm i
    ```
6. Run your local version of ePlant.
    ```bash
    npm run dev
    ```
7. Comment on a ticket to take it.
8. Turn on notifications for that thread.
9.  Complete the necessary fix.
10. Push your changes to **your** fork.
    ```bash
    git push origin main
    ```
11. Create a pull request.
    > Underneath where it says **Compare changes**, there is a line that says
      > `Compare changes across branches, commits, tags, and more below. If you need to, you can also compare across forks.`
    Click that link to bring up a dropdown menu of ePlant forks.
12. Choose your fork as the head repository and `https://github.com/BioAnalyticResource/ePlant/` as the base repository.
13. Give the pull request a descriptive title so that someone who didn't work on it will know what you did. Link the issue if possible.

### Recommended VSCode extensions
* ES7+ React/Redux/React-Native snippets
* Prettier
* Markdown All in One
* GitHub Actions


## Glossary

**AtGenExpress**: A multinational effort designed to uncover the transcriptome of the multicellular model organism _Arabidopsis thaliana_.

**BAR**: Bio-analytic resource; a group of bioinformatics tools created by the [lab of Dr. Nicholas Provart](http://provart.csb.utoronto.ca/the-lab/) at the University of Toronto.

**BAR API**: An application programming interface of bio-analytic resources available at https://bar.utoronto.ca/api/.

**GOI**: Gene of interest; the gene displayed in ePlant.

**eFP**: Electronic fluorescent pictographic

**GeneRIF**: Gene reference into function; A [standard](https://www.ncbi.nlm.nih.gov/gene/about-generif) that provides a mechanism to allow scientists to add to the functional annotation of genes described in [Gene](https://www.ncbi.nlm.nih.gov/gene).
