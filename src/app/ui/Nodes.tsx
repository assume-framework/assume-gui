
import { Handle, Node, NodeProps, Position } from '@xyflow/react';

export function WorldNode({ data, isConnectable, sourcePosition = Position.Bottom }: NodeProps) {
    return (
        <>
            World
            <Handle
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
        </>
    )
}

export function MarketNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) {

    return (
        <>
            <Handle
                id="a"
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />
            <Handle
                id="b "
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
            />
            Market
            <Handle
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
        </>
    )
}

export function MarketProviderNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) {
    return (
        <div>
            <Handle
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />

            Market Provider
            <Handle
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
        </div>
    )
}


export function UnitNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) {

    return (
        <div>
            <Handle
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />
            Unit
            <Handle
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
        </div>
    )
}

export function UnitProviderNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps) {
    return (
        <div>
            <Handle
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />
            Unit Provider
            <Handle
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
        </div>
    )
}
