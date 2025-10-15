import type { Node, Edge } from "@xyflow/react";

export default async (nodes: Node[], edges: Edge[]) => {
    const n = nodes.map(n => ({ id: n.id, type: n.type, data: n.data }));
    const e = edges.map(e => ({ id: e.id, type: e.type, data: e.data }));

    try {
        await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nodes: n, edges: e }),
        })
    } catch (error) {
        console.error("Error sending data:", error);
    }

}
