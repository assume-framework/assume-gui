import { Handle, type NodeProps, Position, useNodeConnections } from '@xyflow/react';
import { useItemView } from '../../scenario/context';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import BatteryChargingFullOutlinedIcon from '@mui/icons-material/BatteryChargingFullOutlined';
import FactoryOutlinedIcon from '@mui/icons-material/FactoryOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export function WorldNode({ id, isConnectable, selected }: NodeProps) {
  const { data, hasError } = useItemView(id, false);
  return (
    <>
      <NodeCard
        label="World"
        name={data.name}
        hasError={hasError}
        Icon={PublicOutlinedIcon}
        selected={selected}
      />
      <Handle
        id="marketProvider_handle"
        type="source"
        className="!bg-sky-400"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ left: '25%' }}
        title="Connect to market providers"
      />
      <Handle
        id="unitOperator_handle"
        type="source"
        className="!bg-fuchsia-400"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ left: '75%' }}
        title="Connect to unit operators"
      />
    </>
  );
}

export function MarketNode({ id, isConnectable, selected }: NodeProps) {
  const { data, hasError } = useItemView(id, false);
  const connections = useNodeConnections({
    handleType: 'target',
    handleId: 'marketProvider_handle',
  });
  return (
    <>
      <Handle
        id="marketProvider_handle"
        type="target"
        className="!bg-teal-400"
        position={Position.Top}
        isConnectable={isConnectable && connections.length === 0}
        title="Connect from world (market providers)"
      />
      <Handle
        id="unit_handle"
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        title="Connect units to this market"
      />
      <NodeCard
        label="Market"
        name={data.name}
        hasError={hasError}
        Icon={StorefrontOutlinedIcon}
        selected={selected}
      />
      <Handle
        id="marketProduct_handle"
        type="source"
        className="!bg-lime-400"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </>
  );
}

export function MarketProviderNode({ id, isConnectable, selected }: NodeProps) {
  const { data, hasError } = useItemView(id, false);
  const connections = useNodeConnections({ handleType: 'target', handleId: 'world_handle' });
  return (
    <>
      <Handle
        id="world_handle"
        type="target"
        className="!bg-sky-400"
        position={Position.Top}
        isConnectable={isConnectable && connections.length === 0}
        title="Connect from world"
      />

      <NodeCard
        label="Market Provider"
        name={data.name}
        hasError={hasError}
        Icon={AccountBalanceOutlinedIcon}
        selected={selected}
      />
      <Handle
        id="market_handle"
        type="source"
        className="!bg-teal-400"
        position={Position.Bottom}
        isConnectable={isConnectable}
        title="Connect to markets"
      />
    </>
  );
}

export function UnitNode({ id, isConnectable, selected }: NodeProps) {
  const { data, hasError } = useItemView(id, false);
  const connections = useNodeConnections({ handleType: 'target', handleId: 'unitOperator_handle' });
  return (
    <>
      <Handle
        id="unitOperator_handle"
        type="target"
        className="!bg-violet-400"
        position={Position.Top}
        isConnectable={isConnectable && connections.length === 0}
        title="Connect from unit operator"
      />
      <NodeCard
        label={getUnitTypeLabel(data.unitType as string)}
        name={data.name}
        hasError={hasError}
        Icon={getUnitTypeIcon(data.unitType as string)}
        selected={selected}
      />
      <Handle
        id="market_handle"
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        title="Connect to market"
      />
    </>
  );
}

export function UnitOperatorNode({ id, isConnectable, selected }: NodeProps) {
  const { data, hasError } = useItemView(id, false);
  const connections = useNodeConnections({ handleType: 'target', handleId: 'world_handle' });
  return (
    <>
      <Handle
        id="world_handle"
        className="!bg-fuchsia-400"
        type="target"
        position={Position.Top}
        isConnectable={isConnectable && connections.length === 0}
        title="Connect from world"
      />
      <NodeCard
        label="Unit Operator"
        name={data.name}
        hasError={hasError}
        Icon={AccountTreeOutlinedIcon}
        selected={selected}
      />
      <Handle
        id="unit_handle"
        type="source"
        className="!bg-violet-400"
        position={Position.Bottom}
        isConnectable={isConnectable}
        title="Connect to units"
      />
    </>
  );
}

export function MarketProductNode({ id, isConnectable, selected }: NodeProps) {
  const { data, hasError } = useItemView(id, false);
  const connections = useNodeConnections({ handleType: 'target', handleId: 'market_handle' });
  return (
    <>
      <Handle
        id="market_handle"
        type="target"
        position={Position.Top}
        className="!bg-lime-400"
        isConnectable={isConnectable && connections.length === 0}
        title="Connect from market"
      />
      <NodeCard
        label="Market Product"
        name={data.name}
        hasError={hasError}
        Icon={Inventory2OutlinedIcon}
        selected={selected}
      />
    </>
  );
}

function getUnitTypeLabel(unitType: string): string {
  switch (unitType) {
    case 'storage':
      return 'Storage';
    case 'power_plant':
      return 'Power plant';
    case 'demand':
      return 'Demand';
    case 'exchange':
      return 'Exchange';
    default:
      return 'Unit';
  }
}

function getUnitTypeIcon(unitType: string): SvgIconComponent {
  switch (unitType) {
    case 'storage':
      return BatteryChargingFullOutlinedIcon;
    case 'power_plant':
      return FactoryOutlinedIcon;
    case 'demand':
      return TrendingDownOutlinedIcon;
    case 'exchange':
      return SwapHorizOutlinedIcon;
    default:
      return PrecisionManufacturingOutlinedIcon;
  }
}

interface NodeCardProps {
  /** Node kind shown in small grey text, e.g. "Market". */
  label: string;
  /** User-defined node name, shown in bold. */
  name: string;
  hasError: boolean;
  Icon: SvgIconComponent;
  selected?: boolean;
}

function NodeCard({ label, name, hasError, Icon, selected = false }: NodeCardProps) {
  const borderColor = hasError ? 'border-red-400' : 'border-stone-300';
  return (
    <div
      className={`inline-flex p-0.5 rounded-md transition-shadow ${
        selected ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
      }`}
    >
      <div className={`px-2 py-0.5 shadow rounded bg-white border text-[11px] ${borderColor}`}>
        <div className="flex justify-center text-sky-700 pb-0.5">
          <Icon sx={{ fontSize: 20 }} />
        </div>
        <div className="font-semibold">{name}</div>
        <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{label}</div>
      </div>
    </div>
  );
}
