import { SendOutlined } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { sendData, type DataResponse } from '../../api/sendData';
import { useScenario } from '../../scenario/context';
import type { AlertState } from '../types';

interface RunViewProps {
  setAlert: Dispatch<SetStateAction<AlertState>>;
}

export default function RunView({ setAlert }: RunViewProps) {
  const { config, actions } = useScenario();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <main className="min-h-0 grow px-8 py-6">
      <button
        type="button"
        className="flex cursor-pointer items-center rounded-xl border bg-gray-50 px-4 py-2 hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => void submit()}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        <SendOutlined />
        <span className="px-3">Submit</span>
        {isSubmitting && <CircularProgress size={16} thickness={5} color="success" />}
      </button>
    </main>
  );
}
