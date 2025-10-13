'use client'

import { addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, ReactFlow, useReactFlow, type Edge, type EdgeChange, type Node, type NodeChange, type NodeSelectionChange, type OnConnect, type OnEdgesChange, type OnNodesChange } from '@xyflow/react';
import React, { useCallback, useContext, useRef, useState } from "react";

import '@xyflow/react/dist/style.css';
import './Home.css';

import { isValidConnection } from './ConnectionValidator';
import { DnDContext } from './DragDropCtx';
import { UnitMarketEdge } from './ui/Edges';
import EditSidebar, { type EditSidebarData, type EditSidebarProps } from './ui/NodeEditSidebar';
import { MarketNode, MarketProductNode, MarketProviderNode, UnitNode, UnitOperatorNode, WorldNode } from './ui/Nodes';
import SelectSidebar from './ui/NodeSelectSidebar';

const nodeTypes = {
  unit: UnitNode,
  unitOperator: UnitOperatorNode,
  world: WorldNode,
  market: MarketNode,
  marketProvider: MarketProviderNode,
  marketProduct: MarketProductNode,
}

const edgeTypes = {
  'unit-market': UnitMarketEdge,
}

const initialEdges: Edge<EditSidebarData>[] = [];
const initialNodes: Node<EditSidebarData>[] = [
  { id: 'world', type: "world", position: { x: 300, y: 0 }, data: { name: "World Node" }, deletable: false },
];

let id = 1;
const getId = (type: string) => `${type}_${id++}`;

export default function Home() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState<Node<EditSidebarData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge<EditSidebarData>[]>(initialEdges);
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

  const updateEdgeValue = useCallback((id: string, data: EditSidebarData) => {
    const edge = edges.find(e => e.id === id);
    edge!.data = data;
    const updated = edges.map(e => e.id === id ? edge! : e!);
    setEdges(updated);
    let ed = nodeData;
    if (!ed) {
      ed = { id: edge!.id, data: edge!.data, type: edge!.type, isEdge: true };
    }
    ed.data = data;
    setNodeData(ed);
  }, [edges, nodeData, setEdges, setNodeData]);

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

  const onEdgesChange: OnEdgesChange<Edge<EditSidebarData>> = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds: Edge<EditSidebarData>[]) => applyEdgeChanges(changes, eds) as Edge<EditSidebarData>[]);
      if (!changes.map(c => c.type).includes('select')) {
        return
      }
      const selectedChange = changes.find((c): c is NodeSelectionChange => c.type === 'select' && c.selected === true);
      const edge: Edge<EditSidebarData> | undefined = edges.find(e => e.id === selectedChange?.id);
      if (edge) {
        setNodeData({ id: edge.id, type: edge.type, data: edge.data!, isEdge: true });
        return
      }
      setNodeData(null);
    },
    [edges, setEdges, setNodeData],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => {
      eds = addEdge(connection, eds)
      if (connection.source.startsWith('unit') && connection.target.startsWith('market')) {
        eds[eds.length - 1].type = 'unit-market';
        eds[eds.length - 1].data = { name: getId('unit-market') };
      }
      return eds
    }),
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
          updateNodeValue={nodeData.isEdge ? updateEdgeValue : updateNodeValue}
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
          edgeTypes={edgeTypes}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
