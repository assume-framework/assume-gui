
import { Handle, type Node, type NodeProps, Position, useNodeConnections } from '@xyflow/react';
import type { EditSidebarData } from './NodeEditSidebar';


export function WorldNode({ data, isConnectable }: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            {renderUnit('World', data.name)}
            <Handle
                id="unitOperator_handle"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                style={{ left: '25%' }}
            />
            <Handle
                id="marketProvider_handle"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                style={{ left: '75%' }}
            />
        </>
    )
}

export function MarketNode({ data, isConnectable }: NodeProps<Node<EditSidebarData>>) {

    return (
        <>
            <Handle
                id="marketProvider_handle"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable && useNodeConnections({handleType: "target", handleId: "marketProvider_handle"}).length == 0}
            />
            <Handle
                id="unit_handle"
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
            />
            {renderUnit('Market', data.name)}
            <Handle
                id="marketProduct_handle"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
            />
        </>
    )
}

export function MarketProviderNode({ data, isConnectable }: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            <Handle
                id="world_handle"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable && useNodeConnections({handleType: "target", handleId: "world_handle"}).length == 0}
            />

            {renderUnit('Market Provider', data.name)}
            <Handle
                id="market_handle"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
            />
        </>
    )
}


export function UnitNode({ data, isConnectable }: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            <Handle
                id="unitOperator_handle"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable && useNodeConnections({handleType: "target", handleId: "unitOperator_handle"}).length == 0}
            />
            {renderUnit(data.unitType ?? 'Unit', data.name)}
            <Handle
                id="market_handle"
                type="source"
                position={Position.Right}
                isConnectable={isConnectable}
            />
        </>
    )
}

export function UnitOperatorNode({ data, isConnectable }: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            <Handle
                id="world_handle"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable && useNodeConnections({handleType: "target", handleId: "world_handle"}).length == 0}
            />
            {renderUnit('Unit Operator', data.name)}
            <Handle
                id="unit_handle"
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
            />
        </>
    )
}


export function MarketProductNode({ data, isConnectable }: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            <Handle
                id="market_handle"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable && useNodeConnections({handleType: "target", handleId: "market_handle"}).length == 0}
            />
            {renderUnit('Market Product', data.name)}
        </>
    )
}

function renderUnit(name: string, id: string) {
    return (
        <div className="px-3 py-1 shadow-md rounded-md bg-white border-2 border-stone-400">
            <div className='font-bold'>
                {name}
            </div>
            <div className='text-sm text-gray-500'>
                {id}
            </div>
        </div>
    )
}