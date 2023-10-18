import EFP from ".";
import CellEFP from "../CellEFP";
import { EFPViewerData } from "./Viewer/types";
import { EFPId } from "./types";

export function efpFactory(views: EFPViewerData['views'])
{
    return views.map((view) => {
        return new EFP(view.name, view.id, view.svgURL, view.xmlURL);
    })
}

// export function cellEfpFactory(views: EFPViewerData['views'])
// {
//     return views.map((view) => {
//         return new CellEFP(view.name, view.id, view.svgURL, view.xmlURL);
//     })
// }