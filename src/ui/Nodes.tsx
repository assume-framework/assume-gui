import {Handle, type Node, type NodeProps, Position, useNodeConnections} from '@xyflow/react';
import type {EditSidebarData} from './SidebarComponents/NodeEditSidebar';


export function WorldNode({data, isConnectable}: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            {renderUnit('World', data.name, data.errorField)}
            <Handle
                id="marketProvider_handle"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                style={{left: '25%'}}
                title="Connect to market providers"
            />
            <Handle
                id="unitOperator_handle"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                style={{left: '75%'}}
                title="Connect to unit operators"
            />
        </>
    )
}

export function MarketNode({data, isConnectable}: NodeProps<Node<EditSidebarData>>) {
    const connections = useNodeConnections({handleType: "target", handleId: "marketProvider_handle"});
    return (
        <>
            <Handle
                id="marketProvider_handle"
                type="target"
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
            {renderUnit('Market', data.name, data.errorField)}
            <Handle
                id="marketProduct_handle"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
            />
        </>
    )
}

export function MarketProviderNode({data, isConnectable}: NodeProps<Node<EditSidebarData>>) {
    const connections = useNodeConnections({handleType: "target", handleId: "world_handle"});
    return (
        <>
            <Handle
                id="world_handle"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable && connections.length == 0}
                title="Connect from world"
            />

            {renderUnit('Market Provider', data.name, data.errorField)}
            <Handle
                id="market_handle"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                title="Connect to markets"
            />
        </>
    )
}


export function UnitNode({data, isConnectable}: NodeProps<Node<EditSidebarData>>) {
    const connections = useNodeConnections({handleType: "target", handleId: "unitOperator_handle"});
    return (
        <>
            <Handle
                id="unitOperator_handle"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable && connections.length == 0}
                title="Connect from unit operator"
            />
            {renderUnit(data.unitType as string ?? 'Unit', data.name, data.errorField)}
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

export function UnitOperatorNode({data, isConnectable}: NodeProps<Node<EditSidebarData>>) {
    const connections = useNodeConnections({handleType: "target", handleId: "world_handle"});
    return (
        <>
            <Handle
                id="world_handle"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable && connections.length == 0}
                title="Connect from world"
            />
            {renderUnit('Unit Operator', data.name, data.errorField)}
            <Handle
                id="unit_handle"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                title="Connect to units"
            />
        </>
    )
}

export function MarketProductNode({data, isConnectable}: NodeProps<Node<EditSidebarData>>) {
    const connections = useNodeConnections({handleType: "target", handleId: "market_handle"});
    return (
        <>
            <Handle
                id="market_handle"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable && connections.length == 0}
                title="Connect from market"
            />
            {renderUnit('Market Product', data.name, data.errorField)}
        </>
    )
}

function renderUnit(name: string, id: string, errorField: string) {
    const border_color = errorField == '' ? "border-stone-400" : "border-red-400"
    return (
        <div className={`px-3 py-1 shadow-md rounded-md bg-white border-2 ${border_color}`}>
            <div className='font-bold'>
                {name}
            </div>
            <div className='text-sm text-gray-500'>
                {id}
            </div>
        </div>
    )
}
