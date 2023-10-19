import EFP from ".";
import { EFPViewerData } from "./Viewer/types";
import CellEFP from "./cellEFP";

export function efpFactory(views: EFPViewerData['views'])
{
    return views.map((view) => {
        return new EFP(view.name, view.id, view.svgURL, view.xmlURL);
    })
}

export function cellEfpFactory(views: EFPViewerData['views'])
{
    return views.map((view) => {
        return new CellEFP(view.name, view.id, view.svgURL, view.xmlURL);
    })
}