
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { EditSidebarData } from './NodeEditSidebar';


export function WorldNode({ data, isConnectable, sourcePosition = Position.Bottom }: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            {renderUnit('World', data.name)}
            <Handle
                id="unitOperator_handle"
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
                style={{ left: 25 }}
            />
            <Handle
                id="marketProvider_handle"
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
                style={{ left: 55 }}
            />
        </>
    )
}

export function MarketNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<Node<EditSidebarData>>) {

    return (
        <>
            <Handle
                id="marketProvider_handle"
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />
            <Handle
                id="unit_handle"
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
            />
            {renderUnit('Market', data.name)}
        </>
    )
}

export function MarketProviderNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            <Handle
                id="world_handle"
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />

            {renderUnit('Market Provider', data.name)}
            <Handle
                id="market_handle"
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
        </>
    )
}


export function UnitNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            <Handle
                id="unitOperator_handle"
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />
            {renderUnit(data.unitType, data.name)}
            <Handle
                id="market_handle"
                type="source"
                position={Position.Right}
                isConnectable={isConnectable}
            />
        </>
    )
}

export function UnitOperatorNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<Node<EditSidebarData>>) {
    return (
        <>
            <Handle
                id="world_handle"
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />
            {renderUnit('Unit Operator', data.name)}
            <Handle
                id="unit_handle"
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
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