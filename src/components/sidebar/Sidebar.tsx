import EditSidebar, { type EditSidebarProps } from './NodeEditSidebar';
import GlobalSidebar, { type GlobalSidebarProps } from './GlobalSidebar';
import { useScenario } from '../../scenario/context';
import { CloseOutlined } from '@mui/icons-material';
import type { ConfigIssue } from '../../scenario/types';

interface SidebarProps extends Omit<GlobalSidebarProps, 'clearSelection'> {
  nodeData: EditSidebarProps | null;
  /** Validation issues of the item shown in the editor. */
  issues: ConfigIssue[];
  close: () => void;
}

export default function Sidebar({ nodeData, issues, close, ...global }: SidebarProps) {
  const { updateValue } = useScenario().actions;
  return (
    <aside className="w-full h-full max-w-xs border-r border-gray-300 flex flex-col select-none">
      <div className="grow min-h-0 overflow-y-auto">
        {nodeData ? (
          <>
            <div>
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="float-right m-5 cursor-pointer"
              >
                <CloseOutlined />
              </button>
            </div>
            <EditSidebar
              id={nodeData.id}
              type={nodeData.type}
              data={nodeData.data}
              updateNodeValue={updateValue}
              issues={issues}
            />
          </>
        ) : (
          <GlobalSidebar {...global} clearSelection={close} />
        )}
      </div>
    </aside>
  );
}
