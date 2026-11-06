import { handleChange } from '../../../inputs/handleChange';
import type { EditComponentArgs } from '../../NodeEditSidebar';
import Input from '../../../inputs/Input';
import Modal from '../../../inputs/Modal';
import { InputOrUpload } from '../../../inputs/InputOrUpload';

export default function ExchangeEdit({
  id,
  data,
  updateNodeValue,
  getErrorMessage,
}: EditComponentArgs) {
  const onChange = handleChange(id, data, updateNodeValue);

  return (
    <>
      <Input
        type="number"
        label="Price import"
        value={data.price_import}
        tooltip="The price for import of the unit."
        onChange={onChange('price_import')}
        errorMessage={getErrorMessage('price_import')}
      />
      <Input
        type="number"
        label="Price export"
        value={data.price_export}
        tooltip="The price for export of the unit."
        onChange={onChange('price_export')}
        errorMessage={getErrorMessage('price_export')}
      />
      <Modal name="Forecast settings">
        <InputOrUpload
          label="Forecast availability"
          value={data.forecast_availability}
          onChange={onChange('forecast_availability')}
          errorMessage={getErrorMessage('forecast_availability')}
        />
        <InputOrUpload
          label="Forecast import volume"
          value={data.forecast_volume_import}
          onChange={onChange('forecast_volume_import')}
          errorMessage={getErrorMessage('forecast_volume_import')}
        />
        <InputOrUpload
          label="Forecast export volume"
          value={data.forecast_volume_export}
          onChange={onChange('forecast_volume_export')}
          errorMessage={getErrorMessage('forecast_volume_export')}
        />
      </Modal>
    </>
  );
}
