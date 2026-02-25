import type {ChangeEvent} from "react";
import {handleChange} from "../../../utils";
import type {EditComponentArgs} from "../NodeEditSidebar";
import Select from "../../InputComponents/Select";
import Input from "../../InputComponents/Input";
import Modal from "../../InputComponents/Modal";


export default function editUnit({id, data, updateNodeValue, getErrorMessage}: EditComponentArgs) {
    const onChange = handleChange(id, data, updateNodeValue);
    const reset = (event: ChangeEvent<HTMLSelectElement>) => updateNodeValue(id, {
        name: data.name,
        unitType: event.target.value,
        errorField: '',
        errorMessage: ''
    }, false)

    return (
        <>
            <Select label="Unit type"
                    value={data.unitType}
                    onChange={reset}>
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
                    <Input label="Technology"
                           type="text"
                           errorMessage={getErrorMessage("technology")}
                           value={data.technology}
                           onChange={onChange("technology")}/>
                </>
            )}
            {data.unitType === "demand" && (
                <>
                    <Input label="Max Power"
                           type="number"
                           value={data.max_power}
                           onChange={onChange("max_power")}
                           errorMessage={getErrorMessage('max_power')}
                           tooltip="Maximum power input (negative) of this unit in MW"/>
                    <Input label="Min Power"
                           type="number"
                           value={data.min_power ?? 0}
                           onChange={onChange("min_power")}
                           errorMessage={getErrorMessage('min_power')}
                           tooltip="Minimum power input (negative) of this unit in MW"/>
                    <Input label="Price"
                           type="number"
                           value={data.price ?? 3000}
                           onChange={onChange("price")}
                           errorMessage={getErrorMessage('price')}
                           tooltip="TODO" //TODO
                    />
                    <Modal name="Forecast settings">
                        <Input label="Forecast availability"
                               type="number"
                               value={data.forecast_availability ?? 1}
                               errorMessage={getErrorMessage('forecast_availability')}
                               onChange={onChange("forecast_availability")}/>
                        <Input label="Forecast Demand"
                               type="number"
                               value={data.forecast_demand ?? 100}
                               errorMessage={getErrorMessage('forecast_demand')}
                               onChange={onChange("forecast_demand")}/>
                    </Modal>
                </>
            )}
            {data.unitType === "power_plant" && (
                <>
                    <Input required
                           label="Max Power"
                           type="number"
                           value={data.max_power}
                           onChange={onChange("max_power")}
                           errorMessage={getErrorMessage('max_power')}
                           tooltip="Peak power output in MW"/>
                    <Input required
                           label="Min Power"
                           type="number"
                           value={data.min_power ?? 0}
                           onChange={onChange("min_power")}
                           errorMessage={getErrorMessage('min_power')}
                           tooltip="Min power output in MW"/>
                    <Input label="Emission Factor"
                           type="number"
                           value={data.emission_factor ?? 0}
                           onChange={onChange("emission_factor")}
                           errorMessage={getErrorMessage('emission_factor')}
                           tooltip="CO2 emissions per megawatt of power output"/>
                    <Input label="Efficiency"
                           type="number"
                           value={data.efficiency ?? 1}
                           tooltip="Efficiency in converting fuel to power output (between 0 and 1)"
                           errorMessage={getErrorMessage('efficiency')}
                           onChange={onChange("efficiency")}/>
                    <Input label="Ramp Down"
                           type="number"
                           value={data.ramp_down ?? 0}
                           onChange={onChange("ramp_down")}
                           errorMessage={getErrorMessage('ramp_down')}
                           tooltip="Maximum Power decrease in MW per timestep"/>
                    <Input label="Ramp Up (MW/min)"
                           type="number"
                           value={data.ramp_up ?? 0}
                           onChange={onChange("ramp_up")}
                           errorMessage={getErrorMessage('ramp_up')}
                           tooltip="Maximum Power increase in MW per timestep"/>
                    <Input label="Min Operating Time"
                           type="number"
                           value={data.min_operating_time ?? 1}
                           onChange={onChange("min_operating_time")}
                           errorMessage={getErrorMessage('min_operating_time')}
                           tooltip="Min timesteps the unit must operate once started"/>
                    <Input label="Min Downtime (min)"
                           type="number"
                           value={data.min_downtime ?? 1}
                           onChange={onChange("min_downtime")}
                           errorMessage={getErrorMessage('min_downtime')}
                           tooltip="Min timesteps after shutdown before restart"/>
                    <Modal name="Forecast settings">
                        <Input label="Forecast availability"
                               type="number"
                               value={data.forecast_availability ?? 1}
                               errorMessage={getErrorMessage('forecast_availability')}
                               onChange={onChange("forecast_availability")}/>
                        <Input label="Forecast fuel price"
                               type="number"
                               value={data.forecast_fuel_price ?? 10}
                               errorMessage={getErrorMessage('forecast_fuel_price')}
                               onChange={onChange("forecast_fuel_price")}/>
                        <Input label="Forecast CO2 price"
                               type="number"
                               value={data.forecast_co2_price ?? 10}
                               errorMessage={getErrorMessage('forecast_co2_price')}
                               onChange={onChange("forecast_co2_price")}/>
                    </Modal>
                </>
            )}
            {data.unitType === "storage" && (
                <>
                    <Input label="Max Power Charge"
                           type="number"
                           value={data.max_power_charge}
                           onChange={onChange("max_power_charge")}
                           errorMessage={getErrorMessage('max_power_charge')}
                           tooltip="Max power input in MW (negative value)"/>
                    <Input label="Max Power Discharge"
                           type="number"
                           value={data.max_power_discharge}
                           onChange={onChange("max_power_discharge")}
                           errorMessage={getErrorMessage('max_power_discharge')}
                           tooltip="Max power output in MW"
                    />
                    <Input label="Max SOC"
                           type="number"
                           value={data.max_soc ?? 1}
                           onChange={onChange("max_soc")}
                           errorMessage={getErrorMessage('max_soc')}
                           tooltip="Maximum state of charge (between 0 and 1)"/>
                    <Input label="Min Power Charge"
                           type="number"
                           value={data.min_power_charge ?? 0}
                           onChange={onChange("min_power_charge")}
                           errorMessage={getErrorMessage('min_power_charge')}
                           tooltip="Min power input in MW (negative value)"/>
                    <Input label="Min Power Discharge"
                           type="number"
                           value={data.min_power_discharge ?? 0}
                           onChange={onChange("min_power_discharge")}
                           errorMessage={getErrorMessage('min_power_discharge')}
                           tooltip="Min power output in MW"/>
                    <Input label="Min SOC"
                           type="number"
                           value={data.min_soc ?? 0}
                           errorMessage={getErrorMessage('min_soc')}
                           onChange={onChange("min_soc")}
                           tooltip="Min state of charge (between 0 and 1)"/>
                    <Input label="Initial SOC"
                           type="number"
                           value={data.initial_soc ?? 0}
                           errorMessage={getErrorMessage('initial_soc')}
                           onChange={onChange("initial_soc")}
                           tooltip="Initial state of charge (between 0 and 1)"
                    />
                    <Modal name="Forecast settings">
                        <Input label="Forecast availability"
                               type="number"
                               errorMessage={getErrorMessage('forecast_availability')}
                               value={data.forecast_availability ?? 1}
                               onChange={onChange("forecast_availability")}/>
                    </Modal>
                </>
            )}
            {(data.unitType === "exchange") && (
                <>
                    <Input type="number"
                           label="Volume import"
                           value={data.volume_import}
                           onChange={onChange("volume_import")}
                           errorMessage={getErrorMessage('volume_import')}/>
                    <Input type="number"
                           label="Volume export"
                           value={data.volume_export}
                           onChange={onChange("volume_export")}
                           errorMessage={getErrorMessage('volume_export')}/>
                    <Modal name="Forecast settings">
                        <Input label="Forecast availability"
                               type="number"
                               value={data.forecast_availability ?? 1}
                               onChange={onChange("forecast_availability")}
                               errorMessage={getErrorMessage('forecast_availability')}/>
                        <Input label="Forecast import volume"
                               type="number"
                               value={data.forecast_volume_import ?? 0}
                               onChange={onChange("forecast_volume_import")}
                               errorMessage={getErrorMessage('forecast_volume_import')}/>
                        <Input label="Forecast export volume"
                               type="number"
                               value={data.forecast_volume_export ?? 0}
                               onChange={onChange("forecast_volume_export")}
                               errorMessage={getErrorMessage('forecast_volume_export')}/>
                    </Modal>
                </>
            )}
        </>
    )
}
