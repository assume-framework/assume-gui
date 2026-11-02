import EditSidebar, {
  type EditSidebarData,
  type EditSidebarProps,
} from './SidebarComponents/NodeEditSidebar';
import SelectSidebar from './SidebarComponents/NodeSelectSidebar';
import UploadSidebar, { type Forecast } from './SidebarComponents/UploadSidebar';
import { CloseOutlined } from '@mui/icons-material';

interface SidebarProps {
  nodeData: EditSidebarProps | null;
  updateForecast: (type: keyof Forecast, value: string | null) => void;
  updateValue: (id: string, data: EditSidebarData, isEdge: boolean) => void;
  forecast: Forecast;
  close: () => void;
}

export default function Sidebar({
  nodeData,
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
