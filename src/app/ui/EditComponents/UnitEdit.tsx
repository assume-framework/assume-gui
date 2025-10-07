import { EditSidebarData } from "../NodeEditSidebar";


export default function UnitEdit(updateNodeValue: (data: EditSidebarData) => void) {
    return (
        <select onChange={e => updateNodeValue({ ...data, unitType: e.target.value })}>
            <option value="storage">Storage</option>
            <option value="powerplant">Powerplant</option>
            <option value="building">Building</option>
            <option value="hydrogen_plant">Hydrogen Plant</option>
            <option value="steel_plant">Steel Plant</option>
        </select>
    )
}
