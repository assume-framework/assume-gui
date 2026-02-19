import type {Node, Edge} from "@xyflow/react";
import type {Forecast} from "./ui/SidebarComponents/UploadSidebar.tsx";

export async function sendData(nodes: Node[], edges: Edge[], forecasts: Forecast) {
    const n = nodes.map(n => ({id: n.id, type: n.type, data: n.data}));
    const e = edges.map(e => ({id: e.id, type: e.type, data: e.data}));

    try {
        const resp = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({nodes: n, edges: e, forecasts: forecasts}),
        })
        if (!resp.ok) {
            const msg = await resp.json()
            console.error("Received status code:", resp.status);
            console.error(msg.detail);
        }
    } catch (e) {
        console.error("Error when trying to submit data: ", e);
    }
}

export async function uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const result = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    })
    const body = await result.json()
    return body['id']
}
