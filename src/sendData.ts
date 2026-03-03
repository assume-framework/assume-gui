import type {Node, Edge} from "@xyflow/react";
import type {Forecast} from "./ui/SidebarComponents/UploadSidebar.tsx";

export interface DataResponse {
    success: boolean
    id?: string
    field?: string
    message?: string
}

export async function sendData(nodes: Node[], edges: Edge[], forecasts: Forecast): Promise<DataResponse> {
    const n = nodes.map(n => ({id: n.id, type: n.type, data: n.data}));
    const e = edges.map(e => ({id: e.id, type: e.type, data: e.data}));
    const resp = await fetch('/api/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({nodes: n, edges: e, forecasts: forecasts}),
    })
    if (resp.ok) {
        return {success: true}
    }
    const msg = await resp.json()
    return {success: false, id: msg.detail.id, field: msg.detail.field, message: msg.detail.message??msg.detail}
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
