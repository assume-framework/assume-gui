import type { EditComponentArgs } from '../../NodeEditSidebar';
import FieldList, { type FieldSpec } from './FieldList';

const fields: FieldSpec[] = [
  { key: 'capacity', label: 'Capacity', tooltip: 'Capacity of the Storage in kWh' },
  {
    key: 'max_power_charge',
    label: 'Max Power Charge',
    tooltip: 'Max power input in MW (negative value)',
  },
  { key: 'max_power_discharge', label: 'Max Power Discharge', tooltip: 'Max power output in MW' },
  { key: 'max_soc', label: 'Max SOC', tooltip: 'Maximum state of charge (between 0 and 1)' },
  {
    key: 'min_power_charge',
    label: 'Min Power Charge',
    tooltip: 'Min power input in MW (negative value)',
  },
  { key: 'min_power_discharge', label: 'Min Power Discharge', tooltip: 'Min power output in MW' },
  { key: 'min_soc', label: 'Min SOC', tooltip: 'Min state of charge (between 0 and 1)' },
  {
    key: 'initial_soc',
    label: 'Initial SOC',
    tooltip: 'Initial state of charge (between 0 and 1)',
  },
];

const forecasts: FieldSpec[] = [{ key: 'forecast_availability', label: 'Forecast availability' }];

export default function StorageEdit(props: EditComponentArgs) {
  return <FieldList {...props} fields={fields} forecasts={forecasts} />;
}
