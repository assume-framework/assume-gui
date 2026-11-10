import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import Graph, { type Selection } from '../graph/Graph';
import Sidebar from '../sidebar/Sidebar';
import type { EditSidebarProps } from '../sidebar/NodeEditSidebar';
import { useScenario } from '../../scenario/context';
import type { Scenario } from '../../scenario/types';
import type { AlertState } from '../types';

interface BuildViewProps {
  /** Drawn on first render only; afterwards React Flow owns nodes and edges. */
  initial: Scenario;
  setAlert: Dispatch<SetStateAction<AlertState>>;
  /** Inactive views stay mounted (hidden) so React Flow keeps its nodes. */
  active: boolean;
}

export default function BuildView({ initial, setAlert, active }: BuildViewProps) {
  const { config, issues } = useScenario();
  const [selection, setSelection] = useState<Selection | null>(null);

  const nodeData = useMemo((): EditSidebarProps | null => {
    if (!selection) return null;
    const item = selection.isEdge ? config.edges[selection.id] : config.nodes[selection.id];
    return item
      ? { id: item.id, type: item.type, data: item.data, isEdge: selection.isEdge }
      : null;
  }, [selection, config]);

  const stopEditView = useCallback(() => setSelection(null), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        stopEditView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopEditView]);

  return (
    <div className={active ? 'flex min-h-0 grow' : 'hidden'}>
      <Sidebar
        nodeData={nodeData}
        issues={nodeData ? (issues[nodeData.id] ?? []) : []}
        setAlert={setAlert}
        clearSelection={stopEditView}
      />
      <Graph
        initial={initial}
        setSelection={setSelection}
        setAlert={setAlert}
        onPaneClick={stopEditView}
      />
    </div>
  );
}
