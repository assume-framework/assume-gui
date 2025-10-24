import type { ChangeEvent } from "react";
import { handleChange } from "../../utils";
import type { EditComponentArgs } from "../NodeEditSidebar";
import Select from "../InputComponents/Select";
import Input from "../InputComponents/Input";
import Modal from "../InputComponents/Modal";



function editUnit ({ id, data, updateNodeValue }: EditComponentArgs) {
    const onChange = handleChange(id, data, updateNodeValue);
    const reset = (event: ChangeEvent<any>) => updateNodeValue(id, { name: data.name, unitType: event.target.value })

    return (
        <>
            <Select label="Unit type" id="unitType" value={data.unitType} onChange={reset}>
                <option value="demand">Demand</option>
                <option value="storage">Storage</option>
                <option value="power_plant">Powerplant</option>
                <option value="building">Building</option>
                <option value="hydrogen_plant">Hydrogen Plant</option>
                <option value="steel_plant">Steel Plant</option>
            </Select>
            {data.unitType && (
                <>
                    <Input label="Technology" id="technology" type="text" value={data.technology} onChange={onChange("technology")} />
                </>
            )}
            {data.unitType === "demand" && (
                <>
                    <Input label="Min Power" id="min_power" type="number" value={data.min_power} onChange={onChange("min_power")} />
                    <Input label="Max Power" id="max_power" type="number" value={data.max_power} onChange={onChange("max_power")} />
                    <Input label="Price" id="price" type="number" value={data.price ?? 3000} onChange={onChange("price")} />
                </>
            )}
            {data.unitType === "power_plant" && (
                <>
                    <Input required label="Max Power" id="max_power" type="number" value={data.max_power} onChange={onChange("max_power")} />
                    <Input required label="Min Power" id="min_power" type="number" value={data.min_power ?? 0} onChange={onChange("min_power")} />
                    <Input label="Emission Factor (tCO2/MWh)" id="emission_factor" type="number" value={data.emission_factor ?? 0} onChange={onChange("emission_factor")} />
                    <Input label="Efficiency" id="efficiency" type="number" value={data.efficiency ?? 1} onChange={onChange("efficiency")} />
                    <Input label="Ramp Down (MW/min)" id="ramp_down" type="number" value={data.ramp_down ?? 0} onChange={onChange("ramp_down")} />
                    <Input label="Ramp Up (MW/min)" id="ramp_up" type="number" value={data.ramp_up ?? 0} onChange={onChange("ramp_up")} />
                    <Input label="Min Operating Time (min)" id="min_operating_time" type="number" value={data.min_operating_time ?? 0} onChange={onChange("min_operating_time")} />
                    <Input label="Min Downtime (min)" id="min_downtime" type="number" value={data.min_downtime ?? 0} onChange={onChange("min_downtime")} />
                </>
            )}
            {data.unitType === "storage" && (
                <>
                    <Input label="Max Power Charge" id="max_power_charge" type="number" value={data.max_power_charge} onChange={onChange("max_power_charge")} />
                    <Input label="Max Power Discharge" id="max_power_discharge" type="number" value={data.max_power_discharge} onChange={onChange("max_power_discharge")} />
                    <Input label="Max SOC" id="max_soc" type="number" value={data.max_soc} onChange={onChange("max_soc")} />
                    <Input label="Min Power Charge" id="min_power_charge" type="number" value={data.min_power_charge ?? 0} onChange={onChange("min_power_charge")} />
                    <Input label="Min Power Discharge" id="min_power_discharge" type="number" value={data.min_power_discharge ?? 0} onChange={onChange("min_power_discharge")} />
                    <Input label="Min SOC" id="min_soc" type="number" value={data.min_soc ?? 0} onChange={onChange("min_soc")} />
                    <Input label="Initial SOC" id="initial_soc" type="number" value={data.initial_soc ?? 0} onChange={onChange("initial_soc")} />
                    <Input label="SOC Tick" id="soc_tick" type="number" value={data.soc_tick ?? 0.01} onChange={onChange("soc_tick")} />
                </>
            )}
            {data.unitType && (
                <>
                    <Modal name="Forecast settings">
                        <Input label="Forecast availability" id="forecast_availability" type="number" value={data.forecast_availability ?? 1} onChange={onChange("forecast_availability")} />
                        <Input label="Forecast fuel price" id="forecast_fuel_price" type="number" value={data.forecast_fuel_price ?? 10} onChange={onChange("forecast_fuel_price")} />
                        <Input label="Forecast CO2 price" id="forecast_co2_price" type="number" value={data.forecast_co2_price ?? 10} onChange={onChange("forecast_co2_price")} />
                        <Input label="Forecast Demand" id="forecast_demand" type="number" value={data.forecast_demand ?? 100} onChange={onChange("forecast_demand")} />
                        <Input label="Forecast Price" id="forecast_price" type="number" value={data.forecast_price ?? 50} onChange={onChange("forecast_price")} />
                    </Modal>
                </>
            )}
        </>
    )
}

export default editUnit;
