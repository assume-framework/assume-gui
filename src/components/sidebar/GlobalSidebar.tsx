import { useState, type Dispatch, type SetStateAction } from 'react';
import UploadButton from '../inputs/UploadButton';
import Cockpit from './Cockpit';
import { useGraphActions } from '../graph/useGraphActions';
import { useScenario } from '../../scenario/context';
import { createInitialScenario } from '../../scenario/model';
import { parseScenarioFile, serializeScenario } from '../../scenario/serialization';
import { STORAGE_KEY } from '../../scenario/storage';
import type { AlertState } from '../types';
import type { Forecast, Scenario } from '../../scenario/types';
import { sendData, type DataResponse } from '../../api/sendData';

export type GlobalSidebarProps = {
  setAlert: Dispatch<SetStateAction<AlertState>>;
  clearSelection: () => void;
};

export default function GlobalSidebar({ setAlert, clearSelection }: GlobalSidebarProps) {
  const { config, actions } = useScenario();
  const graph = useGraphActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const forecast = config.forecasts;

  const setDocumentID = (type: keyof Forecast) => (value: string | null) => {
    actions.updateForecast(type, value);
  };

  const applyScenario = (scenario: Scenario) => {
    actions.replaceConfig(scenario.config);
    graph.replaceGraph(scenario);
    clearSelection();
  };

  /** The scenario as it is saved and downloaded: config and layout side by side. */
  const currentScenario = (): Scenario => ({ config, layout: graph.getLayout() });

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
    actions.setIssues({});
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
        actions.setIssues({
          [response.id]: [{ field: response.field, message: response.message }],
        });
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
        />
      </div>
    </div>
  );
}
