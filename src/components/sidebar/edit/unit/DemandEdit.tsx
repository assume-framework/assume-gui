import type { EditComponentArgs } from '../../NodeEditSidebar';
import FieldList, { type FieldSpec } from './FieldList';

const fields: FieldSpec[] = [
  {
    key: 'max_power',
    label: 'Max Power',
    tooltip: 'Maximum power input (negative) of this unit in MW',
  },
  {
    key: 'min_power',
    label: 'Min Power',
    tooltip: 'Minimum power input (negative) of this unit in MW',
  },
  { key: 'price', label: 'Price', tooltip: 'Bidding price of the demand in €/MWh' },
];

const forecasts: FieldSpec[] = [
  { key: 'forecast_availability', label: 'Forecast availability' },
  { key: 'forecast_demand', label: 'Forecast Demand' },
];

export default function DemandEdit(props: EditComponentArgs) {
  return <FieldList {...props} fields={fields} forecasts={forecasts} />;
}
