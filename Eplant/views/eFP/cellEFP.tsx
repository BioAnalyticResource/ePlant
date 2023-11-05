import GeneticElement from "@eplant/GeneticElement";
import { ViewDataError } from "@eplant/View/viewData";
import EFP from ".";
import _ from 'lodash'
import { EFPData, EFPGroup, EFPId, EFPTissue } from "./types";
import { Popper, Grow, Box, Table, TableBody, TableRow, TableCell, useTheme } from "@mui/material";
import React from "react";
import CellSVGTooltip from "./Tooltips/cellEFPTooltip";

export default class CellEFP extends EFP{
  tooltipComponent: (props: { el: SVGElement | null; group: EFPGroup; tissue: EFPTissue; data: EFPData; }) => React.JSX.Element; 
  constructor(
        public name: string,
        public id: EFPId,
        public svgURL: string,
        public xmlURL: string
      ) {
        super(name, id, svgURL, xmlURL);
        this.tooltipComponent = CellSVGTooltip
      }
    
    getInitialData = async (
        gene: GeneticElement | null,
        loadEvent: (val: number) => void
      ): Promise<EFPData> => {
        if (!gene) throw ViewDataError.UNSUPPORTED_GENE
        const parser = new DOMParser()
        const xml = await fetch(this.xmlURL).then(async (res) =>
          parser.parseFromString(await res.text(), 'text/xml')
        )
        const webservice = "https://bar.utoronto.ca/eplant/cgi-bin/groupsuba4.php"

        const sampleNames: string[] = [];
        
        // Should only be one group
        const groups = Array.from(xml.getElementsByTagName('image')).map(
            (groupData) =>{
                const tissues = Array.from(groupData.getElementsByTagName('subcellular'));
                return {
                    name: groupData.getAttribute("id") || "",
                    tissues: tissues.map((tissue) =>{
                        const sample = tissue.getAttribute('sample') || "";
                        sampleNames.push(sample);
                        return {
                            name: tissue.getAttribute("name") || "",
                            id:  tissue.getAttribute("id") || "",
                            samples: [sample]
                        }
                    }
                    )

                }
            }
        );
        
        // Fetch sample data by making POST to webservice
        let data: {[key: string]: number} = {}
        const response = await fetch(webservice, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ AGI_IDs: gene.id.split(" "), include_predicted: true }),
          })

        const jsonResponse: [{[key: string]: {[key: string]: number}}] = await response.json();
        
        Array.from(jsonResponse).forEach(element => {
            data = element.data as {[key: string]: number};
        });

        const groupData = groups.map(
            (group) =>{
                const tissues: EFPTissue[] = group.tissues.map((tissue) => ({
                    name: tissue.name,
                    id: tissue.id,
                    ...this._getEFPSampleData(
                      tissue.samples
                        .map((name) => data[name.toLowerCase()]||0)
                        .filter((n) => Number.isFinite(n))
                )
            }))
                const tissueValues = tissues.map((tissue) => tissue.mean)
                return {
                    name: group.name,
                    tissues: tissues.filter((t) => t.samples > 0),
                    ...this._getEFPSampleData(tissueValues),
                  }
        }).filter((g) => Number.isFinite(g.mean))

        const out: EFPData = {
            groups: groupData,
            min: Math.min(...groupData.map((g) => g.min)),
            max: Math.max(...groupData.map((g) => g.max)),
            mean: _.mean(groupData.map((g) => g.mean)),
            std:
                _.sum(groupData.map((g) => g.std ** 2 * g.samples)) /
                _.sum(groupData.map((g) => g.samples)),
            samples: _.sum(groupData.map((g) => g.samples)),
            supported:
                Number.isFinite(_.mean(groupData.map((g) => g.mean))) &&
                groupData.length > 0,
        }
        return out
      }
    }