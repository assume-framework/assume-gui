import {handleChange, initial_data} from "../../../utils";
import type {EditComponentArgs} from "../NodeEditSidebar";
import Select from "../../InputComponents/Select";
import Input from "../../InputComponents/Input";
import Modal from "../../InputComponents/Modal";
import {InputOrUpload} from "../../InputComponents/InputOrUpload.tsx";


export default function editUnit({id, data, updateNodeValue, getErrorMessage}: EditComponentArgs) {
    const onChange = handleChange(id, data, updateNodeValue);
    const reset = (value: string) => {
        const d = initial_data(value);
        console.log(d)
        updateNodeValue(id, d, false)
    }

    return (
        <>
            <Select label="Unit type"
                    tooltip="The type of the unit. This allows to specify additional properties, depending on the model."
                    value={data.unitType}
                    errorMessage={getErrorMessage('unitType')}
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
                           tooltip="A text field for a technology - used to filter limitations or aggregate results."
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
                           value={data.min_power}
                           onChange={onChange("min_power")}
                           errorMessage={getErrorMessage('min_power')}
                           tooltip="Minimum power input (negative) of this unit in MW"/>
                    <Input label="Price"
                           type="number"
                           value={data.price}
                           onChange={onChange("price")}
                           errorMessage={getErrorMessage('price')}
                           tooltip="TODO" //TODO
                    />
                    <Modal name="Forecast settings">
                        <InputOrUpload
                            label="Forecast availability"
                            value={data.forecast_availability}
                            errorMessage={getErrorMessage('forecast_availability')}
                            onChange={onChange("forecast_availability")}
                        />
                        <InputOrUpload
                            label="Forecast Demand"
                            value={data.forecast_demand}
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
                           value={data.min_power}
                           onChange={onChange("min_power")}
                           errorMessage={getErrorMessage('min_power')}
                           tooltip="Min power output in MW"/>
                    <Input label="Emission Factor"
                           type="number"
                           value={data.emission_factor}
                           onChange={onChange("emission_factor")}
                           errorMessage={getErrorMessage('emission_factor')}
                           tooltip="CO2 emissions in tons of CO2 equivalent per MWh of thermal energy output"/>
                    <Input label="Efficiency"
                           type="number"
                           value={data.efficiency}
                           tooltip="Efficiency in converting fuel to power output (between 0 and 1)"
                           errorMessage={getErrorMessage('efficiency')}
                           onChange={onChange("efficiency")}/>
                    <Input label="Ramp Down (MW/step)"
                           type="number"
                           value={data.ramp_down}
                           onChange={onChange("ramp_down")}
                           errorMessage={getErrorMessage('ramp_down')}
                           tooltip="Maximum Power decrease in MW per timestep"/>
                    <Input label="Ramp Up (MW/step)"
                           type="number"
                           value={data.ramp_up}
                           onChange={onChange("ramp_up")}
                           errorMessage={getErrorMessage('ramp_up')}
                           tooltip="Maximum Power increase in MW per timestep"/>
                    <Input label="Min Operating Time"
                           type="number"
                           value={data.min_operating_time}
                           onChange={onChange("min_operating_time")}
                           errorMessage={getErrorMessage('min_operating_time')}
                           tooltip="Min timesteps the unit must operate once started"/>
                    <Input label="Min Downtime"
                           type="number"
                           value={data.min_downtime}
                           onChange={onChange("min_downtime")}
                           errorMessage={getErrorMessage('min_downtime')}
                           tooltip="Min timesteps the powerplant needs to be turned off before restart"/>
                    <Modal name="Forecast settings">
                        <InputOrUpload
                            label="Forecast availability"
                            value={data.forecast_availability}
                            errorMessage={getErrorMessage('forecast_availability')}
                            onChange={onChange("forecast_availability")}/>
                        <InputOrUpload
                            label="Forecast fuel price"
                            value={data.forecast_fuel_price0}
                            errorMessage={getErrorMessage('forecast_fuel_price')}
                            onChange={onChange("forecast_fuel_price")}/>
                        <InputOrUpload
                            label="Forecast CO2 price"
                            value={data.forecast_co2_price0}
                            errorMessage={getErrorMessage('forecast_co2_price')}
                            onChange={onChange("forecast_co2_price")}/>
                    </Modal>
                </>
            )}
            {data.unitType === "storage" && (
                <>
                    <Input label="Capacity"
                           type="number"
                           value={data.capacity}
                           onChange={onChange("capacity")}
                           errorMessage={getErrorMessage('capacity')}
                           tooltip="Capacity of the Storage in kWh"/>
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
                           value={data.max_soc}
                           onChange={onChange("max_soc")}
                           errorMessage={getErrorMessage('max_soc')}
                           tooltip="Maximum state of charge (between 0 and 1)"/>
                    <Input label="Min Power Charge"
                           type="number"
                           value={data.min_power_charge}
                           onChange={onChange("min_power_charge")}
                           errorMessage={getErrorMessage('min_power_charge')}
                           tooltip="Min power input in MW (negative value)"/>
                    <Input label="Min Power Discharge"
                           type="number"
                           value={data.min_power_discharge}
                           onChange={onChange("min_power_discharge")}
                           errorMessage={getErrorMessage('min_power_discharge')}
                           tooltip="Min power output in MW"/>
                    <Input label="Min SOC"
                           type="number"
                           value={data.min_soc}
                           errorMessage={getErrorMessage('min_soc')}
                           onChange={onChange("min_soc")}
                           tooltip="Min state of charge (between 0 and 1)"/>
                    <Input label="Initial SOC"
                           type="number"
                           value={data.initial_soc}
                           errorMessage={getErrorMessage('initial_soc')}
                           onChange={onChange("initial_soc")}
                           tooltip="Initial state of charge (between 0 and 1)"
                    />
                    <Modal name="Forecast settings">
                        <InputOrUpload
                            label="Forecast availability"
                            errorMessage={getErrorMessage('forecast_availability')}
                            value={data.forecast_availability}
                            onChange={onChange("forecast_availability")}/>
                    </Modal>
                </>
            )}
            {(data.unitType === "exchange") && (
                <>
                    <Input type="number"
                           label="Volume import"
                           value={data.volume_import}
                           tooltip="The maximum line capacity for the import line."
                           onChange={onChange("volume_import")}
                           errorMessage={getErrorMessage('volume_import')}/>
                    <Input type="number"
                           label="Volume export"
                           value={data.volume_export}
                           tooltip="The maximum line capacity for the export line."
                           onChange={onChange("volume_export")}
                           errorMessage={getErrorMessage('volume_export')}/>
                    <Modal name="Forecast settings">
                        <InputOrUpload
                            label="Forecast availability"
                            value={data.forecast_availability}
                            onChange={onChange("forecast_availability")}
                            errorMessage={getErrorMessage('forecast_availability')}/>
                        <InputOrUpload
                            label="Forecast import volume"
                            value={data.forecast_volume_import}
                            onChange={onChange("forecast_volume_import")}
                            errorMessage={getErrorMessage('forecast_volume_import')}/>
                        <InputOrUpload
                            label="Forecast export volume"
                            value={data.forecast_volume_export}
                            onChange={onChange("forecast_volume_export")}
                            errorMessage={getErrorMessage('forecast_volume_export')}/>
                    </Modal>
                </>
            )}
        </>
    )
}
