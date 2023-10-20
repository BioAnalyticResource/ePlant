import EFP from ".";
import { EFPViewerData } from "./Viewer/types";
import CellEFP from "./cellEFP";


export class efpFactory{
    constructor(){}


    static makeEfps(views: EFPViewerData['views']){
        return views.map((view) => {
            return new EFP(view.name, view.id, view.svgURL, view.xmlURL);
        })
    }

    static makeCellEfps(views: EFPViewerData['views']){
        return views.map((view) => {
            return new CellEFP(view.name, view.id, view.svgURL, view.xmlURL);
        })
    }
}