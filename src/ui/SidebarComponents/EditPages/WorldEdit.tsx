import { handleChange } from '../../../utils';
import Input from '../../InputComponents/Input';
import type { EditComponentArgs } from '../NodeEditSidebar';

export default function WorldEdit({
  id,
  data,
  updateNodeValue,
  getErrorMessage,
}: EditComponentArgs) {
  const onChange = handleChange(id, data, updateNodeValue);
  return (
    <>
      <Input
        label="Start Time"
        type="datetime-local"
        value={data.start}
        onChange={onChange('start')}
        tooltip="Start of the simulation. The first market clearing happens a few hours later."
        errorMessage={getErrorMessage('start')}
      />
      <Input
        label="End Time"
        type="datetime-local"
        value={data.end}
        onChange={onChange('end')}
        tooltip="At this time the simulation will end. Market which would clear after this time are not opened"
        errorMessage={getErrorMessage('end')}
      />
      <Input
        label="Save Frequency (hours)"
        type="number"
        value={data.save_frequency_hours}
        onChange={onChange('save_frequency_hours')}
        tooltip="How often the simulation should write results to the DB. Needed for regular feedback while the simulation is running."
        errorMessage={getErrorMessage('save_frequency_hours')}
      />
      <Input
        label="Simulation ID"
        type="text"
        value={data.simulation_id}
        onChange={onChange('simulation_id')}
        tooltip="An Identifier for the simulation - used for storing in the database"
        errorMessage={getErrorMessage('simulation_id')}
      />
      <Input
        label="Frequency"
        type="text"
        value={data.frequency}
        onChange={onChange('frequency')}
        tooltip="Simulation frequency - must be interpretable by Pandas. E.g '24h'"
        errorMessage={getErrorMessage('frequency')}
      />
    </>
  );
}
