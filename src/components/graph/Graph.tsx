import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  type EdgeSelectionChange,
  type FinalConnectionState,
  type NodeChange,
  type NodeSelectionChange,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import {
  useCallback,
  useState,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
} from 'react';
import { useScenario } from '../../scenario/context';

import '@xyflow/react/dist/style.css';
import './graph.css';

import { UnitMarketEdge } from './Edges';
import GraphContextMenu, { type ContextMenuState } from './contextMenu/GraphContextMenu.tsx';
import {
  MarketNode,
  MarketProductNode,
  MarketProviderNode,
  UnitNode,
  UnitOperatorNode,
  WorldNode,
} from './Nodes';
import type { AlertState } from '../types';
import { buildGraph, edgeId } from '../../scenario/model';
import type { Scenario } from '../../scenario/types';
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
  /** Drawn on first render only; afterwards React Flow owns nodes and edges. */
  initial: Scenario;
  setSelection: (selection: Selection) => void;
  setAlert: Dispatch<SetStateAction<AlertState>>;
  onPaneClick: () => void;
}

export default function Graph({ initial, setSelection, setAlert, onPaneClick }: GraphProps) {
  const { screenToFlowPosition, setNodes, setEdges } = useReactFlow();
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [initialGraph] = useState(() => buildGraph(initial));
  const { actions } = useScenario();
  const { addNode, addEdge: addConfigEdge, removeEntities } = actions;

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
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
    [removeEntities, setSelection]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
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
    [removeEntities, setSelection]
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
      addConfigEdge({ id, type, source, target, data });
    },
    [setEdges, addConfigEdge]
  );

  /** Adds a node to the graph and to the configuration. */
  const createNode = useCallback(
    (nodeType: string, position: { x: number; y: number }) => {
      const id = getId(nodeType);
      setNodes((nds) => nds.concat({ id, type: nodeType, position, data: {} }));
      const data = initialData(nodeType); // not inside the updater, it numbers the default name
      addNode({ id, type: nodeType, data });
      return id;
    },
    [setNodes, addNode]
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

  const openMenu = useCallback(
    (event: MouseEvent | ReactMouseEvent, target: ContextMenuState['target']) => {
      event.preventDefault();
      setMenu({ x: event.clientX, y: event.clientY, target });
    },
    []
  );
  const closeMenu = () => setMenu(null);

  return (
    <div
      className="flex grow flex-col select-none"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDownCapture={(e) => {
        // Any left click on the graph closes the menu. Clicks inside the menu (a portal) are
        // React-bubbled to here, so only count events whose target is really in this element.
        if (e.button === 0 && e.currentTarget.contains(e.target as Node)) closeMenu();
      }}
    >
      <ReactFlow
        deleteKeyCode={['Delete', 'Backspace']}
        defaultNodes={initialGraph.nodes}
        defaultEdges={initialGraph.edges}
        nodeTypes={nodeTypes}
        onPaneClick={onPaneClick}
        onPaneContextMenu={(e) => openMenu(e, null)}
        onNodeContextMenu={(e, node) =>
          openMenu(e, { id: node.id, isEdge: false, deletable: node.deletable !== false })
        }
        onEdgeContextMenu={(e, edge) =>
          openMenu(e, { id: edge.id, isEdge: true, deletable: edge.deletable !== false })
        }
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
      <GraphContextMenu menu={menu} onClose={closeMenu} onAddNode={createNode} />
    </div>
  );
}
