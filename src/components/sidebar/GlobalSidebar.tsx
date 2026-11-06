import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { useReactFlow, type Edge, type Node } from '@xyflow/react';
import UploadButton from '../inputs/UploadButton';
import Cockpit from './Cockpit';
import { createInitialScenario, buildGraph, extractLayout } from '../../scenario/model';
import { parseScenarioFile, serializeScenario } from '../../scenario/serialization';
import { STORAGE_KEY } from '../../scenario/storage';
import type { AlertState } from '../types';
import type { Forecast, Issues, Scenario, ScenarioConfig } from '../../scenario/types';
import { sendData, type DataResponse } from '../../api/sendData';
import { getLayoutedElements } from '../graph/autoLayout';

export type GlobalSidebarProps = {
  config: ScenarioConfig;
  nodes: Node[];
  edges: Edge[];
  setConfig: Dispatch<SetStateAction<ScenarioConfig>>;
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setIssues: Dispatch<SetStateAction<Issues>>;
  setAlert: Dispatch<SetStateAction<AlertState>>;
  clearSelection: () => void;
};

export default function GlobalSidebar({
  config,
  nodes,
  edges,
  setConfig,
  setNodes,
  setEdges,
  setIssues,
  setAlert,
  clearSelection,
}: GlobalSidebarProps) {
  const { fitView } = useReactFlow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const forecast = config.forecasts;

  const updateForecast = (type: keyof Forecast, value: string | null) => {
    setConfig((c) => ({ ...c, forecasts: { ...c.forecasts, [type]: value } }));
  };

  const setDocumentID = (type: keyof Forecast) => (value: string | null) => {
    updateForecast(type, value);
  };

  const applyScenario = useCallback(
    (scenario: Scenario) => {
      const graph = buildGraph(scenario);
      setConfig(scenario.config);
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setIssues({});
      clearSelection();
    },
    [setConfig, setNodes, setEdges, setIssues, clearSelection]
  );

  /** The scenario as it is saved and downloaded: config and layout side by side. */
  const currentScenario = (): Scenario => ({ config, layout: extractLayout(nodes, edges) });

  const reset = () => {
    if (!confirm('Are you sure you want to reset the flow? This action cannot be undone.')) {
      return;
    }
    applyScenario(createInitialScenario());
    localStorage.removeItem(STORAGE_KEY);
    setAlert({ message: 'Flow reset successfully', severity: 'success' });
  };

  const submit = async () => {
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
  };

  const setFlowByJson = (data: string) => {
    try {
      applyScenario(parseScenarioFile(data));
    } catch (e) {
      setAlert({
        message: e instanceof Error ? e.message : 'Could not read the file',
        severity: 'error',
      });
    }
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, serializeScenario(currentScenario()));
    setAlert({ message: 'Flow saved successfully', severity: 'success' });
  };

  const autoArrange = () => {
    setNodes((nds) => getLayoutedElements(nds, edges));
    window.requestAnimationFrame(() => fitView({ padding: 0.1 }));
  };

  const download = () => {
    const blob = serializeScenario(currentScenario());
    const href = URL.createObjectURL(new Blob([blob], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = href;
    link.download = `simulation-${Date.now().toString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="px-8 pt-6 pb-8 mb-4">
        <p>Forecasts</p>
        <div className="my-4">
          <UploadButton
            name={'Price'}
            uploaded={!!forecast.price}
            setDocumentID={setDocumentID('price')}
          />
        </div>
        <div className="my-4">
          <UploadButton
            name={'Residual load'}
            uploaded={!!forecast.residual_load}
            setDocumentID={setDocumentID('residual_load')}
          />
        </div>
      </div>
      <div className="mt-auto border-t border-gray-300 px-8 py-4">
        <Cockpit
          submit={submit}
          processing={isSubmitting}
          reset={reset}
          save={save}
          download={download}
          setFlowByJson={setFlowByJson}
          autoArrange={autoArrange}
        />
      </div>
    </div>
  );
}
