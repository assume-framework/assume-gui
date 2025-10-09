import type { EditComponentArgs } from "../NodeEditSidebar"



export default ({id, data, updateNodeValue }: EditComponentArgs) => {
    const onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const d = { ...data }
        d[key] = e.target.value
        updateNodeValue(id, d);
    }
    return (
        <>
            <label htmlFor="unitType">Unit Type: </label>
            <select onChange={e => updateNodeValue(id, { ...data, unitType: e.target.value })}>
                <option value="storage">Storage</option>
                <option value="powerplant">Powerplant</option>
                <option value="building">Building</option>
                <option value="hydrogen_plant">Hydrogen Plant</option>
                <option value="steel_plant">Steel Plant</option>
            </select>
            <br />
            <label htmlFor="min_power">Min Power: </label>
            <input type="number" value={data.min_power} onChange={onChange("min_power")} />
            <br />
            <label htmlFor="max_power">Max Power: </label>
            <input type="number" value={data.efficiency} onChange={onChange("efficiency")} />
            <br />
            <label htmlFor="ramp_down">Ramp Down (MW/min): </label>
            <input type="number" value={data.ramp_down} onChange={onChange("ramp_down")} />
            <br />
            <label htmlFor="ramp_up">Ramp Up (MW/min): </label>
            <input type="number" value={data.ramp_up} onChange={onChange("ramp_up")} />
            <br />
            <label htmlFor="efficiency">Efficiency: </label>
            <input type="number" value={data.efficiency} onChange={onChange("efficiency")} />
            <br />
            <label htmlFor="emission_factor">Emission Factor (tCO2/MWh): </label>
            <input type="number" value={data.emission_factor} onChange={onChange("emission_factor")} />
            <br />
            <label htmlFor="min_operating_time">Min Operating Time (min): </label>
            <input type="number" value={data.min_operating_time} onChange={onChange("min_operating_time")} />
            <br />
            <label htmlFor="min_downtime">Min Downtime (min): </label>
            <input type="number" value={data.min_downtime} onChange={onChange("min_downtime")} />
        </>
    )
}
