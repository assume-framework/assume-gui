import {
  AccountTreeOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
  ReplayOutlined,
  SaveOutlined,
  SendOutlined,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { type ChangeEvent, type ComponentType, type MouseEventHandler } from 'react';

type Args = {
  reset: () => void;
  setFlowByJson: (data: string) => void;
  submit?: () => void;
  processing?: boolean;
  save?: () => void;
  download?: () => void;
  autoArrange?: () => void;
};

export default function Cockpit({
  reset,
  setFlowByJson,
  submit,
  processing = false,
  save,
  download,
  autoArrange,
}: Args) {
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
      <CockpitElement name={'Auto Arrange'} onClick={autoArrange} Icon={AccountTreeOutlined} />
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
        <span className="px-3">Upload</span>
      </label>
    </>
  );
}

const cockpitItemClasses = (disabled: boolean) =>
  `bg-white border rounded w-full my-2 py-1 px-3 flex items-center ${
    disabled
      ? 'cursor-not-allowed opacity-60'
      : 'cursor-pointer hover:bg-neutral-100 active:bg-neutral-300'
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
      <span className="px-3">{name}</span>
      {processing && <CircularProgress size={16} thickness={5} color="success" />}
    </button>
  );
}
