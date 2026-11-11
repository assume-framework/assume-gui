/**
 * Scenario model.
 *
 * A scenario is split into two independent parts:
 *
 * - {@link ScenarioConfig}: *what* is simulated. Entities, their parameters and how they are
 *   connected. This is the only part that is sent to the backend.
 * - {@link GraphLayout}: *how it is drawn*. Node positions and edge handles. Purely cosmetic, it
 *   never leaves the browser.
 *
 * Transient UI state (selection, validation issues, measured node sizes) lives in neither.
 */
/** Ids of the uploaded forecast documents, if any. */
export interface Forecast {
  price: string | null;
  residual_load: string | null;
}

/** Editable parameters of one entity. Values are strings, exactly as the user typed them. */
export interface ConfigData {
  name: string;
  [key: string]: string;
}

export interface ConfigNode {
  id: string;
  type: string;
  data: ConfigData;
}

/**
 * A connection between two entities. The backend reads source and target from the edge id
 * (`<source>#<sourceHandle>#<target>#<targetHandle>`), see {@link edgeId}.
 */
export interface ConfigEdge {
  id: string;
  type: string;
  source: string;
  target: string;
  data: ConfigData;
}

export interface ScenarioConfig {
  nodes: Record<string, ConfigNode>;
  edges: Record<string, ConfigEdge>;
  forecasts: Forecast;
}

export interface EdgeHandles {
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface GraphLayout {
  nodes: Record<string, { x: number; y: number }>;
  edges: Record<string, EdgeHandles>;
}

export interface Scenario {
  config: ScenarioConfig;
  layout: GraphLayout;
}

export const SCENARIO_FORMAT = 'assume-gui/scenario';

/** What is stored in `localStorage` and in downloaded files. */
export interface ScenarioFile extends Scenario {
  format: typeof SCENARIO_FORMAT;
  version: 1;
}

/** A problem with one field of an entity, reported by validation. */
export interface ConfigIssue {
  field: string;
  message: string;
}

/** Validation issues by node or edge id. */
export type Issues = Record<string, ConfigIssue[]>;
