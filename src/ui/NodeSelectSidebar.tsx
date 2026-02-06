import {useContext, useState} from "react";
import {DnDContext} from "../DragDropCtx";
import './NodeSelectSidebar.css';
import {uploadFile} from "../sendData";

export interface ForecastFile {
    type: string
    identifier: string
}

export type SelectSidebarProps = {
    updateForecast: (id: string, type: string) => void
}

export default function SelectSidebar({updateForecast}: SelectSidebarProps) {
    const [, setType] = useContext(DnDContext);
    const [file, setFile] = useState<File | null>(null);
    const [forecastType, setForecastType] = useState<string | null>(null);

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        setType(nodeType)
        event.dataTransfer.effectAllowed = "move";
    }
    const addFile = (forecast_type: string)=> (e: React.ChangeEvent<HTMLInputElement>)=>{
        if (e.target.files) {
            setForecastType(forecast_type)
            setFile(e.target.files[0])
        }
    }

    const uploadForecast = () => {
        if (!file) return;
        if (!forecastType) return;
        uploadFile(file).then((id) => {
            updateForecast(id, forecastType)
        })
    }

    return (
        <aside className="w-full h-full max-w-xs border-r border-gray-300">
            <div className="px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">You can drag these nodes to the pane on the right.</div>
                <div className="dndnode" onDragStart={(event) => onDragStart(event, 'unit')} draggable>
                    Unit Node
                </div>
                <div className="dndnode" onDragStart={(event) => onDragStart(event, 'unitOperator')} draggable>
                    Unit Operator Node
                </div>
                <div className="dndnode" onDragStart={(event) => onDragStart(event, 'market')} draggable>
                    Market Node
                </div>
                <div className="dndnode" onDragStart={(event) => onDragStart(event, 'marketProvider')} draggable>
                    Market Provider Node
                </div>
                <div className="dndnode" onDragStart={(event) => onDragStart(event, 'marketProduct')} draggable>
                    Market Product Node
                </div>
            </div>
            <div className="px-8 pt-6 pb-8 mb-4">
                <div className="my-4">
                    <label>Price forecast</label>
                    <input type={"file"} onChange={addFile("price")}/>
                    {file && <button onClick={uploadForecast}>
                      Upload
                    </button>}
                </div>
                <div className="my-4">
                    <label>Residual load forecast</label>
                    <input type={"file"} onChange={addFile("residual_load")}/>
                    {file && <button onClick={uploadForecast}>
                      Upload
                    </button>}
                </div>
            </div>
        </aside>
    )
}
