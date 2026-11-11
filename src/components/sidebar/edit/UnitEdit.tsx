import { handleChange } from '../../inputs/handleChange';
import { initialData } from '../../../scenario/defaults';
import type { EditComponentArgs } from '../NodeEditSidebar';
import Select from '../../inputs/Select';
import Input from '../../inputs/Input';
import DemandEdit from './unit/DemandEdit';
import PowerPlantEdit from './unit/PowerPlantEdit';
import StorageEdit from './unit/StorageEdit';
import ExchangeEdit from './unit/ExchangeEdit';

export default function UnitEdit(props: EditComponentArgs) {
  const { id, data, updateNodeValue, getErrorMessage } = props;
  const onChange = handleChange(id, data, updateNodeValue);
  const reset = (value: string) => {
    // Start from the defaults of the new type, but keep the name the user gave the node.
    updateNodeValue(id, { ...initialData(value), name: data.name }, false);
  };

  return (
    <>
      <Select
        label="Unit type"
        tooltip="The type of the unit. This allows to specify additional properties, depending on the model."
        value={data.unitType}
        errorMessage={getErrorMessage('unitType')}
        onChange={reset}
      >
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
          <Input
            label="Technology"
            type="text"
            tooltip="A text field for a technology - used to filter limitations or aggregate results."
            errorMessage={getErrorMessage('technology')}
            value={data.technology}
            onChange={onChange('technology')}
          />
        </>
      )}
      {data.unitType === 'demand' && <DemandEdit {...props} />}
      {data.unitType === 'power_plant' && <PowerPlantEdit {...props} />}
      {data.unitType === 'storage' && <StorageEdit {...props} />}
      {data.unitType === 'exchange' && <ExchangeEdit {...props} />}
    </>
  );
}
