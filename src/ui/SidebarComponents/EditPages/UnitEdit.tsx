import type {ChangeEvent} from "react";
import {handleChange} from "../../../utils";
import type {EditComponentArgs} from "../NodeEditSidebar";
import Select from "../../InputComponents/Select";
import Input from "../../InputComponents/Input";
import Modal from "../../InputComponents/Modal";


export default function editUnit({id, data, updateNodeValue}: EditComponentArgs) {
    const onChange = handleChange(id, data, updateNodeValue);
    const reset = (event: ChangeEvent<HTMLSelectElement>) => updateNodeValue(id, {name: data.name, unitType: event.target.value}, false)

    return (
        <>
            <Select label="Unit type" value={data.unitType} onChange={reset}>
                <option value="demand">Demand</option>
                <option value="storage">Storage</option>
                <option value="power_plant">Powerplant</option>
                <option value="exchange">Exchange</option>
                {/*
                <option value="building">Building</option>
                <option value="hydrogen_plant">Hydrogen Plant</option>
                <option value="steel_plant">Steel Plant</option>
                */}
            </Select>
            {data.unitType && (
                <>
                    <Input label="Technology" type="text" value={data.technology}
                           onChange={onChange("technology")}/>
                </>
            )}
            {data.unitType === "demand" && (
                <>
                    <Input label="Min Power" type="number" value={data.min_power}
                           onChange={onChange("min_power")}/>
                    <Input label="Max Power" type="number" value={data.max_power}
                           onChange={onChange("max_power")}/>
                    <Input label="Price" type="number" value={data.price ?? 3000}
                           onChange={onChange("price")}/>
                    <Modal name="Forecast settings">
                        <Input label="Forecast availability" type="number"
                               value={data.forecast_availability ?? 1} onChange={onChange("forecast_availability")}/>
                        <Input label="Forecast Demand" type="number"
                               value={data.forecast_demand ?? 100} onChange={onChange("forecast_demand")}/>
                    </Modal>
                </>
            )}
            {data.unitType === "power_plant" && (
                <>
                    <Input required label="Max Power" type="number" value={data.max_power}
                           onChange={onChange("max_power")}/>
                    <Input required label="Min Power" type="number" value={data.min_power ?? 0}
                           onChange={onChange("min_power")}/>
                    <Input label="Emission Factor (tCO2/MWh)" type="number"
                           value={data.emission_factor ?? 0} onChange={onChange("emission_factor")}/>
                    <Input label="Efficiency" type="number" value={data.efficiency ?? 1}
                           tooltip={"Value between 0 and 1"}
                           onChange={onChange("efficiency")}/>
                    <Input label="Ramp Down (MW/min)" type="number" value={data.ramp_down ?? 0}
                           onChange={onChange("ramp_down")}/>
                    <Input label="Ramp Up (MW/min)" type="number" value={data.ramp_up ?? 0}
                           onChange={onChange("ramp_up")}/>
                    <Input label="Min Operating Time (min)" type="number"
                           value={data.min_operating_time ?? 1} onChange={onChange("min_operating_time")}/>
                    <Input label="Min Downtime (min)" type="number" value={data.min_downtime ?? 1}
                           onChange={onChange("min_downtime")}/>
                    <Modal name="Forecast settings">
                        <Input label="Forecast availability" type="number"
                               value={data.forecast_availability ?? 1} onChange={onChange("forecast_availability")}/>
                        <Input label="Forecast fuel price" type="number"
                               value={data.forecast_fuel_price ?? 10} onChange={onChange("forecast_fuel_price")}/>
                        <Input label="Forecast CO2 price" type="number"
                               value={data.forecast_co2_price ?? 10} onChange={onChange("forecast_co2_price")}/>
                    </Modal>
                </>
            )}
            {data.unitType === "storage" && (
                <>
                    <Input label="Max Power Charge" type="number" value={data.max_power_charge}
                           onChange={onChange("max_power_charge")}/>
                    <Input label="Max Power Discharge" type="number"
                           value={data.max_power_discharge} onChange={onChange("max_power_discharge")}/>
                    <Input label="Max SOC" type="number" value={data.max_soc}
                           onChange={onChange("max_soc")}/>
                    <Input label="Min Power Charge" type="number"
                           value={data.min_power_charge ?? 0} onChange={onChange("min_power_charge")}/>
                    <Input label="Min Power Discharge" type="number"
                           value={data.min_power_discharge ?? 0} onChange={onChange("min_power_discharge")}/>
                    <Input label="Min SOC" type="number" value={data.min_soc ?? 0}
                           onChange={onChange("min_soc")}/>
                    <Input label="Initial SOC" type="number" value={data.initial_soc ?? 0}
                           onChange={onChange("initial_soc")}/>
                    <Input label="SOC Tick" type="number" value={data.soc_tick ?? 0.01}
                           onChange={onChange("soc_tick")}/>
                    <Modal name="Forecast settings">
                        <Input label="Forecast availability" type="number"
                               value={data.forecast_availability ?? 1} onChange={onChange("forecast_availability")}/>
                    </Modal>
                </>
            )}
            {(data.unitType === "exchange") && (
                <>
                    <Input type="number" label="Volume import" value={data.volume_import}
                           onChange={onChange("volume_import")}/>
                    <Input type="number" label="Volume export" value={data.volume_export}
                           onChange={onChange("volume_export")}/>
                    <Modal name="Forecast settings">
                        <Input label="Forecast availability" type="number"
                               value={data.forecast_availability ?? 1} onChange={onChange("forecast_availability")}/>
                        <Input label="Forecast import volume" type="number"
                               value={data.forecast_volume_import ?? 0} onChange={onChange("forecast_volume_import")}/>
                        <Input label="Forecast export volume" type="number"
                               value={data.forecast_volume_export ?? 0} onChange={onChange("forecast_volume_export")}/>
                    </Modal>
                </>
            )}
        </>
    )
}
