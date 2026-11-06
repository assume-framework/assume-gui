import { handleChange } from '../../../inputs/handleChange';
import type { EditComponentArgs } from '../../NodeEditSidebar';
import Input from '../../../inputs/Input';
import Modal from '../../../inputs/Modal';
import { InputOrUpload } from '../../../inputs/InputOrUpload';

export default function DemandEdit({
  id,
  data,
  updateNodeValue,
  getErrorMessage,
}: EditComponentArgs) {
  const onChange = handleChange(id, data, updateNodeValue);

  return (
    <>
      <Input
        label="Max Power"
        type="number"
        value={data.max_power}
        onChange={onChange('max_power')}
        errorMessage={getErrorMessage('max_power')}
        tooltip="Maximum power input (negative) of this unit in MW"
      />
      <Input
        label="Min Power"
        type="number"
        value={data.min_power}
        onChange={onChange('min_power')}
        errorMessage={getErrorMessage('min_power')}
        tooltip="Minimum power input (negative) of this unit in MW"
      />
      <Input
        label="Price"
        type="number"
        value={data.price}
        onChange={onChange('price')}
        errorMessage={getErrorMessage('price')}
        tooltip="Bidding price of the demand in €/MWh"
      />
      <Modal name="Forecast settings">
        <InputOrUpload
          label="Forecast availability"
          value={data.forecast_availability}
          errorMessage={getErrorMessage('forecast_availability')}
          onChange={onChange('forecast_availability')}
        />
        <InputOrUpload
          label="Forecast Demand"
          value={data.forecast_demand}
          errorMessage={getErrorMessage('forecast_demand')}
          onChange={onChange('forecast_demand')}
        />
      </Modal>
    </>
  );
}
