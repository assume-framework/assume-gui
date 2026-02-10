import {
    FileUploadOutlined,
    SaveOutlined,
    SendOutlined,
    ReplayOutlined,
    FileDownloadOutlined
} from '@mui/icons-material';
import {useCallback} from "react";
import {sendData} from "../sendData.ts";
import type {Node, Edge} from "@xyflow/react";
import type {EditSidebarData} from "./SidebarComponents/NodeEditSidebar.tsx";
import type {Forecast} from "./SidebarComponents/UploadSidebar.tsx";

const buttonStyle = 'bg-white cursor-pointer hover:bg-neutral-100 active:bg-neutral-300 border rounded w-full my-2 py-1 px-3 flex justify-center'

type Args = {
    nodes: Node<EditSidebarData>[]
    edges: Edge<EditSidebarData>[]
    forecasts: Forecast
    reset: () => void
    setFlowByJson: (data: string) => void
}

export default function Cockpit({nodes, edges, forecasts, reset, setFlowByJson}: Args) {
    const save = useCallback(() => {
        localStorage.setItem('flow', JSON.stringify({"nodes": nodes, "edges": edges, "forecasts": forecasts}));
    }, [nodes, edges, forecasts]);

    const handleFileUpload = (e: React.FormEvent<HTMLInputElement>) => {
        const inputElement = e.target as HTMLInputElement
        if (!inputElement.files || inputElement.files.length == 0) {
            console.warn("No input provided!")
            return;
        }

        const reader: FileReader = new FileReader();
        reader.readAsText(inputElement.files[0], `UTF-8`);
        reader.onload = (event) => {
            const data = event.target?.result
            setFlowByJson(data as string)
        }
    }

    const download = useCallback(() => {
        const blob = JSON.stringify({"nodes": nodes, "edges": edges});
        const href = URL.createObjectURL(new Blob([blob], {type: 'application/json'}));
        const link = document.createElement('a');
        link.href = href;
        link.download = `simulation-${Date.now().toString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [nodes, edges])

    return <>
        <label htmlFor="file_upload" className={"cursor-pointer"}>
            <div className={buttonStyle}>
                <div className="w-13"><FileUploadOutlined/></div>
                <div className="flex-1 pl-3">Upload</div>
                <div className="flex-1"/>
            </div>
        </label>
        <input id="file_upload" type="file" accept=".json" className="hidden" onInput={handleFileUpload}/>

        <div className={buttonStyle} onClick={download}>
            <div className="w-13"><FileDownloadOutlined/></div>
            <div className="flex-1 pl-3">Download</div>
            <div className="flex-1"/>
        </div>
        <div className={buttonStyle} onClick={() => sendData(nodes, edges, forecasts)}>
            <div className="w-13"><SendOutlined/></div>
            <div className="flex-1 pl-3">Submit</div>
            <div className="flex-1"/>

        </div>
        <div className={buttonStyle} onClick={save}>
            <div className="w-13"><SaveOutlined/></div>
            <div className="flex-1 pl-3">Save</div>
            <div className="flex-1"/>

        </div>
        <div className={buttonStyle} onClick={reset}>
            <div className="w-13"><ReplayOutlined/></div>
            <div className="flex-1 pl-3">Reset</div>
            <div className="flex-1"/>
        </div>
    </>

}
