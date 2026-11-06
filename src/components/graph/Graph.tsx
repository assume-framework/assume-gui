import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  type EdgeSelectionChange,
  type FinalConnectionState,
  type Node,
  type NodeChange,
  type NodeSelectionChange,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, type Dispatch, type SetStateAction } from 'react';

import '@xyflow/react/dist/style.css';
import './graph.css';

import { UnitMarketEdge } from './Edges';
import {
  MarketNode,
  MarketProductNode,
  MarketProviderNode,
  UnitNode,
  UnitOperatorNode,
  WorldNode,
} from './Nodes';
import type { AlertState } from '../types';
import { addConfigEdge, addConfigNode, edgeId, removeFromConfig } from '../../scenario/model';
import type { ScenarioConfig } from '../../scenario/types';
import { getId, initialData } from '../../scenario/defaults';

const nodeTypes = {
  unit: UnitNode,
  unitOperator: UnitOperatorNode,
  world: WorldNode,
  market: MarketNode,
  marketProvider: MarketProviderNode,
  marketProduct: MarketProductNode,
};

const edgeTypes = {
  'unit-market': UnitMarketEdge,
};

export interface Selection {
  id: string;
  isEdge: boolean;
}

interface GraphProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setConfig: Dispatch<SetStateAction<ScenarioConfig>>;
  setSelection: (selection: Selection) => void;
  setAlert: Dispatch<SetStateAction<AlertState>>;
  onPaneClick: () => void;
}

export default function Graph({
  nodes,
  edges,
  setNodes,
  setEdges,
  setConfig,
  setSelection,
  setAlert,
  onPaneClick,
}: GraphProps) {
  const { screenToFlowPosition } = useReactFlow();

  /** Removing something from the graph removes it from the configuration. */
  const removeEntities = useCallback(
    (nodeIds: string[], edgeIds: string[]) => {
      if (nodeIds.length === 0 && edgeIds.length === 0) return;
      setConfig((c) => removeFromConfig(c, new Set(nodeIds), new Set(edgeIds)));
    },
    [setConfig]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      removeEntities(
        changes.filter((c) => c.type === 'remove').map((c) => c.id),
        []
      );
      const selected = changes.find(
        (c): c is NodeSelectionChange => c.type === 'select' && c.selected
      );
      if (selected) {
        setSelection({ id: selected.id, isEdge: false });
      }
    },
    [removeEntities, setNodes, setSelection]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      removeEntities(
        [],
        changes.filter((c) => c.type === 'remove').map((c) => c.id)
      );
      const selected = changes.find(
        (c): c is EdgeSelectionChange => c.type === 'select' && c.selected
      );
      if (selected) {
        setSelection({ id: selected.id, isEdge: true });
      }
    },
    [removeEntities, setEdges, setSelection]
  );

  /** Adds a connection to the graph and, unless it exists already, to the configuration. */
  const connect = useCallback(
    (source: string, sourceHandle: string, target: string, targetHandle: string) => {
      const type =
        source.startsWith('market') && target.startsWith('unit') ? 'unit-market' : 'default';
      const id = edgeId(source, sourceHandle, target, targetHandle);
      const data = initialData(type);
      setEdges((eds) =>
        addEdge({ id, source, sourceHandle, target, targetHandle, type, data: {} }, eds)
      );
      setConfig((c) => (c.edges[id] ? c : addConfigEdge(c, { id, type, source, target, data })));
    },
    [setEdges, setConfig]
  );

  /** Adds a node to the graph and to the configuration. */
  const createNode = useCallback(
    (nodeType: string, position: { x: number; y: number }) => {
      const id = getId(nodeType);
      setNodes((nds) => nds.concat({ id, type: nodeType, position, data: {} }));
      const data = initialData(nodeType); // not inside the updater, it numbers the default name
      setConfig((c) => addConfigNode(c, { id, type: nodeType, data }));
      return id;
    },
    [setNodes, setConfig]
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const sameFromHandles =
        connection.targetHandle?.split('_')[0] === connection.source?.split('_')[0];
      const sameToHandles =
        connection.sourceHandle?.split('_')[0] === connection.target?.split('_')[0];
      const ok = sameFromHandles && sameToHandles;
      if (!ok) {
        setAlert({
          message:
            'These node types cannot be connected. Please connect according to the handle hints.',
          severity: 'warning',
        });
      }
      return ok;
    },
    [setAlert]
  );
  const onConnect: OnConnect = useCallback(
    (connection) =>
      connect(
        connection.source,
        connection.sourceHandle ?? '',
        connection.target,
        connection.targetHandle ?? ''
      ),
    [connect]
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, conn: FinalConnectionState) => {
      // if normal onConnect, fromHandle missing, starting not from 'source' or missing handle id: stop
      if (conn.isValid != null || !conn.fromHandle) return;
      if (conn.fromHandle.type !== 'source' || !conn.fromHandle.id) return;

      // Logic to get correct Node type and Handle id
      const sourceID = conn.fromHandle.nodeId;
      const handleID = conn.fromHandle.id;

      // NOTE: this only works if no '_' in handle except at end!
      // New node type from source handle prefix (e.g., "market_handle" → "market")
      const newNodeType = handleID.split('_')[0];
      // Target handle = source node type prefix + "_handle"
      const sourcePrefix = sourceID.split('_')[0];
      const targetHandleId = `${sourcePrefix}_handle`;

      // Gets position independent of mouse and touchscreen
      const clientX = 'changedTouches' in event ? event.changedTouches[0].clientX : event.clientX;
      const clientY = 'changedTouches' in event ? event.changedTouches[0].clientY : event.clientY;

      // create new Node at canvas coords corresponding to mouse position
      const newNodeId = createNode(newNodeType, screenToFlowPosition({ x: clientX, y: clientY }));
      connect(sourceID, handleID, newNodeId, targetHandleId);
    },
    [screenToFlowPosition, createNode, connect]
  );

  return (
    <div className="flex grow flex-col select-none" onContextMenu={(e) => e.preventDefault()}>
      <ReactFlow
        deleteKeyCode={['Delete', 'Backspace']}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onPaneClick={onPaneClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        isValidConnection={isValidConnection}
        edgeTypes={edgeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
