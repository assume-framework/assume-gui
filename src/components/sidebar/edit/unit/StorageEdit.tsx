import { handleChange } from '../../../inputs/handleChange';
import type { EditComponentArgs } from '../../NodeEditSidebar';
import Input from '../../../inputs/Input';
import Modal from '../../../inputs/Modal';
import { InputOrUpload } from '../../../inputs/InputOrUpload';

export default function StorageEdit({
  id,
  data,
  updateNodeValue,
  getErrorMessage,
}: EditComponentArgs) {
  const onChange = handleChange(id, data, updateNodeValue);

  return (
    <>
      <Input
        label="Capacity"
        type="number"
        value={data.capacity}
        onChange={onChange('capacity')}
        errorMessage={getErrorMessage('capacity')}
        tooltip="Capacity of the Storage in kWh"
      />
      <Input
        label="Max Power Charge"
        type="number"
        value={data.max_power_charge}
        onChange={onChange('max_power_charge')}
        errorMessage={getErrorMessage('max_power_charge')}
        tooltip="Max power input in MW (negative value)"
      />
      <Input
        label="Max Power Discharge"
        type="number"
        value={data.max_power_discharge}
        onChange={onChange('max_power_discharge')}
        errorMessage={getErrorMessage('max_power_discharge')}
        tooltip="Max power output in MW"
      />
      <Input
        label="Max SOC"
        type="number"
        value={data.max_soc}
        onChange={onChange('max_soc')}
        errorMessage={getErrorMessage('max_soc')}
        tooltip="Maximum state of charge (between 0 and 1)"
      />
      <Input
        label="Min Power Charge"
        type="number"
        value={data.min_power_charge}
        onChange={onChange('min_power_charge')}
        errorMessage={getErrorMessage('min_power_charge')}
        tooltip="Min power input in MW (negative value)"
      />
      <Input
        label="Min Power Discharge"
        type="number"
        value={data.min_power_discharge}
        onChange={onChange('min_power_discharge')}
        errorMessage={getErrorMessage('min_power_discharge')}
        tooltip="Min power output in MW"
      />
      <Input
        label="Min SOC"
        type="number"
        value={data.min_soc}
        errorMessage={getErrorMessage('min_soc')}
        onChange={onChange('min_soc')}
        tooltip="Min state of charge (between 0 and 1)"
      />
      <Input
        label="Initial SOC"
        type="number"
        value={data.initial_soc}
        errorMessage={getErrorMessage('initial_soc')}
        onChange={onChange('initial_soc')}
        tooltip="Initial state of charge (between 0 and 1)"
      />
      <Modal name="Forecast settings">
        <InputOrUpload
          label="Forecast availability"
          errorMessage={getErrorMessage('forecast_availability')}
          value={data.forecast_availability}
          onChange={onChange('forecast_availability')}
        />
      </Modal>
    </>
  );
}
