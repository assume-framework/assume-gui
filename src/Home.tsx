'use client'

import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Panel,
    Controls,
    ReactFlow,
    useReactFlow,
    type Connection,
    type Edge,
    type EdgeChange,
    type Node,
    type NodeChange,
    type NodeSelectionChange,
    type OnConnect,
    type OnEdgesChange,
    type OnNodesChange
} from '@xyflow/react';
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import '@xyflow/react/dist/style.css';
import './Home.css';

import {DnDContext} from './DragDropCtx';
import {UnitMarketEdge} from './ui/Edges';
import {MarketNode, MarketProductNode, MarketProviderNode, UnitNode, UnitOperatorNode, WorldNode} from './ui/Nodes';
import {type Forecast} from './ui/SidebarComponents/UploadSidebar.tsx';
import Header from './Header';
import Footer from './Footer';
import Cockpit from "./ui/Cockpit.tsx";
import Sidebar from "./ui/Sidebar.tsx";
import type {EditSidebarData, EditSidebarProps} from "./ui/SidebarComponents/NodeEditSidebar.tsx";

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
const initialNodes: Node<EditSidebarData>[] = [{
    id: 'world',
    type: "world",
    position: {x: 300, y: 0},
    data: {name: "World Node"},
    deletable: false
}];

const isValidConnection = (connection: Connection | Edge) =>
    connection.targetHandle?.split("_")[0] == connection.source?.split("_")[0] &&
    connection.sourceHandle?.split("_")[0] === connection.target?.split("_")[0];

let id = 1;
const getId = (type: string) => `${type}_${id++}`;

export default function Home() {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes] = useState<Node<EditSidebarData>[]>(initialNodes);
    const [edges, setEdges] = useState<Edge<EditSidebarData>[]>(initialEdges);
    const [forecast, setForecast] = useState<Forecast>({price: null, residual_load: null});
    const [nodeData, setNodeData] = useState<EditSidebarProps | null>(null);
    const [type] = useContext(DnDContext);
    const {screenToFlowPosition} = useReactFlow();

    const updateValue = useCallback((id: string, data: EditSidebarData, isEdge: boolean) => {
        const getter = isEdge ? edges : nodes;
        const setter = isEdge ? setEdges : setNodes;

        const entryList: Array<any> = structuredClone(getter);
        let foundItem: EditSidebarData | null = null
        entryList.forEach(item => {
            if (item.id === id) {
                item.data = data;
                foundItem = item
            }
        })
        setter(entryList);
        let nd = structuredClone(nodeData);
        if (!nd) {
            nd = {id: foundItem!.id, data: data, type: foundItem!.type, isEdge: isEdge};
        }
        nd.data = data;
        setNodeData(nd);
    }, [nodes, edges, nodeData, setNodes, setEdges, setNodeData])

    const onNodesChange: OnNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds) as Node<EditSidebarData>[]);
            if (!changes.map(c => c.type).includes('select')) {
                return
            }
            const selectedChange = changes.find((c): c is NodeSelectionChange => c.type === 'select' && c.selected);
            const node: Node<EditSidebarData> | undefined = nodes.find(n => n.id === selectedChange?.id);
            if (node) {
                setNodeData({id: node.id, type: node.type, data: node.data});
                return
            }
        },
        [nodes, setNodes, setNodeData],
    );

    const onEdgesChange: OnEdgesChange<Edge<EditSidebarData>> = useCallback(
        (changes: EdgeChange[]) => {
            setEdges((eds: Edge<EditSidebarData>[]) => applyEdgeChanges(changes, eds) as Edge<EditSidebarData>[]);
            if (!changes.map(c => c.type).includes('select')) {
                return
            }
            const selectedChange = changes.find((c): c is NodeSelectionChange => c.type === 'select' && c.selected);
            const edge: Edge<EditSidebarData> | undefined = edges.find(e => e.id === selectedChange?.id);
            if (edge) {
                setNodeData({id: edge.id, type: edge.type, data: edge.data!, isEdge: true});
                return
            }
        },
        [edges, setEdges, setNodeData],
    );
    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => {
            const newEdge: Edge<EditSidebarData> = {
                id: `${connection.source}#${connection.sourceHandle}#${connection.target}#${connection.targetHandle}`,
                source: connection.source,
                sourceHandle: connection.sourceHandle,
                target: connection.target,
                targetHandle: connection.targetHandle,
                type: 'default',
                data: {name: `${connection.source}-${connection.target}`},
            };
            if (connection.source.startsWith('unit') && connection.target.startsWith('market')) {
                newEdge.type = 'unit-market';
            }
            return addEdge(newEdge, eds);
        }),
        [setEdges],
    );

    const updateForecast = useCallback((type: keyof Forecast, value: string | null) => {
        const tmp = structuredClone(forecast)
        tmp[type] = value
        setForecast(tmp)
    }, [forecast, setForecast])

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

        setNodes((nds) => nds.concat(newNode));
    }, [screenToFlowPosition, type]);

    const reset = useCallback(() => {
        if (!confirm("Are you sure you want to reset the flow? This action cannot be undone.")) {
            return;
        }
        setNodes(initialNodes);
        setEdges(initialEdges);
        setForecast({price: null, residual_load: null});
        localStorage.removeItem('flow');
        setNodeData(null);
    }, [setNodes, setEdges, setNodeData]);

    const onPaneClick = useCallback(() => {
        setNodeData(null)
    }, [setNodeData]);

    const setFlowByJson = useCallback((data: string) => {
        const loaded = JSON.parse(data);
        setNodes(loaded["nodes"] ?? []);
        setEdges(loaded["edges"] ?? []);
        setForecast(loaded["forecasts"] ?? []);
    }, [setNodes, setEdges, setForecast]);

    useEffect(() => {
        const flow = localStorage.getItem('flow');
        if (flow) {
            setFlowByJson(flow)
        }
    }, [setNodes, setEdges, setFlowByJson]);

    return (
        <div className="dndflow">
            <Sidebar
                nodeData={nodeData}
                updateValue={updateValue}
                forecast={forecast}
                updateForecast={updateForecast}
            />
            <div className="flex grow flex-col">
                <Header/>
                <div className="grow" ref={reactFlowWrapper}>
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
                        <Controls/>
                        <Background/>
                        <Panel position="bottom-right" className='w-48'>
                            <Cockpit
                                nodes={nodes} edges={edges}
                                forecasts={forecast} reset={reset}
                                setFlowByJson={setFlowByJson}/>
                        </Panel>
                    </ReactFlow>
                </div>
                <Footer/>
            </div>
        </div>
    );
}
