import type { ReactNode } from 'react';

export default function ViewButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        className={`px-2 py-0.5 mx-1 text-xl rounded hover:bg-gray-300 cursor-pointer inline-flex items-center gap-1 ${active ? 'bg-gray-200 font-semibold' : ''}`}
        onClick={onClick}
      >
        {icon}
        {label}
      </button>
    </li>
  );
}
