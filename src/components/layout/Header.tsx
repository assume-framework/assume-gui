import { Construction, PlayArrow, Search } from '@mui/icons-material';
import type { View } from '../types';
import ViewButton from './ViewButton';

export default function Header({
  view,
  onViewChange,
}: {
  view: View;
  onViewChange: (view: View) => void;
}) {
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
    </header>
  );
}
