/** Pure functions on the scenario model. No React, no browser APIs except `crypto.randomUUID`. */
import type { Edge, Node } from '@xyflow/react';
import { initialWorld } from '../utils';
import {
  type ConfigData,
  type ConfigEdge,
  type ConfigNode,
  type GraphLayout,
  type Issues,
  type Scenario,
  type ScenarioConfig,
} from './types';

export const WORLD_ID = 'world';

export function edgeId(
  source: string,
  sourceHandle: string | null | undefined,
  target: string,
  targetHandle: string | null | undefined
): string {
  return `${source}#${sourceHandle}#${target}#${targetHandle}`;
}

export function createInitialScenario(): Scenario {
  return {
    config: {
      nodes: { [WORLD_ID]: { id: WORLD_ID, type: 'world', data: initialWorld() } },
      edges: {},
      forecasts: { price: null, residual_load: null },
    },
    layout: { nodes: { [WORLD_ID]: { x: 300, y: 0 } }, edges: {} },
  };
}

// --- config edits --------------------------------------------------------------------------

export function addConfigNode(config: ScenarioConfig, node: ConfigNode): ScenarioConfig {
  return { ...config, nodes: { ...config.nodes, [node.id]: node } };
}

export function addConfigEdge(config: ScenarioConfig, edge: ConfigEdge): ScenarioConfig {
  return { ...config, edges: { ...config.edges, [edge.id]: edge } };
}

export function updateConfigData(
  config: ScenarioConfig,
  id: string,
  isEdge: boolean,
  data: ConfigData
): ScenarioConfig {
  if (isEdge) {
    const edge = config.edges[id];
    return edge ? { ...config, edges: { ...config.edges, [id]: { ...edge, data } } } : config;
  }
  const node = config.nodes[id];
  return node ? { ...config, nodes: { ...config.nodes, [id]: { ...node, data } } } : config;
}

/** Removes the given nodes and edges, and every edge that is left dangling. */
export function removeFromConfig(
  config: ScenarioConfig,
  nodeIds: ReadonlySet<string>,
  edgeIds: ReadonlySet<string>
): ScenarioConfig {
  if (nodeIds.size === 0 && edgeIds.size === 0) return config;
  const nodes = Object.fromEntries(Object.entries(config.nodes).filter(([id]) => !nodeIds.has(id)));
  const edges = Object.fromEntries(
    Object.entries(config.edges).filter(
      ([id, e]) => !edgeIds.has(id) && !nodeIds.has(e.source) && !nodeIds.has(e.target)
    )
  );
  return { ...config, nodes, edges };
}

/** Drops the issues of fields whose value changed, they are stale now. */
export function clearChangedIssues(
  issues: Issues,
  id: string,
  before: ConfigData | undefined,
  after: ConfigData
): Issues {
  const current = issues[id];
  if (!current) return issues;
  const remaining = current.filter((issue) => before?.[issue.field] === after[issue.field]);
  if (remaining.length === current.length) return issues;
  const others = Object.fromEntries(Object.entries(issues).filter(([key]) => key !== id));
  return remaining.length > 0 ? { ...others, [id]: remaining } : others;
}

// --- backend payload -----------------------------------------------------------------------

/**
 * The request body of `POST /api/submit`. Contains nothing about the graph drawing: positions and
 * handles are not part of the simulation.
 */
export function toRequestPayload(config: ScenarioConfig) {
  return {
    nodes: Object.values(config.nodes).map(({ id, type, data }) => ({ id, type, data })),
    edges: Object.values(config.edges).map(({ id, type, data }) => ({ id, type, data })),
    forecasts: config.forecasts,
  };
}

// --- config <-> React Flow -----------------------------------------------------------------

/**
 * React Flow nodes and edges for a scenario. They carry only what React Flow needs to draw and
 * move things around. Parameters are not copied into `data`, node components read them from the
 * scenario context instead (see `context.ts`), so there is a single source of truth.
 */
export function buildGraph({ config, layout }: Scenario): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = Object.values(config.nodes).map((n) => ({
    id: n.id,
    type: n.type,
    position: layout.nodes[n.id] ?? { x: 0, y: 0 },
    data: {},
    ...(n.id === WORLD_ID ? { deletable: false } : {}),
  }));
  const edges: Edge[] = Object.values(config.edges).map((e) => ({
    id: e.id,
    type: e.type,
    source: e.source,
    target: e.target,
    sourceHandle: layout.edges[e.id]?.sourceHandle,
    targetHandle: layout.edges[e.id]?.targetHandle,
    data: {},
  }));
  return { nodes, edges };
}

export function extractLayout(nodes: Node[], edges: Edge[]): GraphLayout {
  return {
    nodes: Object.fromEntries(nodes.map((n) => [n.id, { x: n.position.x, y: n.position.y }])),
    edges: Object.fromEntries(
      edges.map((e) => [e.id, { sourceHandle: e.sourceHandle, targetHandle: e.targetHandle }])
    ),
  };
}
