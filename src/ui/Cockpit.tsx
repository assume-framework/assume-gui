import {
    FileDownloadOutlined,
    FileUploadOutlined,
    ReplayOutlined,
    SaveOutlined,
    SendOutlined
} from '@mui/icons-material';
import {type ComponentType, type MouseEventHandler, useCallback} from "react";
import {sendData} from "../sendData.ts";
import type {Edge, Node} from "@xyflow/react";
import type {EditSidebarData} from "./SidebarComponents/NodeEditSidebar.tsx";
import type {Forecast} from "./SidebarComponents/UploadSidebar.tsx";

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

    const handleFileUpload = (e: React.InputEvent<HTMLInputElement>) => {
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
        <CockpitElement name={"Submit"} Icon={SendOutlined} onClick={() => sendData(nodes, edges, forecasts)}/>
        <CockpitElement name={"Save"} Icon={SaveOutlined} onClick={save}/>
        <CockpitElement name={"Reset"} Icon={ReplayOutlined} onClick={reset}/>
        <CockpitElement name={"Download"} onClick={download} Icon={FileDownloadOutlined}/>
        <label htmlFor="file_upload" className={"cursor-pointer"}>
            <CockpitElement name={"Upload"} Icon={FileUploadOutlined}/>
        </label>
        <input id="file_upload" type="file" accept=".json" className="hidden" onInput={handleFileUpload}/>
    </>
}

interface ElementArgs {
    name: string,
    onClick?: MouseEventHandler<HTMLDivElement>,
    Icon: ComponentType
}

function CockpitElement({onClick, name, Icon}: ElementArgs) {
    return (
        <div
            className="bg-white cursor-pointer hover:bg-neutral-100 active:bg-neutral-300 border rounded w-full my-2 py-1 px-3 flex"
            onClick={onClick}
        >
            <Icon/>
            <div className="px-3">{name}</div>
        </div>
    )
}
