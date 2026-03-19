import type {Node, Edge} from "@xyflow/react";
import type {Forecast} from "./ui/SidebarComponents/UploadSidebar.tsx";

export interface DataResponse {
    success: boolean
    id?: string
    field?: string
    message?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function asNonEmptyString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function getErrorDetail(body: unknown): unknown {
    if (!isRecord(body)) {
        return body;
    }
    return 'detail' in body ? body.detail : body;
}

function parseErrorResponse(resp: Response, body: unknown): DataResponse {
    const detail = getErrorDetail(body);

    if (isRecord(detail)) {
        const id = asNonEmptyString(detail.id);
        const field = asNonEmptyString(detail.field);
        const message = asNonEmptyString(detail.message);
        return {
            success: false,
            id,
            field,
            message: message ?? `Request failed (${resp.status} ${resp.statusText})`,
        };
    }

    const message = asNonEmptyString(detail);
    return {success: false, message: message ?? `Request failed (${resp.status} ${resp.statusText})`};
}

export async function sendData(nodes: Node[], edges: Edge[], forecasts: Forecast): Promise<DataResponse> {
    const n = nodes.map(n => ({id: n.id, type: n.type, data: n.data}));
    const e = edges.map(e => ({id: e.id, type: e.type, data: e.data}));
    let resp: Response;
    try {
        resp = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({nodes: n, edges: e, forecasts: forecasts}),
        });
    } catch {
        return {success: false, message: 'Could not reach the server. Please check that the backend is running and try again.'};
    }
    if (resp.ok) {
        return {success: true}
    }
    let body: unknown;
    try {
        body = await resp.json();
    } catch {
        body = await resp.text();
    }
    return parseErrorResponse(resp, body);
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
