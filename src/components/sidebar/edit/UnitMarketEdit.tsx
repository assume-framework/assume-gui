import { handleChange } from '../../inputs/handleChange';
import Select from '../../inputs/Select';
import type { EditComponentArgs } from '../NodeEditSidebar';
import { UNIT_MARKET_STRATEGIES } from '../../../scenario/strategies';

function UnitMarketEdit({ id, data, updateNodeValue, getErrorMessage }: EditComponentArgs) {
  const onChange = handleChange(id, data, updateNodeValue, true);
  return (
    <>
      <Select
        label="Strategy"
        value={data.strategy}
        onChange={onChange('strategy')}
        tooltip="Bidding strategy used by the unit to bid on the selected market. See ASSUME docs for more information."
        errorMessage={getErrorMessage('strategy')}
      >
        {UNIT_MARKET_STRATEGIES.map((strategy) => (
          <option key={strategy.value} value={strategy.value}>
            {strategy.label}
          </option>
        ))}
      </Select>
    </>
  );
}

export default UnitMarketEdit;
