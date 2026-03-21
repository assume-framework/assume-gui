import EditSidebar, {type EditSidebarData, type EditSidebarProps} from "./SidebarComponents/NodeEditSidebar.tsx";
import SelectSidebar from "./SidebarComponents/NodeSelectSidebar.tsx";
import UploadSidebar, {type Forecast} from "./SidebarComponents/UploadSidebar.tsx";

interface SidebarProps {
    nodeData: EditSidebarProps | null,
    updateForecast: (type: keyof Forecast, value: string | null) => void,
    updateValue: (id: string, data: EditSidebarData, isEdge: boolean) => void,
    forecast: Forecast
}

export default function Sidebar({nodeData, updateForecast, updateValue, forecast}: SidebarProps) {
    return (
        <aside className="w-full h-full max-w-xs border-r border-gray-300 overflow-y-auto">
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
                    <UploadSidebar updateForecast={updateForecast} forecast={forecast}/>
                </>
            }
        </aside>
    )
}