import { classNames, type BaseProps } from './types';
import { useId } from 'react';
import { HelpOutline } from '@mui/icons-material';

interface SelectProperties extends BaseProps {
  children: React.ReactNode;
}

export default function Select({
  value,
  label,
  onChange,
  errorMessage,
  tooltip,
  disabled = false,
  required = false,
  children,
}: SelectProperties) {
  const id = useId();
  const color = errorMessage ? 'text-red-500' : 'text-gray-700';
  return (
    <div>
      <label htmlFor={id} className={`block text-sm font-bold mt-2 ${color}`}>
        {label}
      </label>
      <div className="flex items-center">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={classNames}
        >
          <option disabled selected value="">
            -- select an option --
          </option>
          {children}
        </select>
        {tooltip && (
          <div title={tooltip} className="py-2 pl-3 shrink-0">
            <HelpOutline />
          </div>
        )}
      </div>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    </div>
  );
}
