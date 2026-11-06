import { useCallback, useEffect, useMemo, useState } from 'react';

import Graph, { type Selection } from './components/graph/Graph';
import type { AlertState } from './components/types';
import { loadScenario } from './scenario/storage';
import { ScenarioContext, useScenarioState } from './scenario/context';
import { useGraphActions } from './components/graph/useGraphActions';
import { WORLD_ID } from './scenario/model';
import { serializeScenario } from './scenario/serialization';
import Header from './components/layout/Header';
import Sidebar from './components/sidebar/Sidebar';
import DiscussSimulationChat from './components/chat/DiscussSimulationChat';
import type { EditSidebarProps } from './components/sidebar/NodeEditSidebar';
import { buildGrafanaResultsHref } from './api/grafana';
import { Alert, Snackbar } from '@mui/material';

export default function App() {
  const [initial] = useState(loadScenario);
  // The simulation parameters. This is all the backend gets to see.
  const scenario = useScenarioState(initial.config);
  const { config, issues } = scenario;
  const graphActions = useGraphActions();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [alert, setAlert] = useState<AlertState>({ message: '', severity: 'info' });
  const [showDiscuss, setShowDiscuss] = useState(false);
  const [discussChatMounted, setDiscussChatMounted] = useState(false);

  // Only serialized while the chat is open: nodes change on every drag.
  const scenarioJson = useMemo(
    () => (showDiscuss ? serializeScenario({ config, layout: graphActions.getLayout() }) : ''),
    [showDiscuss, config, graphActions]
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

  const stopEditView = useCallback(() => setSelection(null), []);

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
    <ScenarioContext.Provider value={scenario}>
      <div className="flex min-h-0 grow flex-col">
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
            setAlert={setAlert}
            close={stopEditView}
          />
          <Graph
            initial={initial}
            setSelection={setSelection}
            setAlert={setAlert}
            onPaneClick={stopEditView}
          />
        </div>
        {discussChatMounted && (
          <DiscussSimulationChat
            open={showDiscuss}
            scenarioJson={scenarioJson}
            onClose={() => setShowDiscuss(false)}
          />
        )}
      </div>
    </ScenarioContext.Provider>
  );
}
