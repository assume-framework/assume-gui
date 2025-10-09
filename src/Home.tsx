'use client'

import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, ReactFlow, useReactFlow, type Edge, type NodeChange, type NodeSelectionChange, type OnConnect, type OnEdgesChange, type OnNodesChange, type Node } from '@xyflow/react';
import React, { useCallback, useContext, useRef, useState } from "react";

import '@xyflow/react/dist/style.css';
import './Home.css';

import { isValidConnection } from './ConnectionValidator';
import { DnDContext } from './DragDropCtx';
import EditSidebar, { type EditSidebarData, type EditSidebarProps } from './ui/NodeEditSidebar';
import { MarketNode, MarketProviderNode, UnitNode, UnitOperatorNode, WorldNode } from './ui/Nodes';
import SelectSidebar from './ui/NodeSelectSidebar';

const nodeTypes = {
  unit: UnitNode,
  unitOperator: UnitOperatorNode,
  world: WorldNode,
  market: MarketNode,
  marketProvider: MarketProviderNode,
}

const initialEdges: Edge[] = [];
const initialNodes: Node<EditSidebarData>[] = [
  { id: 'world', type: "world", position: { x: 300, y: 0 }, data: { name: "World Node" } },
];

let id = 1;
const getId = (type: string) => `${type}_${id++}`;

export default function Home() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState<Node<EditSidebarData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [nodeData, setNodeData] = useState<EditSidebarProps | null>(null);
  const [type] = useContext(DnDContext);
  const { screenToFlowPosition } = useReactFlow();

  const updateNodeValue = useCallback((id: string, data: EditSidebarData) => {
    const node = nodes.find(n => n.id === id);
    node!.data = data;
    const updated = nodes.map(n => n.id === id ? node! : n!);
    setNodes(updated);
    let nd = nodeData;
    if (!nd) {
      nd = { id: node!.id, data: node!.data, type: node!.type };
    }
    nd.data = data;
    setNodeData(nd);
  }, [nodes, nodeData, setNodes, setNodeData]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds) as Node<EditSidebarData>[]);
      if (!changes.map(c => c.type).includes('select')) {
        return
      }
      const selectedChange = changes.find((c): c is NodeSelectionChange => c.type === 'select' && c.selected === true);
      const node: Node<EditSidebarData> | undefined = nodes.find(n => n.id === selectedChange?.id);
      if (node) {
        setNodeData({ id: node.id, type: node.type, data: node.data });
        return
      }
      setNodeData(null);
    },
    [nodes, setNodes, setNodeData],
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
    const id = getId(type)
    const newNode: Node<EditSidebarData> = {
      id: id,
      type,
      position: screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      }),
      data: {
        name: id,
      },
    };
    if (type === "unit") {
      newNode.data = { ...newNode.data, unitType: "storage" }
    }

    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, type]);

  const onPaneClick = useCallback(() => { setNodeData(null) }, [setNodeData]);

  return (
    <div className="dndflow">
      {nodeData ?
        <EditSidebar
          id={nodeData.id}
          type={nodeData.type}
          data={nodeData.data}
          updateNodeValue={updateNodeValue}
        /> : <SelectSidebar />}
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          deleteKeyCode={["Delete", "Backspace"]}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onPaneClick={onPaneClick}
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
