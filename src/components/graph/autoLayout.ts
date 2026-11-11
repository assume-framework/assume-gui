import dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';

const NODE_WIDTH = 172;
const NODE_HEIGHT = 52;
const NODE_SEP = 80;
const RANK_SEP = 100;
/** Free space between the market side and the unit side. */
const SIDE_GAP = 200;

/** Node types that belong to the market side (left); everything else but the world goes right. */
const MARKET_SIDE = new Set(['marketProvider', 'market', 'marketProduct']);

const sizeOf = (node: Node) => ({
  width: node.measured?.width ?? NODE_WIDTH,
  height: node.measured?.height ?? NODE_HEIGHT,
});

interface Placed {
  /** Top-left positions relative to the top-left corner of the group's bounding box. */
  positions: Map<string, { x: number; y: number }>;
  width: number;
  height: number;
}

/** Lays out one side top-down with dagre. Only edges between nodes of this side count. */
function layoutSide(nodes: Node[], edges: Edge[]): Placed {
  const positions = new Map<string, { x: number; y: number }>();
  if (nodes.length === 0) return { positions, width: 0, height: 0 };

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'TB', nodesep: NODE_SEP, ranksep: RANK_SEP, edgesep: NODE_SEP });
  nodes.forEach((node) => graph.setNode(node.id, sizeOf(node)));
  const ids = new Set(nodes.map((n) => n.id));
  edges
    .filter((e) => ids.has(e.source) && ids.has(e.target))
    .forEach((e) => graph.setEdge(e.source, e.target));
  dagre.layout(graph);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  nodes.forEach((node) => {
    const { x, y, width, height } = graph.node(node.id);
    const left = x - width / 2;
    const top = y - height / 2;
    positions.set(node.id, { x: left, y: top });
    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, left + width);
    maxY = Math.max(maxY, top + height);
  });
  positions.forEach((p) => {
    p.x -= minX;
    p.y -= minY;
  });
  return { positions, width: maxX - minX, height: maxY - minY };
}

/**
 * Arranges the graph as a tree with the world on top, the market side (providers, markets,
 * products) to its left and the unit side (operators, units) to its right. Edges between the two
 * sides (unit-market) do not influence the layering, they just run across the gap.
 */
export function getLayoutedElements<T extends Record<string, unknown>>(
  nodes: Node<T>[],
  edges: Edge<T>[]
): Node<T>[] {
  const world = nodes.filter((n) => n.type === 'world');
  const left = nodes.filter((n) => n.type && MARKET_SIDE.has(n.type));
  const right = nodes.filter((n) => n.type !== 'world' && !(n.type && MARKET_SIDE.has(n.type)));

  const leftPlaced = layoutSide(left, edges);
  const rightPlaced = layoutSide(right, edges);

  // Row of world nodes (normally exactly one) centred above the gap.
  const worldHeight = Math.max(0, ...world.map((n) => sizeOf(n).height));
  const sidesTop = world.length > 0 ? worldHeight + RANK_SEP : 0;

  const result = new Map<string, { x: number; y: number }>();
  leftPlaced.positions.forEach((p, id) =>
    result.set(id, { x: p.x - leftPlaced.width - SIDE_GAP / 2, y: p.y + sidesTop })
  );
  rightPlaced.positions.forEach((p, id) =>
    result.set(id, { x: p.x + SIDE_GAP / 2, y: p.y + sidesTop })
  );

  const worldTotal =
    world.reduce((sum, n) => sum + sizeOf(n).width, 0) + NODE_SEP * (world.length - 1);
  let worldX = -worldTotal / 2;
  world.forEach((n) => {
    result.set(n.id, { x: worldX, y: 0 });
    worldX += sizeOf(n).width + NODE_SEP;
  });

  return nodes.map((node) => ({ ...node, position: result.get(node.id) ?? node.position }));
}
