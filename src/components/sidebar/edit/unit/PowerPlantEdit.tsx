import type { EditComponentArgs } from '../../NodeEditSidebar';
import FieldList, { type FieldSpec } from './FieldList';

const fields: FieldSpec[] = [
  { key: 'max_power', label: 'Max Power', required: true, tooltip: 'Peak power output in MW' },
  { key: 'min_power', label: 'Min Power', required: true, tooltip: 'Min power output in MW' },
  {
    key: 'emission_factor',
    label: 'Emission Factor',
    tooltip: 'CO2 emissions in tons of CO2 equivalent per MWh of thermal energy output',
  },
  {
    key: 'efficiency',
    label: 'Efficiency',
    tooltip: 'Efficiency in converting fuel to power output (between 0 and 1)',
  },
  {
    key: 'ramp_down',
    label: 'Ramp Down (MW/step)',
    tooltip: 'Maximum Power decrease in MW per timestep',
  },
  {
    key: 'ramp_up',
    label: 'Ramp Up (MW/step)',
    tooltip: 'Maximum Power increase in MW per timestep',
  },
  {
    key: 'min_operating_time',
    label: 'Min Operating Time',
    tooltip: 'Min timesteps the unit must operate once started',
  },
  {
    key: 'min_downtime',
    label: 'Min Downtime',
    tooltip: 'Min timesteps the powerplant needs to be turned off before restart',
  },
];

const forecasts: FieldSpec[] = [
  { key: 'forecast_availability', label: 'Forecast availability' },
  { key: 'forecast_fuel_price', label: 'Forecast fuel price' },
  { key: 'forecast_co2_price', label: 'Forecast CO2 price' },
];

export default function PowerPlantEdit(props: EditComponentArgs) {
  return <FieldList {...props} fields={fields} forecasts={forecasts} />;
}
