import type { EditComponentArgs } from '../../NodeEditSidebar';
import FieldList, { type FieldSpec } from './FieldList';

const fields: FieldSpec[] = [
  { key: 'price_import', label: 'Price import', tooltip: 'The price for import of the unit.' },
  { key: 'price_export', label: 'Price export', tooltip: 'The price for export of the unit.' },
];

const forecasts: FieldSpec[] = [
  { key: 'forecast_availability', label: 'Forecast availability' },
  { key: 'forecast_volume_import', label: 'Forecast import volume' },
  { key: 'forecast_volume_export', label: 'Forecast export volume' },
];

export default function ExchangeEdit(props: EditComponentArgs) {
  return <FieldList {...props} fields={fields} forecasts={forecasts} />;
}
