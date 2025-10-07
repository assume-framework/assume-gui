
import { Handle, Node, NodeProps, Position } from '@xyflow/react';

type MarketNode = Node<{ i: number }, 'market'>;

export default function MarketNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<MarketNode>) {

    return (
        <div>
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
        </div>
    )
}

type MarketProviderNode = Node<{ i: number }, 'market_provider'>;

export function MarketProviderNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<MarketProviderNode>) {
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
