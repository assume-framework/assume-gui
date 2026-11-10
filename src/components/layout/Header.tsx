import { Construction, PlayArrow, Search } from '@mui/icons-material';
import type { View } from '../types';
import ViewButton from './ViewButton';

export default function Header({
  view,
  onViewChange,
  onDiscussSimulation,
}: {
  view: View;
  onViewChange: (view: View) => void;
  onDiscussSimulation?: () => void;
}) {
  const headerClasses = 'px-2 py-0.5 mx-1 text-xl rounded hover:bg-gray-300 cursor-pointer';

  return (
    <header className="py-0.5 px-2 flex justify-between items-center border-b-1 border-gray-300">
      <div className="flex items-center gap-3">
        <a href="/">
          <img src="/assume_logo.png" alt="ASSUME Logo" className="w-14" />
        </a>
        <nav aria-label="Views">
          <ul className="flex items-center">
            <ViewButton
              icon={<Construction fontSize="small" />}
              label="Build"
              active={view === 'Build'}
              onClick={() => onViewChange('Build')}
            />
            <ViewButton
              icon={<PlayArrow fontSize="small" />}
              label="Run"
              active={view === 'Run'}
              onClick={() => onViewChange('Run')}
            />
            <ViewButton
              icon={<Search fontSize="small" />}
              label="Inspect"
              active={view === 'Inspect'}
              onClick={() => onViewChange('Inspect')}
            />
          </ul>
        </nav>
      </div>
      <nav>
        <ul className="flex items-center">
          <li>
            <button type="button" className={headerClasses} onClick={onDiscussSimulation}>
              Discuss Simulation
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
