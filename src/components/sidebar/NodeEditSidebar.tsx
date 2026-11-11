import Input from '../inputs/Input';
import MarketEdit from './edit/MarketEdit';
import MarketProductEdit from './edit/MarketProductEdit';
import UnitEdit from './edit/UnitEdit';
import UnitMarketEdit from './edit/UnitMarketEdit';
import WorldEdit from './edit/WorldEdit';
import { handleChange } from '../inputs/handleChange';
import type { ConfigData, ConfigIssue } from '../../scenario/types';

export type EditComponentArgs = {
  id: string;
  data: ConfigData;
  updateNodeValue: (id: string, data: ConfigData, isEdge: boolean) => void;
  getErrorMessage: (field: string) => string | undefined;
};

export type EditSidebarProps = {
  id: string;
  data: ConfigData;
  type?: string;
  isEdge?: boolean;
};

type updateFunction = {
  updateNodeValue: (id: string, data: ConfigData, isEdge: boolean) => void;
  issues: ConfigIssue[];
};

export default function EditSidebar({
  id,
  type,
  data,
  updateNodeValue,
  issues,
}: EditSidebarProps & updateFunction) {
  const onChange = handleChange(id, data, updateNodeValue);

  const getErrorMessage = (field: string): string | undefined =>
    issues.find((issue) => issue.field === field)?.message;

  const props: EditComponentArgs = {
    id: id,
    data: data,
    getErrorMessage: getErrorMessage,
    updateNodeValue: updateNodeValue,
  };

  return (
    <form className="px-8 pt-6 pb-8 mb-4" id="NodeEditForm" onSubmit={(e) => e.preventDefault()}>
      <Input
        label="Name"
        type="text"
        value={data.name}
        onChange={onChange('name')}
        errorMessage={getErrorMessage('name')}
        tooltip="Identifier of the component - can be any string"
      />
      {type === 'unit' && <UnitEdit {...props} />}
      {type === 'market' && <MarketEdit {...props} />}
      {type === 'marketProduct' && <MarketProductEdit {...props} />}
      {type === 'world' && <WorldEdit {...props} />}
      {type === 'unit-market' && <UnitMarketEdit {...props} />}
    </form>
  );
}
