import EditSidebar, {type EditSidebarData, type EditSidebarProps} from "./SidebarComponents/NodeEditSidebar.tsx";
import SelectSidebar from "./SidebarComponents/NodeSelectSidebar.tsx";
import UploadSidebar from "./SidebarComponents/UploadSidebar.tsx";

interface SidebarProps {
    nodeData: EditSidebarProps | null,
    onForecastUpload: (id: string, type: string) => void,
    updateValue: (id: string, data: EditSidebarData, isEdge: boolean) => void,
    updateForecast?: (id: string, type: string) => void
}

export default function Sidebar({nodeData, onForecastUpload, updateValue}: SidebarProps) {
    return (
        <aside className="w-full h-full max-w-xs border-r border-gray-300 overflow-y-scroll">
            {nodeData ?
                <EditSidebar
                    id={nodeData.id}
                    type={nodeData.type}
                    data={nodeData.data}
                    updateNodeValue={updateValue}
                />
                :
                <>
                    <SelectSidebar/>
                    <UploadSidebar updateForecast={onForecastUpload}/>
                </>
            }
        </aside>
    )
}