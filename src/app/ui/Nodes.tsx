
import { Handle, Node, NodeProps, Position } from '@xyflow/react';

export function WorldNode({ data, isConnectable, sourcePosition = Position.Bottom }: NodeProps) {
    return (
        <>
            World
            <Handle
                id="unitOperator_handle"
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
                style={{ left: 20 }}
            />
            <Handle
                id="marketProvider_handle"
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
                style={{ left: 30 }}
            />
        </>
    )
}

export function MarketNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) {

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
            Market
        </>
    )
}

export function MarketProviderNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) {
    return (
        <>
            <Handle
            id="world_handle"
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />

            Market Provider
            <Handle
                id="market_handle"
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
        </>
    )
}


export function UnitNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) {
    return (
        <>
            <Handle
            id="unitOperator_handle"
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />
            Unit
            <Handle
                id="market_handle"
                type="source"
                position={Position.Right}
                isConnectable={isConnectable}
            />
        </>
    )
}

export function UnitOperatorNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) {
    return (
        <>
            <Handle
            id="world_handle"
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />
            Unit Operator
            <Handle
                id="unit_handle"
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
        </>
    )
}
