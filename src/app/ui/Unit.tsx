
import { Handle, Node, NodeProps, Position } from '@xyflow/react';

type UnitNode = Node<{i: number}, 'unit'>;

export default function UnitNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<UnitNode>) {

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

type UnitProviderNode = Node<{i: number}, 'unit_provider'>;

export function UnitProviderNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<UnitProviderNode>) {
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
