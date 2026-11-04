/** Reading and writing scenario files. */
import { WORLD_ID } from './model';
import {
  SCENARIO_FORMAT,
  type ConfigData,
  type ConfigEdge,
  type ConfigNode,
  type GraphLayout,
  type Scenario,
  type ScenarioFile,
} from './types';
import type { Forecast } from '../ui/SidebarComponents/UploadSidebar';

/**
 * A scenario file as far as it can be trusted before validation: any member may be missing, and
 * the values are only checked at runtime. Everything below narrows this into the real types.
 */
interface RawScenarioFile {
  format?: string;
  version?: number;
  config?: {
    nodes?: Record<string, { type?: string; data?: Record<string, string> }>;
    edges?: Record<
      string,
      { type?: string; source?: string; target?: string; data?: Record<string, string> }
    >;
    forecasts?: Partial<Forecast>;
  };
  layout?: {
    nodes?: Record<string, { x?: number; y?: number }>;
    edges?: Record<string, { sourceHandle?: string | null; targetHandle?: string | null }>;
  };
}

function parseData(raw: Record<string, string> | undefined): ConfigData {
  const data: ConfigData = { name: '' };
  for (const [key, value] of Object.entries(raw ?? {})) {
    if (typeof value === 'string') data[key] = value;
  }
  return data;
}

function requireString(value: string | undefined, what: string): string {
  if (typeof value !== 'string' || value === '') {
    throw new Error(`Invalid scenario file: ${what} is missing`);
  }
  return value;
}

function parseForecasts(raw: Partial<Forecast> | undefined): Forecast {
  return {
    price: typeof raw?.price === 'string' ? raw.price : null,
    residual_load: typeof raw?.residual_load === 'string' ? raw.residual_load : null,
  };
}

function parseLayout(raw: RawScenarioFile['layout']): GraphLayout {
  const layout: GraphLayout = { nodes: {}, edges: {} };
  for (const [id, p] of Object.entries(raw?.nodes ?? {})) {
    if (typeof p?.x === 'number' && typeof p.y === 'number') {
      layout.nodes[id] = { x: p.x, y: p.y };
    }
  }
  for (const [id, h] of Object.entries(raw?.edges ?? {})) {
    layout.edges[id] = {
      sourceHandle: typeof h?.sourceHandle === 'string' ? h.sourceHandle : null,
      targetHandle: typeof h?.targetHandle === 'string' ? h.targetHandle : null,
    };
  }
  return layout;
}

function parseScenario(raw: RawScenarioFile): Scenario {
  const config = raw.config;
  if (!config?.nodes || !config.edges) {
    throw new Error('Invalid scenario file: "config" needs "nodes" and "edges"');
  }
  const nodes: Record<string, ConfigNode> = {};
  for (const [id, n] of Object.entries(config.nodes)) {
    nodes[id] = {
      id,
      type: requireString(n?.type, `type of node ${id}`),
      data: parseData(n.data),
    };
  }
  if (!nodes[WORLD_ID]) {
    throw new Error('Invalid scenario file: the world node is missing');
  }
  const edges: Record<string, ConfigEdge> = {};
  for (const [id, e] of Object.entries(config.edges)) {
    edges[id] = {
      id,
      type: requireString(e?.type, `type of edge ${id}`),
      source: requireString(e.source, `source of edge ${id}`),
      target: requireString(e.target, `target of edge ${id}`),
      data: parseData(e.data),
    };
  }
  return {
    config: { nodes, edges, forecasts: parseForecasts(config.forecasts) },
    layout: parseLayout(raw.layout),
  };
}

/** Parses a scenario file. Older `{nodes, edges}` files must be converted first. */
export function parseScenarioFile(text: string): Scenario {
  let raw: RawScenarioFile | null;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Invalid scenario file: not valid JSON');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('Invalid scenario file: expected a JSON object');
  }
  if (raw.format !== SCENARIO_FORMAT) {
    throw new Error(
      'Invalid scenario file: unknown format. Files from older versions can be converted with scripts/convert_flow.py'
    );
  }
  if (raw.version !== 1) {
    throw new Error(`Unsupported scenario file version: ${String(raw.version)}`);
  }
  return parseScenario(raw);
}

export function serializeScenario({ config, layout }: Scenario): string {
  const file: ScenarioFile = { format: SCENARIO_FORMAT, version: 1, config, layout };
  return JSON.stringify(file);
}
