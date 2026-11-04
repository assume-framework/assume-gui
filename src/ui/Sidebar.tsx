import EditSidebar, { type EditSidebarProps } from './SidebarComponents/NodeEditSidebar';
import SelectSidebar from './SidebarComponents/NodeSelectSidebar';
import UploadSidebar, { type Forecast } from './SidebarComponents/UploadSidebar';
import { CloseOutlined } from '@mui/icons-material';
import type { ConfigData, ConfigIssue } from '../scenario/types';

interface SidebarProps {
  nodeData: EditSidebarProps | null;
  /** Validation issues of the item shown in the editor. */
  issues: ConfigIssue[];
  updateForecast: (type: keyof Forecast, value: string | null) => void;
  updateValue: (id: string, data: ConfigData, isEdge: boolean) => void;
  forecast: Forecast;
  close: () => void;
}

export default function Sidebar({
  nodeData,
  issues,
  updateForecast,
  updateValue,
  forecast,
  close,
}: SidebarProps) {
  return (
    <aside className="w-full h-full max-w-xs border-r border-gray-300 overflow-y-auto select-none">
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
        <>
          <SelectSidebar />
          <UploadSidebar updateForecast={updateForecast} forecast={forecast} />
        </>
      )}
    </aside>
  );
}
