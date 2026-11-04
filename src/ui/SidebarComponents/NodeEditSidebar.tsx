import Input from '../InputComponents/Input';
import MarketEdit from './EditPages/MarketEdit';
import MarketProductEdit from './EditPages/MarketProductEdit';
import UnitEdit from './EditPages/UnitEdit';
import UnitMarketEdit from './EditPages/UnitMarketEdit';
import WorldEdit from './EditPages/WorldEdit';
import { handleChange } from '../../utils';
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
      {type === 'unit' && (
        <UnitEdit
          id={id}
          data={data}
          getErrorMessage={getErrorMessage}
          updateNodeValue={updateNodeValue}
        />
      )}
      {type === 'market' && (
        <MarketEdit
          id={id}
          data={data}
          getErrorMessage={getErrorMessage}
          updateNodeValue={updateNodeValue}
        />
      )}
      {type === 'marketProduct' && (
        <MarketProductEdit
          id={id}
          data={data}
          getErrorMessage={getErrorMessage}
          updateNodeValue={updateNodeValue}
        />
      )}
      {type === 'world' && (
        <WorldEdit
          id={id}
          data={data}
          getErrorMessage={getErrorMessage}
          updateNodeValue={updateNodeValue}
        />
      )}
      {type === 'unit-market' && (
        <UnitMarketEdit
          id={id}
          data={data}
          getErrorMessage={getErrorMessage}
          updateNodeValue={updateNodeValue}
        />
      )}
    </form>
  );
}
