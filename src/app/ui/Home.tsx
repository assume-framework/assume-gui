'use client'

import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, Edge, OnConnect, OnEdgesChange, OnNodesChange, ReactFlow, useReactFlow, type Node } from '@xyflow/react';
import React, { useCallback, useContext, useRef, useState } from "react";

import '@xyflow/react/dist/style.css';
import './index.css';

import DnDContext, { DnDProvider } from '../DragDropCtx';
import MarketNode, { MarketProviderNode } from './Market';
import Sidebar from './Sidebar';
import UnitNode, { UnitProviderNode } from "./Unit";
import WorldNode from "./World";

const nodeTypes = {
  unit: UnitNode,
  unitProvider: UnitProviderNode,
  world: WorldNode,
  market: MarketNode,
  marketProvider: MarketProviderNode,
}

const initialEdges: Edge[] = [
  { id: '1-2', source: '1', target: '2' },
  { id: '1-3', source: '1', target: '3' },
  { id: 'u1', source: '2', target: 'u1' },
  { id: 'u2', source: '2', target: 'u2' },
  { id: 'u3', source: '2', target: 'u3' },
  { id: 'm1', source: '3', target: 'm1' },
  { id: 'm2', source: '3', target: 'm2' },
  { id: 'm3', source: '3', target: 'm3' },
];
const initialNodes: Node[] = [
  { id: '1', type: "world", position: { x: 300, y: 0 }, data: {} },
  { id: '2', type: "unitProvider", position: { x: 0, y: 100 }, data: {} },
  { id: '3', type: "marketProvider", position: { x: 500, y: 100 }, data: {} },
  { id: 'u1', type: "unit", position: { x: -100, y: 200 }, data: {} },
  { id: 'u2', type: "unit", position: { x: 0, y: 200 }, data: {} },
  { id: 'u3', type: "unit", position: { x: 100, y: 200 }, data: {} },
  { id: 'm1', type: "market", position: { x: 400, y: 200 }, data: {} },
  { id: 'm2', type: "market", position: { x: 500, y: 200 }, data: {} },
  { id: 'm3', type: "market", position: { x: 600, y: 200 }, data: {} },
];

let id = 100;
const getId = () => `dndnode_${id++}`;

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
    console.log("drag over", type)
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    console.log("drop", type)
    console.log("event", event)
    if (!type) return;

    // project was renamed to screenToFlowPosition
    // and you don't need to subtract the reactFlowBounds.left/top anymore
    // details: https://reactflow.dev/whats-new/2023-11-10
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const newNode = {
      id: getId(),
      type,
      position,
      data: { label: `${type} node` },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, type]);


  return (
    <div className="dndflow">
      <Sidebar />
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
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
