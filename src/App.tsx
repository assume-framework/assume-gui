import { useMemo, useState } from 'react';

import type { AlertState, View } from './components/types';
import { loadScenario } from './scenario/storage';
import { ScenarioContext, useScenarioState } from './scenario/context';
import { useGraphActions } from './components/graph/useGraphActions';
import { WORLD_ID } from './scenario/model';
import { serializeScenario } from './scenario/serialization';
import Header from './components/layout/Header';
import BuildView from './components/views/BuildView';
import RunView from './components/views/RunView';
import InspectView from './components/views/InspectView';
import DiscussSimulationChat from './components/chat/DiscussSimulationChat';
import { buildGrafanaResultsHref } from './api/grafana';
import AlertSnackbar from './components/layout/AlertSnackbar';

export default function App() {
  const [initial] = useState(loadScenario);
  // The simulation parameters. This is all the backend gets to see.
  const scenario = useScenarioState(initial.config);
  const { config } = scenario;
  const graphActions = useGraphActions();
  const [alert, setAlert] = useState<AlertState>({ message: '', severity: 'info' });
  const [view, setView] = useState<View>('Build');
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

  return (
    <ScenarioContext.Provider value={scenario}>
      <div className="flex min-h-0 grow flex-col">
        <AlertSnackbar alert={alert} onClose={() => setAlert({ ...alert, message: '' })} />
        <Header
          view={view}
          onViewChange={setView}
          grafanaResultsHref={grafanaResultsHref}
          onDiscussSimulation={() => {
            setDiscussChatMounted(true);
            setShowDiscuss(true);
          }}
        />
        <BuildView initial={initial} setAlert={setAlert} active={view === 'Build'} />
        {view === 'Run' && <RunView />}
        {view === 'Inspect' && <InspectView />}
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
