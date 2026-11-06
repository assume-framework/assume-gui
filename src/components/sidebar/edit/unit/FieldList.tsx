import { handleChange } from '../../../inputs/handleChange';
import type { EditComponentArgs } from '../../NodeEditSidebar';
import Input from '../../../inputs/Input';
import Modal from '../../../inputs/Modal';
import { InputOrUpload } from '../../../inputs/InputOrUpload';

/** One numeric parameter of a unit. `key` is the name in the node data. */
export interface FieldSpec {
  key: string;
  label: string;
  tooltip?: string;
  required?: boolean;
}

interface FieldListProps extends EditComponentArgs {
  fields: FieldSpec[];
  /** Fields that can be a number or an uploaded time series. Shown in a modal. */
  forecasts: FieldSpec[];
}

/** Renders the inputs of a unit type from a list of field specs. */
export default function FieldList({
  id,
  data,
  updateNodeValue,
  getErrorMessage,
  fields,
  forecasts,
}: FieldListProps) {
  const onChange = handleChange(id, data, updateNodeValue);

  return (
    <>
      {fields.map((f) => (
        <Input
          key={f.key}
          type="number"
          label={f.label}
          tooltip={f.tooltip}
          required={f.required}
          value={data[f.key]}
          onChange={onChange(f.key)}
          errorMessage={getErrorMessage(f.key)}
        />
      ))}
      <Modal name="Forecast settings">
        {forecasts.map((f) => (
          <InputOrUpload
            key={f.key}
            label={f.label}
            tooltip={f.tooltip}
            value={data[f.key]}
            onChange={onChange(f.key)}
            errorMessage={getErrorMessage(f.key)}
          />
        ))}
      </Modal>
    </>
  );
}
