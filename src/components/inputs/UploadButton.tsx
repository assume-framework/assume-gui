import {
  CheckCircleOutlined,
  Clear,
  PublishOutlined,
  UploadFileOutlined,
} from '@mui/icons-material';
import { Alert, Snackbar } from '@mui/material';
import { uploadFile } from '../../api/sendData';
import { type ChangeEvent, useId, useState } from 'react';

// Browsers (notably on Windows) do not always report `text/csv` for .csv files.
const isCsv = (file: File) => file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');

interface UploadButtonProps {
  name: string;
  uploaded: boolean;
  tooltip?: string;
  setDocumentID: (value: string) => void;
}

export default function UploadButton({
  name,
  uploaded,
  tooltip,
  setDocumentID,
}: UploadButtonProps) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const set = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (isCsv(selected)) {
      setError('');
      setFile(selected);
      return;
    }
    setError('Not a CSV file');
    setFile(null);
  };

  const upload = async () => {
    if (!file) return;
    try {
      const documentId = await uploadFile(file);
      setDocumentID(documentId);
    } catch (e) {
      setError('Error uploading file');
      console.error(e);
    }
  };

  const clearForecast = () => {
    setFile(null);
    setDocumentID('');
  };

  let color = 'bg-green-200';
  if (!uploaded) {
    color = file ? 'bg-green-50' : 'bg-gray-50';
  }

  return (
    <div className={'px-2 flex flex-grow border rounded-xl ' + color}>
      <label className="flex py-2 flex-grow" title={tooltip} htmlFor={id}>
        {uploaded ? <CheckCircleOutlined /> : <UploadFileOutlined />}
        <div className="pl-3">{name}</div>
      </label>
      <input
        title={tooltip}
        className="hidden"
        accept=".csv,text/csv"
        id={id}
        type="file"
        onChange={set}
      />
      {!!file && !uploaded && (
        <button type="button" className="ml-auto pr-3 cursor-pointer" onClick={upload}>
          <PublishOutlined />
        </button>
      )}
      {uploaded && (
        <div className="ml-auto pr-3 py-2">
          <button type="button" className="cursor-pointer" onClick={clearForecast}>
            <Clear />
          </button>
        </div>
      )}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setError('')}
      >
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}
