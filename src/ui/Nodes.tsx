import {Handle, type Node, type NodeProps, Position, useNodeConnections} from '@xyflow/react';
import type {EditSidebarData} from './SidebarComponents/NodeEditSidebar';
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
import type {SvgIconComponent} from '@mui/icons-material';


export function WorldNode({data, isConnectable, selected}: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            {renderUnit('World', data.name, data.errorField, PublicOutlinedIcon, selected)}
            <Handle
                id="marketProvider_handle"
                type="source"
                className="!bg-sky-400"
                position={Position.Bottom}
                isConnectable={isConnectable}
                style={{left: '25%'}}
                title="Connect to market providers"
            />
            <Handle
                id="unitOperator_handle"
                type="source"
                className="!bg-fuchsia-400"
                position={Position.Bottom}
                isConnectable={isConnectable}
                style={{left: '75%'}}
                title="Connect to unit operators"
            />
        </>
    )
}

export function MarketNode({data, isConnectable, selected}: NodeProps<Node<EditSidebarData>>) {
    const connections = useNodeConnections({handleType: "target", handleId: "marketProvider_handle"});
    return (
        <>
            <Handle
                id="marketProvider_handle"
                type="target"
                className="!bg-teal-400"
                position={Position.Top}
                isConnectable={isConnectable && connections.length == 0}
                title="Connect from world (market providers)"
            />
            <Handle
                id="unit_handle"
                type="target"
                position={Position.Right}
                isConnectable={isConnectable}
                title="Connect units to this market"
            />
            {renderUnit('Market', data.name, data.errorField, StorefrontOutlinedIcon, selected)}
            <Handle
                id="marketProduct_handle"
                type="source"
                className="!bg-lime-400"
                position={Position.Bottom}
                isConnectable={isConnectable}
            />
        </>
    )
}

export function MarketProviderNode({data, isConnectable, selected}: NodeProps<Node<EditSidebarData>>) {
    const connections = useNodeConnections({handleType: "target", handleId: "world_handle"});
    return (
        <>
            <Handle
                id="world_handle"
                type="target"
                className="!bg-sky-400"
                position={Position.Top}
                isConnectable={isConnectable && connections.length == 0}
                title="Connect from world"
            />

            {renderUnit('Market Provider', data.name, data.errorField, AccountBalanceOutlinedIcon, selected)}
            <Handle
                id="market_handle"
                type="source"
                className="!bg-teal-400"
                position={Position.Bottom}
                isConnectable={isConnectable}
                title="Connect to markets"
            />
        </>
    )
}


export function UnitNode({data, isConnectable, selected}: NodeProps<Node<EditSidebarData>>) {
    const connections = useNodeConnections({handleType: "target", handleId: "unitOperator_handle"});
    return (
        <>
            <Handle
                id="unitOperator_handle"
                type="target"
                className="!bg-violet-400"
                position={Position.Top}
                isConnectable={isConnectable && connections.length == 0}
                title="Connect from unit operator"
            />
            {renderUnit(
                getUnitTypeLabel(data.unitType as string),
                data.name,
                data.errorField,
                getUnitTypeIcon(data.unitType as string),
                selected
            )}
            <Handle
                id="market_handle"
                type="source"
                position={Position.Left}
                isConnectable={isConnectable}
                title="Connect to market"
            />
        </>
    )
}

export function UnitOperatorNode({data, isConnectable, selected}: NodeProps<Node<EditSidebarData>>) {
    const connections = useNodeConnections({handleType: "target", handleId: "world_handle"});
    return (
        <>
            <Handle
                id="world_handle"
                className="!bg-fuchsia-400"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable && connections.length == 0}
                title="Connect from world"
            />
            {renderUnit('Unit Operator', data.name, data.errorField, AccountTreeOutlinedIcon, selected)}
            <Handle
                id="unit_handle"
                type="source"
                className="!bg-violet-400"
                position={Position.Bottom}
                isConnectable={isConnectable}
                title="Connect to units"
            />
        </>
    )
}

export function MarketProductNode({data, isConnectable, selected}: NodeProps<Node<EditSidebarData>>) {
    const connections = useNodeConnections({handleType: "target", handleId: "market_handle"});
    return (
        <>
            <Handle
                id="market_handle"
                type="target"
                position={Position.Top}
                className="!bg-lime-400"
                isConnectable={isConnectable && connections.length == 0}
                title="Connect from market"
            />
            {renderUnit('Market Product', data.name, data.errorField, Inventory2OutlinedIcon, selected)}
        </>
    )
}

function getUnitTypeLabel(unitTpye: string): string {
    switch (unitTpye) {
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

function renderUnit(name: string, id: string, errorField: string, Icon: SvgIconComponent, selected = false) {
    const border_color = errorField == '' ? "border-stone-300" : "border-red-400"
    return (
        <div
            className={`inline-flex p-0.5 rounded-md transition-shadow ${
                selected ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
            }`}
        >
            <div className={`px-2 py-0.5 shadow rounded bg-white border text-[11px] ${border_color}`}>
                <div className='flex justify-center text-sky-700 pb-0.5'>
                    <Icon sx={{fontSize: 20}}/>
                </div>
                <div className='font-semibold'>
                    {id}
                </div>
                <div className='text-[10px] text-gray-500 truncate max-w-[120px]'>
                    {name}
                </div>
            </div>
        </div>
    )
}
