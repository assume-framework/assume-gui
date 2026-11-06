import { handleChange } from '../../../inputs/handleChange';
import type { EditComponentArgs } from '../../NodeEditSidebar';
import Input from '../../../inputs/Input';
import Modal from '../../../inputs/Modal';
import { InputOrUpload } from '../../../inputs/InputOrUpload';

export default function PowerPlantEdit({
  id,
  data,
  updateNodeValue,
  getErrorMessage,
}: EditComponentArgs) {
  const onChange = handleChange(id, data, updateNodeValue);

  return (
    <>
      <Input
        required
        label="Max Power"
        type="number"
        value={data.max_power}
        onChange={onChange('max_power')}
        errorMessage={getErrorMessage('max_power')}
        tooltip="Peak power output in MW"
      />
      <Input
        required
        label="Min Power"
        type="number"
        value={data.min_power}
        onChange={onChange('min_power')}
        errorMessage={getErrorMessage('min_power')}
        tooltip="Min power output in MW"
      />
      <Input
        label="Emission Factor"
        type="number"
        value={data.emission_factor}
        onChange={onChange('emission_factor')}
        errorMessage={getErrorMessage('emission_factor')}
        tooltip="CO2 emissions in tons of CO2 equivalent per MWh of thermal energy output"
      />
      <Input
        label="Efficiency"
        type="number"
        value={data.efficiency}
        tooltip="Efficiency in converting fuel to power output (between 0 and 1)"
        errorMessage={getErrorMessage('efficiency')}
        onChange={onChange('efficiency')}
      />
      <Input
        label="Ramp Down (MW/step)"
        type="number"
        value={data.ramp_down}
        onChange={onChange('ramp_down')}
        errorMessage={getErrorMessage('ramp_down')}
        tooltip="Maximum Power decrease in MW per timestep"
      />
      <Input
        label="Ramp Up (MW/step)"
        type="number"
        value={data.ramp_up}
        onChange={onChange('ramp_up')}
        errorMessage={getErrorMessage('ramp_up')}
        tooltip="Maximum Power increase in MW per timestep"
      />
      <Input
        label="Min Operating Time"
        type="number"
        value={data.min_operating_time}
        onChange={onChange('min_operating_time')}
        errorMessage={getErrorMessage('min_operating_time')}
        tooltip="Min timesteps the unit must operate once started"
      />
      <Input
        label="Min Downtime"
        type="number"
        value={data.min_downtime}
        onChange={onChange('min_downtime')}
        errorMessage={getErrorMessage('min_downtime')}
        tooltip="Min timesteps the powerplant needs to be turned off before restart"
      />
      <Modal name="Forecast settings">
        <InputOrUpload
          label="Forecast availability"
          value={data.forecast_availability}
          errorMessage={getErrorMessage('forecast_availability')}
          onChange={onChange('forecast_availability')}
        />
        <InputOrUpload
          label="Forecast fuel price"
          value={data.forecast_fuel_price}
          errorMessage={getErrorMessage('forecast_fuel_price')}
          onChange={onChange('forecast_fuel_price')}
        />
        <InputOrUpload
          label="Forecast CO2 price"
          value={data.forecast_co2_price}
          errorMessage={getErrorMessage('forecast_co2_price')}
          onChange={onChange('forecast_co2_price')}
        />
      </Modal>
    </>
  );
}
