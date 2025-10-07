
import { Handle, Node, NodeProps, Position } from '@xyflow/react';

type WorldNode = Node<{i: number}, 'world'>;

export default function WorldNode({ data, isConnectable, sourcePosition = Position.Bottom }: NodeProps<WorldNode>) {

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
