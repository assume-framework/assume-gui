import dagre from '@dagrejs/dagre';
import type {Edge, Node} from '@xyflow/react';

const NODE_WIDTH = 172;
const NODE_HEIGHT = 52;

export function getLayoutedElements<T extends Record<string, unknown>>(
    nodes: Node<T>[],
    edges: Edge<T>[],
    direction: 'TB' | 'LR' = 'TB'
): Node<T>[] {
    const graph = new dagre.graphlib.Graph();
    graph.setDefaultEdgeLabel(() => ({}));
    graph.setGraph({rankdir: direction, nodesep: 80, ranksep: 100});

    nodes.forEach((node) => {
        graph.setNode(node.id, {
            width: node.measured?.width ?? NODE_WIDTH,
            height: node.measured?.height ?? NODE_HEIGHT,
        });
    });

    edges.forEach((edge) => {
        graph.setEdge(edge.source, edge.target);
    });

    dagre.layout(graph);

    return nodes.map((node) => {
        const {x, y, width, height} = graph.node(node.id);
        return {
            ...node,
            position: {
                x: x - (width ?? NODE_WIDTH) / 2,
                y: y - (height ?? NODE_HEIGHT) / 2,
            },
        };
    });
}
