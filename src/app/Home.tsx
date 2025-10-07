'use client'

import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, Edge, OnConnect, OnEdgesChange, OnNodesChange, ReactFlow, useReactFlow, type Node } from '@xyflow/react';
import React, { useCallback, useContext, useRef, useState } from "react";

import '@xyflow/react/dist/style.css';
import './index.css';

import { DnDContext } from './DragDropCtx';
import { MarketNode, MarketProviderNode, UnitNode, UnitOperatorNode, WorldNode } from './ui/Nodes';
import SelectSidebar from './ui/NodeSelectSidebar';
import { isValidConnection } from './ConnectionValidator';

const nodeTypes = {
  unit: UnitNode,
  unitOperator: UnitOperatorNode,
  world: WorldNode,
  market: MarketNode,
  marketProvider: MarketProviderNode,
}

const initialEdges: Edge[] = [];
const initialNodes: Node[] = [
  { id: 'world_node_0', type: "world", position: { x: 300, y: 0 }, data: {} },
];

let id = 1;
const getId = (type: string) => `${type}_node_${id++}`;

export default function Home() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [type] = useContext(DnDContext);
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!type) return;

    // project was renamed to screenToFlowPosition
    // and you don't need to subtract the reactFlowBounds.left/top anymore
    // details: https://reactflow.dev/whats-new/2023-11-10
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const newNode = {
      id: getId(type),
      type,
      position,
      data: { label: `${type} node` },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, type]);


  return (
    <div className="dndflow">
      <SelectSidebar />
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          deleteKeyCode={["Delete", "Backspace"]}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          isValidConnection={isValidConnection}
          onDrop={onDrop}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
