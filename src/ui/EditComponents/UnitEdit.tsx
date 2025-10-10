import { handleChange } from "../../utils";
import type { EditComponentArgs } from "../NodeEditSidebar";
import { Input, Select } from "./Input";



export default ({ id, data, updateNodeValue }: EditComponentArgs) => {
    const onChange = handleChange(id, data, updateNodeValue);
    return (
        <>
            <Select label="Unit type" id="unitType" value={data.unitType} onChange={onChange("unitType")}>
                <option value="storage">Storage</option>
                <option value="powerplant">Powerplant</option>
                <option value="building">Building</option>
                <option value="hydrogen_plant">Hydrogen Plant</option>
                <option value="steel_plant">Steel Plant</option>
            </Select>
            <Input label="Min Power" id="min_power" type="number" value={data.min_power} onChange={onChange("min_power")} />
            <Input label="Max Power" id="max_power" type="number" value={data.max_power} onChange={onChange("max_power")} />
            <Input label="Efficiency" id="efficiency" type="number" value={data.efficiency} onChange={onChange("efficiency")} />
            <Input label="Ramp Down (MW/min)" id="ramp_down" type="number" value={data.ramp_down} onChange={onChange("ramp_down")} />
            <Input label="Ramp Up (MW/min)" id="ramp_up" type="number" value={data.ramp_up} onChange={onChange("ramp_up")} />
            <Input label="Emission Factor (tCO2/MWh)" id="emission_factor" type="number" value={data.emission_factor} onChange={onChange("emission_factor")} />
            <Input label="Min Operating Time (min)" id="min_operating_time" type="number" value={data.min_operating_time} onChange={onChange("min_operating_time")} />
            <Input label="Min Downtime (min)" id="min_downtime" type="number" value={data.min_downtime} onChange={onChange("min_downtime")} />
        </>
    )
}
