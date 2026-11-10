import {
  FileDownloadOutlined,
  FileUploadOutlined,
  ReplayOutlined,
  SaveOutlined,
  SendOutlined,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { type ChangeEvent, type ComponentType, type MouseEventHandler } from 'react';

export type CockpitProps = {
  reset: () => void;
  setFlowByJson: (data: string) => void;
  submit?: () => void;
  processing?: boolean;
  save?: () => void;
  download?: () => void;
};

export default function Cockpit({
  reset,
  setFlowByJson,
  submit,
  processing = false,
  save,
  download,
}: CockpitProps) {
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      console.warn('No input provided!');
      return;
    }

    try {
      setFlowByJson(await file.text());
    } finally {
      // Reset so that selecting the same file again triggers onChange.
      input.value = '';
    }
  };

  return (
    <>
      <CockpitElement
        name={'Submit'}
        Icon={SendOutlined}
        processing={processing}
        onClick={submit}
      />
      <CockpitElement name={'Save'} Icon={SaveOutlined} onClick={save} />
      <CockpitElement name={'Reset'} Icon={ReplayOutlined} onClick={reset} />
      <CockpitElement name={'Download'} onClick={download} Icon={FileDownloadOutlined} />
      {/* Visually hidden (not display:none) so the input stays keyboard-focusable. */}
      <input
        id="file_upload"
        type="file"
        accept=".json"
        className="peer sr-only"
        onChange={handleFileUpload}
      />
      <label
        htmlFor="file_upload"
        className={`${cockpitItemClasses(false)} peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400`}
      >
        <FileUploadOutlined />
        <span className="pl-3">Upload</span>
      </label>
    </>
  );
}

const cockpitItemClasses = (disabled: boolean) =>
  `bg-gray-50 border rounded-xl w-full my-2 py-2 px-2 flex items-center ${
    disabled
      ? 'cursor-not-allowed opacity-60'
      : 'cursor-pointer hover:bg-gray-100 active:bg-gray-200'
  }`;

interface ElementArgs {
  name: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  Icon: ComponentType;
  processing?: boolean;
}

function CockpitElement({ onClick, name, Icon, processing = false }: ElementArgs) {
  return (
    <button
      type="button"
      className={cockpitItemClasses(processing)}
      onClick={onClick}
      disabled={processing}
      aria-busy={processing}
    >
      <Icon />
      <span className="pl-3">{name}</span>
      {processing && <CircularProgress size={16} thickness={5} color="success" />}
    </button>
  );
}
