'use client'

import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    type Connection,
    Controls,
    type Edge,
    type EdgeChange,
    type Node,
    type NodeChange,
    type NodeSelectionChange,
    type OnConnect,
    type OnEdgesChange,
    type OnNodesChange,
    Panel,
    ReactFlow,
    useReactFlow
} from '@xyflow/react';
import React, {useCallback, useContext, useMemo, useRef, useState} from "react";

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
import DiscussSimulationChat from "./ui/DiscussSimulationChat.tsx";
import type {EditSidebarData, EditSidebarProps} from "./ui/SidebarComponents/NodeEditSidebar.tsx";
import {sendData, type DataResponse} from "./sendData.ts";
import {Alert, type AlertColor, Snackbar} from "@mui/material";

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

const initialForecast: Forecast = {price: null, residual_load: null}
const initialEdges: Edge<EditSidebarData>[] = [];
const initialNodes: Node<EditSidebarData>[] = [{
    id: 'world',
    type: "world",
    position: {x: 300, y: 0},
    data: {name: "World Node", errorField: '', errorMessage: ''},
    deletable: false
}];

let id = 1;
const getId = (type: string) => `${type}_${id++}`;

const readLocalStorage = () => {
    const data = localStorage.getItem('flow');
    if (!data) {
        return {};
    }
    return JSON.parse(data);
}

interface AlertState {
    message: string;
    severity: AlertColor;
}

export default function Home() {
    const loaded = readLocalStorage();
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes] = useState<Node<EditSidebarData>[]>(loaded['nodes'] ?? initialNodes);
    const [edges, setEdges] = useState<Edge<EditSidebarData>[]>(loaded['edges'] ?? initialEdges);
    const [forecast, setForecast] = useState<Forecast>(loaded['forecasts'] ?? initialForecast);
    const [nodeData, setNodeData] = useState<EditSidebarProps | null>(null);
    const [type] = useContext(DnDContext);
    const {screenToFlowPosition} = useReactFlow();
    const [alert, setAlert] = useState<AlertState>({'message': '', 'severity': 'info'})
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDiscuss, setShowDiscuss] = useState(false);
    const [showRlComingSoon, setShowRlComingSoon] = useState(false);

    const worldJson = useMemo(() => JSON.stringify({nodes: nodes, edges: edges}), [nodes, edges]);

    const updateValue = useCallback((id: string, data: EditSidebarData, isEdge: boolean) => {
        type T = Node<EditSidebarData> | Edge<EditSidebarData>;
        const setter: CallableFunction = isEdge ? setEdges : setNodes;

        const entryList: T[] = structuredClone(isEdge ? edges : nodes);
        let foundItem: T | null = null
        entryList.forEach((item: T) => {
            if (item.id === id) {
                if (item.data && item.data.errorField
                    && item.data[item.data.errorField] !== data[item.data.errorField]) {
                    // fiel with error has changed, reset error
                    data.errorField = ''
                    data.errorMessage = ''
                }

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

    const isValidConnectionCb = useCallback(
        (connection: Connection | Edge) => {
            const sameFromHandles =
                connection.targetHandle?.split("_")[0] === connection.source?.split("_")[0];
            const sameToHandles =
                connection.sourceHandle?.split("_")[0] === connection.target?.split("_")[0];
            const ok = !!sameFromHandles && !!sameToHandles;
            if (!ok) {
                setAlert({
                    message: 'These node types cannot be connected. Please connect according to the handle hints.',
                    severity: 'warning',
                });
            }
            return ok;
        },
        [setAlert],
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
                data: {name: `${connection.source}-${connection.target}`, errorField: '', errorMessage: ''},
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
                errorField: '',
                errorMessage: '',
            },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [screenToFlowPosition, setNodes, type]);

    const onPaneClick = useCallback(() => setNodeData(null), [setNodeData]);

    const reset = useCallback(() => {
        if (!confirm("Are you sure you want to reset the flow? This action cannot be undone.")) {
            return;
        }
        setNodes(initialNodes);
        setEdges(initialEdges);
        setForecast(initialForecast);
        localStorage.removeItem('flow');
        setNodeData(null);
        setAlert({message: 'Flow reset successfully', severity: 'success'})
    }, [setNodes, setEdges, setNodeData]);

    const submit = useCallback(async () => {
            if (isSubmitting) {
                return;
            }
            setIsSubmitting(true);
            try {
                const response: DataResponse = await sendData(nodes, edges, forecast)
                if (response.success) {
                    setAlert({message: 'Flow submitted successfully', severity: 'success'})
                    return;
                }
                // handle validation error
                if (response.id && response.field && response.message) {
                    const foundNode = nodes.find(n => n.id === response.id)
                    const found = foundNode ?? edges.find(e => e.id === response.id)
                    if (found && found.data) {
                        found.data.errorField = response.field
                        found.data.errorMessage = response.message
                        updateValue(found.id, found.data, !foundNode)
                        setAlert({message: 'Invalid configuration: ' + response.message, severity: 'warning'})
                        return;
                    }
                }
                console.error("Unknown error: ", response)
                setAlert({message: response.message ?? 'Submission failed. Please try again.', severity: 'error'})
            } finally {
                setIsSubmitting(false);
            }
        }, [nodes, edges, forecast, updateValue, setAlert, isSubmitting]
    )

    const setFlowByJson = useCallback((data: string) => {
        const loaded = JSON.parse(data);
        setNodes(loaded["nodes"] ?? initialNodes);
        setEdges(loaded["edges"] ?? initialEdges);
        setForecast(loaded["forecasts"] ?? initialForecast);
    }, [setNodes, setEdges, setForecast]);

    const save = useCallback(() => {
        localStorage.setItem('flow', JSON.stringify({"nodes": nodes, "edges": edges, "forecasts": forecast}));
        setAlert({message: 'Flow saved successfully', severity: 'success'})
    }, [nodes, edges, forecast]);

    const download = useCallback(() => {
        const blob = JSON.stringify({"nodes": nodes, "edges": edges});
        const href = URL.createObjectURL(new Blob([blob], {type: 'application/json'}));
        const link = document.createElement('a');
        link.href = href;
        link.download = `simulation-${Date.now().toString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [nodes, edges])

    return (
        <div className="flex h-full">
            <Snackbar open={!!alert.message}
                      autoHideDuration={3000}
                      anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                      onClose={() => setAlert({...alert, message: ''})}
                      onClick={() => setAlert({...alert, message: ''})}
            >
                <Alert severity={alert.severity}
                       variant="outlined">{alert.message}</Alert>
            </Snackbar>
            <Sidebar
                nodeData={nodeData}
                updateValue={updateValue}
                forecast={forecast}
                updateForecast={updateForecast}
            />
            <div className="flex grow flex-col select-none">
                <Header
                    onDiscussSimulation={() => setShowDiscuss(true)}
                    onReinforcementLearning={() => setShowRlComingSoon(true)}
                />
                {showRlComingSoon && (
                    <div className="mx-2 mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 flex items-start justify-between gap-3">
                        <div>
                            <div className="font-bold text-sm">Reinforcement Learning</div>
                            <div className="text-sm text-amber-800">Coming soon. Check back later.</div>
                        </div>
                        <button
                            type="button"
                            className="shrink-0 rounded px-2 py-1 text-sm hover:bg-amber-100"
                            onClick={() => setShowRlComingSoon(false)}
                        >
                            Dismiss
                        </button>
                    </div>
                )}
                <div className="grow"
                     ref={reactFlowWrapper}>
                    <ReactFlow
                        deleteKeyCode={["Delete", "Backspace"]}
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onPaneClick={onPaneClick}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDragOver={onDragOver}
                        isValidConnection={isValidConnectionCb}
                        onDrop={onDrop}
                        edgeTypes={edgeTypes}
                        fitView
                    >
                        <Controls/>
                        <Background/>
                        <Panel position="bottom-right">
                            <Cockpit
                                submit={submit}
                                processing={isSubmitting}
                                reset={reset}
                                save={save}
                                download={download}
                                setFlowByJson={setFlowByJson}
                            />
                        </Panel>
                    </ReactFlow>
                </div>
                <Footer/>
            </div>
            {showDiscuss && (
                <DiscussSimulationChat
                    worldJson={worldJson}
                    onClose={() => setShowDiscuss(false)}
                />
            )}
        </div>
    );
}
