import { useId, useState } from 'react';
import UploadButton from './UploadButton.tsx';
import { HelpOutline, ToggleOffOutlined, ToggleOnOutlined } from '@mui/icons-material';
import type { BaseProps } from './types.ts';

export function InputOrUpload({ onChange, errorMessage, value, label, tooltip }: BaseProps) {
  const hasFile = /^[\da-f]{8}-[\da-f]{4}-[0-9a-f]{4}-[\da-f]{4}-[\da-f]{12}$/.test(value); // UUID regex
  const [upload, setUpload] = useState(hasFile);
  const toggleUpload = () => setUpload(!upload);
  const id = useId();
  const color = errorMessage ? 'text-red-500' : 'text-gray-700';

  return (
    <div className="my-4">
      <label className={`block text-sm font-bold mt-2 ${color}`}>{label}</label>
      <div className="flex flex-grow">
        {upload ? (
          <div className="w-50">
            <UploadButton
              name="Upload a file"
              uploaded={hasFile}
              tooltip={tooltip}
              setDocumentID={onChange}
            />
          </div>
        ) : (
          <div className="w-50">
            <input
              type="number"
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              title={tooltip}
              className="shadow text-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-neutral-100"
            />
          </div>
        )}
        <div className="flex items-center px-2">
          <button type="button" className="cursor-pointer" onClick={toggleUpload}>
            {upload ? <ToggleOnOutlined /> : <ToggleOffOutlined />}
          </button>
        </div>
        {tooltip && (
          <div title={tooltip} className="py-2 pl-3 cursor-help">
            <HelpOutline />
          </div>
        )}
      </div>
    </div>
  );
}
