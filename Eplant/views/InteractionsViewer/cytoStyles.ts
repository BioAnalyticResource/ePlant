const styles: any = [
    {
        selector: 'node',
        style: {
            'text-background-shape': 'roundrectangle',
            'text-background-color': 'white',
            'text-background-opacity': 0.9,
            'background-color': '#f4f4f4',
            'font-size': '11px',
            //'font-weight': 'bold',
            'text-halign': 'center',
            'border-width': '0px',
            //'width': 'auto',
            'text-background-padding': '2px',
        },
    },
    {
        selector: '.compound-top',
        style: {
            shape: 'roundrectangle',
            'background-color': '#F3F3F3',
            'text-background-color': 'white',
            'text-wrap': 'wrap',
            width: '300px',
            color: '#000',
            'font-size': '10px',
            'font-weight': 'bold',
            'text-outline-width': '0px',
            'text-valign': 'top',
        },
    },
    {
        selector: '#COMPOUND_DNA',
        style: {
            'background-opacity': '0',
            'text-background-opacity': '1',
            label: 'Protein-DNA\nInteractions',
        },
    },
    {
        selector: '#COMPOUND_PROTEIN',
        style: {
            'background-opacity': '0',
            'text-background-opacity': '1',
            label: 'Protein-Protein\nInteractions',
        },
    },
    {
        selector: '.protein-compound',
        style: {
            'background-opacity': 0,
            events: 'no',
        },
    },
    {
        selector: '.protein-back[borderWidth]',
        style: {
            height: 'data(height)',
            width: 'data(width)',
            'pie-size': '100%',
            'pie-1-background-color': 'data(pie1Colour)',
            'pie-1-background-size': 'data(pie1Size)',
            'pie-1-background-opacity': 1,
            'pie-2-background-color': 'data(pie2Colour)',
            'pie-2-background-size': 'data(pie2Size)',
            'pie-2-background-opacity': 1,
            'pie-3-background-color': 'data(pie3Colour)',
            'pie-3-background-size': 'data(pie3Size)',
            'pie-3-background-opacity': 1,
            'pie-4-background-color': 'data(pie4Colour)',
            'pie-4-background-size': 'data(pie4Size)',
            'pie-4-background-opacity': 1,
            'border-width': 'data(borderWidth)',
            'border-color': '#99CC00',
            events: 'no',
        },
    },
    {
        selector: '.protein-node',
        style: {
            height: '36px',
            width: '36px',
            padding: '3px 3px 3px 3px',
            'text-valign': 'center',
            content: 'data(content)',
            events: 'yes',
            'z-index': 10,
        },
    },
    {
        selector: '[id $= "QUERY_BACK"]',
        style: {
            height: '60px',
            width: '60px',
        },
    },
    {
        selector: '[id $= "QUERY_NODE"]',
        style: {
            height: '48px',
            width: '48px',
            'font-size': '11px',
            'z-index': 10000000,
        },
    },
    {
        selector: '.dna-node',
        style: {
            shape: 'square',
            width: '34px',
            height: '34px',
            'border-width': '4px',
            padding: '3px 3px 3px 3px',
            'border-color': '#030303',
            'text-valign': 'center',
            content: 'data(content)',
            'z-index': 10,
        },
    },
    {
        selector: 'edge',
        style: {
            width: 'data(size)',
            'line-style': 'data(lineStyle)',
            'line-color': 'data(lineColor)',
            'control-point-distance': '50px',
            'control-point-weight': '0.5',
        },
    },
    {
        selector: '.protein-edge',
        style: {
            'curve-style': 'bezier',
            'mid-target-arrow-shape': 'none',
        },
    },
    {
        selector: '.dna-edge',
        style: {
            'curve-style': 'unbundled-bezier',
            'mid-target-arrow-shape': 'triangle',
            'mid-target-arrow-color': 'data(lineColor)',
        },
    },
    {
        selector: '.chr-edge',
        style: {
            'curve-style': 'unbundled-bezier',
            'mid-target-arrow-shape': 'triangle',
            'mid-target-arrow-color': 'data(arrowColor)',
            'control-point-distance': '50px',
            'control-point-weight': '0.5',
        },
    },
    {
        selector: '.loaded',
        style: {
            'background-color': '#3C3C3C',
            'text-background-color': '#3C3C3C',
            color: '#FFFFFF',
        },
    },
    {
        selector: '#noInteractionLabel',
        style: {
            shape: 'circle',
            content: 'No interactions found for this gene.',
            width: '1px',
            height: '1px',
            color: '#000',
            'text-background-opacity': '0',
            'font-size': 15,
        },
    },
]
export default styles