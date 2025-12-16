import type {Node, Edge} from "@xyflow/react";

async function sendData(nodes: Node[], edges: Edge[]) {
    const n = nodes.map(n => ({id: n.id, type: n.type, data: n.data}));
    const e = edges.map(e => ({id: e.id, type: e.type, data: e.data}));

    try {
        const resp = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({nodes: n, edges: e}),
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

export default sendData;
