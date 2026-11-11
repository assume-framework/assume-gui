import { useMemo, useState } from 'react';

import type { AlertState, View } from './components/types';
import { loadScenario } from './scenario/storage';
import { ScenarioContext, useScenarioState } from './scenario/context';
import { useGraphActions } from './components/graph/useGraphActions';
import { serializeScenario } from './scenario/serialization';
import Header from './components/layout/Header';
import BuildView from './components/views/BuildView';
import RunView from './components/views/RunView';
import InspectView from './components/views/InspectView';
import DiscussSimulationChat from './components/chat/DiscussSimulationChat';
import AlertSnackbar from './components/layout/AlertSnackbar';

export default function App() {
  const [initial] = useState(loadScenario);
  // The simulation parameters. This is all the backend gets to see.
  const scenario = useScenarioState(initial.config);
  const { config } = scenario;
  const graphActions = useGraphActions();
  const [alert, setAlert] = useState<AlertState>({ message: '', severity: 'info' });
  const [view, setView] = useState<View>('Build');

  const scenarioJson = useMemo(
    () => serializeScenario({ config, layout: graphActions.getLayout() }),
    [config, graphActions]
  );

  return (
    <ScenarioContext.Provider value={scenario}>
      <div className="flex min-h-0 grow flex-col">
        <AlertSnackbar alert={alert} onClose={() => setAlert({ ...alert, message: '' })} />
        <Header view={view} onViewChange={setView} />
        <div className="flex min-h-0 grow">
          <div className="flex min-h-0 min-w-0 grow flex-col">
            <BuildView initial={initial} setAlert={setAlert} active={view === 'Build'} />
            {view === 'Run' && <RunView setAlert={setAlert} />}
            {view === 'Inspect' && <InspectView />}
          </div>
          <DiscussSimulationChat scenarioJson={scenarioJson} />
        </div>
      </div>
    </ScenarioContext.Provider>
  );
}
