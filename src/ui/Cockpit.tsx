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
import type {EditSidebarData} from "./NodeEditSidebar.tsx";
import type {ForecastFile} from "./NodeSelectSidebar.tsx";

const buttonStyle = 'bg-white hover:bg-neutral-100 active:bg-neutral-300 border rounded w-full my-2 py-1 px-1 flex justify-center'

type Args = {
    nodes: Node<EditSidebarData>[]
    edges: Edge<EditSidebarData>[]
    forecasts: ForecastFile[]
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
        <div className={buttonStyle}>
            <label htmlFor="file_upload">
                <FileUploadOutlined/>
                <span>Upload</span>
            </label>
            <input id="file_upload" type="file" accept=".json" className="hidden" onInput={handleFileUpload}/>
        </div>
        <button className={buttonStyle} onClick={download}>
            <FileDownloadOutlined/>
            <span>Download</span>
        </button>
        <button className={buttonStyle} onClick={() => sendData(nodes, edges, forecasts)}>
            <SendOutlined/>
            <span>Submit</span>
        </button>
        <button className={buttonStyle} onClick={save}>
            <SaveOutlined/>
            <span>Save</span>
        </button>
        <button className={buttonStyle} onClick={reset}>
            <ReplayOutlined/>
            <span>Reset</span>
        </button>
    </>

}
