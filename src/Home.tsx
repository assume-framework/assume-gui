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
  Panel,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import '@xyflow/react/dist/style.css';
import './Home.css';

import { UnitMarketEdge } from './ui/Edges';
import {
  MarketNode,
  MarketProductNode,
  MarketProviderNode,
  UnitNode,
  UnitOperatorNode,
  WorldNode,
} from './ui/Nodes';
import { type Forecast } from './ui/SidebarComponents/UploadSidebar';
import { ScenarioContext } from './scenario/context';
import {
  WORLD_ID,
  addConfigEdge,
  addConfigNode,
  buildGraph,
  clearChangedIssues,
  createInitialScenario,
  edgeId,
  extractLayout,
  removeFromConfig,
  updateConfigData,
} from './scenario/model';
import { parseScenarioFile, serializeScenario } from './scenario/serialization';
import type { ConfigData, Issues, Scenario, ScenarioConfig } from './scenario/types';
import Header from './Header';
import Footer from './Footer';
import Cockpit from './ui/Cockpit';
import Sidebar from './ui/Sidebar';
import DiscussSimulationChat from './ui/DiscussSimulationChat';
import type { EditSidebarProps } from './ui/SidebarComponents/NodeEditSidebar';
import { sendData, type DataResponse } from './sendData';
import { buildGrafanaResultsHref, getId, initialData } from './utils';
import { getLayoutedElements } from './layout';
import { Alert, type AlertColor, Snackbar } from '@mui/material';

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

const STORAGE_KEY = 'flow';

/** The saved scenario, or a fresh one if nothing (valid) was saved. */
const loadScenario = (): Scenario => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return createInitialScenario();
  }
  try {
    return parseScenarioFile(saved);
  } catch (e) {
    console.warn('Discarding unreadable saved flow', e);
    localStorage.removeItem(STORAGE_KEY);
    return createInitialScenario();
  }
};

interface Selection {
  id: string;
  isEdge: boolean;
}

interface AlertState {
  message: string;
  severity: AlertColor;
}

export default function Home() {
  const [initial] = useState(loadScenario);
  const reactFlowWrapper = useRef(null);
  // The simulation parameters. This is all the backend gets to see.
  const [config, setConfig] = useState<ScenarioConfig>(initial.config);
  // The drawing: React Flow owns positions, selection and measured sizes of the same entities.
  const [nodes, setNodes] = useState<Node[]>(() => buildGraph(initial).nodes);
  const [edges, setEdges] = useState<Edge[]>(() => buildGraph(initial).edges);
  const [issues, setIssues] = useState<Issues>({});
  const [selection, setSelection] = useState<Selection | null>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [alert, setAlert] = useState<AlertState>({ message: '', severity: 'info' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscuss, setShowDiscuss] = useState(false);
  const [discussChatMounted, setDiscussChatMounted] = useState(false);

  const scenarioContext = useMemo(() => ({ config, issues }), [config, issues]);

  const worldJson = useMemo(
    () =>
      JSON.stringify({ nodes: Object.values(config.nodes), edges: Object.values(config.edges) }),
    [config]
  );

  const grafanaResultsHref = useMemo(() => {
    const world = config.nodes[WORLD_ID];
    if (!world) return '/grafana';
    return buildGrafanaResultsHref(world.data.start, world.data.end, world.data.simulation_id);
  }, [config]);

  const nodeData = useMemo((): EditSidebarProps | null => {
    if (!selection) return null;
    const item = selection.isEdge ? config.edges[selection.id] : config.nodes[selection.id];
    return item
      ? { id: item.id, type: item.type, data: item.data, isEdge: selection.isEdge }
      : null;
  }, [selection, config]);

  const updateValue = useCallback(
    (id: string, data: ConfigData, isEdge: boolean) => {
      const before = (isEdge ? config.edges[id] : config.nodes[id])?.data;
      setConfig((c) => updateConfigData(c, id, isEdge, data));
      setIssues((current) => clearChangedIssues(current, id, before, data));
    },
    [config]
  );

  /** Removing something from the graph removes it from the configuration. */
  const removeEntities = useCallback((nodeIds: string[], edgeIds: string[]) => {
    if (nodeIds.length === 0 && edgeIds.length === 0) return;
    setConfig((c) => removeFromConfig(c, new Set(nodeIds), new Set(edgeIds)));
  }, []);

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
    [removeEntities]
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
    [removeEntities]
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
    []
  );

  /** Adds a node to the graph and to the configuration. */
  const createNode = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const id = getId(nodeType);
    setNodes((nds) => nds.concat({ id, type: nodeType, position, data: {} }));
    const data = initialData(nodeType); // not inside the updater, it numbers the default name
    setConfig((c) => addConfigNode(c, { id, type: nodeType, data }));
    return id;
  }, []);

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

  const updateForecast = useCallback((type: keyof Forecast, value: string | null) => {
    setConfig((c) => ({ ...c, forecasts: { ...c.forecasts, [type]: value } }));
  }, []);

  const stopEditView = useCallback(() => setSelection(null), []);

  const applyScenario = useCallback((scenario: Scenario) => {
    const graph = buildGraph(scenario);
    setConfig(scenario.config);
    setNodes(graph.nodes);
    setEdges(graph.edges);
    setIssues({});
    setSelection(null);
  }, []);

  /** The scenario as it is saved and downloaded: config and layout side by side. */
  const currentScenario = useCallback(
    (): Scenario => ({ config, layout: extractLayout(nodes, edges) }),
    [config, nodes, edges]
  );

  const reset = useCallback(() => {
    if (!confirm('Are you sure you want to reset the flow? This action cannot be undone.')) {
      return;
    }
    applyScenario(createInitialScenario());
    localStorage.removeItem(STORAGE_KEY);
    setAlert({ message: 'Flow reset successfully', severity: 'success' });
  }, [applyScenario]);

  const submit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setIssues({});
    try {
      const response: DataResponse = await sendData(config);
      if (response.success) {
        setAlert({ message: 'Flow submitted successfully', severity: 'success' });
        return;
      }
      // handle validation error
      if (
        response.id &&
        response.field &&
        response.message &&
        (response.id in config.nodes || response.id in config.edges)
      ) {
        setIssues({ [response.id]: [{ field: response.field, message: response.message }] });
        setAlert({ message: 'Invalid configuration: ' + response.message, severity: 'warning' });
        return;
      }
      console.error('Unknown error: ', response);
      setAlert({
        message: response.message ?? 'Submission failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [config, setAlert, isSubmitting]);

  const setFlowByJson = useCallback(
    (data: string) => {
      try {
        applyScenario(parseScenarioFile(data));
      } catch (e) {
        setAlert({
          message: e instanceof Error ? e.message : 'Could not read the file',
          severity: 'error',
        });
      }
    },
    [applyScenario]
  );

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, serializeScenario(currentScenario()));
    setAlert({ message: 'Flow saved successfully', severity: 'success' });
  }, [currentScenario]);

  const autoArrange = useCallback(() => {
    setNodes((nds) => getLayoutedElements(nds, edges));
    window.requestAnimationFrame(() => fitView({ padding: 0.1 }));
  }, [edges, fitView]);

  const download = useCallback(() => {
    const blob = serializeScenario(currentScenario());
    const href = URL.createObjectURL(new Blob([blob], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = href;
    link.download = `simulation-${Date.now().toString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentScenario]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        stopEditView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopEditView]);

  return (
    <ScenarioContext.Provider value={scenarioContext}>
      <div className="flex h-full flex-col">
        <Snackbar
          open={!!alert.message}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          onClose={() => setAlert({ ...alert, message: '' })}
          onClick={() => setAlert({ ...alert, message: '' })}
        >
          <Alert severity={alert.severity} variant="outlined">
            {alert.message}
          </Alert>
        </Snackbar>
        <Header
          grafanaResultsHref={grafanaResultsHref}
          onDiscussSimulation={() => {
            setDiscussChatMounted(true);
            setShowDiscuss(true);
          }}
        />
        <div className="flex min-h-0 grow">
          <Sidebar
            nodeData={nodeData}
            issues={nodeData ? (issues[nodeData.id] ?? []) : []}
            updateValue={updateValue}
            forecast={config.forecasts}
            updateForecast={updateForecast}
            close={stopEditView}
          />
          <div className="flex grow flex-col select-none">
            <div className="grow" onContextMenu={(e) => e.preventDefault()} ref={reactFlowWrapper}>
              <ReactFlow
                deleteKeyCode={['Delete', 'Backspace']}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onPaneClick={stopEditView}
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
                <Panel position="bottom-right">
                  <Cockpit
                    submit={submit}
                    processing={isSubmitting}
                    reset={reset}
                    save={save}
                    download={download}
                    setFlowByJson={setFlowByJson}
                    autoArrange={autoArrange}
                  />
                </Panel>
              </ReactFlow>
            </div>
            <Footer />
          </div>
        </div>
        {discussChatMounted && (
          <DiscussSimulationChat
            open={showDiscuss}
            worldJson={worldJson}
            onClose={() => setShowDiscuss(false)}
          />
        )}
      </div>
    </ScenarioContext.Provider>
  );
}
