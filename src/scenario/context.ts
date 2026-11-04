import { createContext, useContext } from 'react';
import type { ConfigData, Issues, ScenarioConfig } from './types';

export interface ScenarioContextValue {
  config: ScenarioConfig;
  issues: Issues;
}

/**
 * Gives node and edge components access to the scenario configuration, so React Flow only has to
 * store the graph (ids, types, positions) and not a second copy of the parameters.
 */
export const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export interface ItemView {
  data: ConfigData;
  hasError: boolean;
}

const MISSING: ConfigData = { name: '' };

/** Parameters and validation state of a node or an edge. */
export function useItemView(id: string, isEdge: boolean): ItemView {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error('useItemView must be used inside a ScenarioContext provider');
  const item = isEdge ? ctx.config.edges[id] : ctx.config.nodes[id];
  return { data: item?.data ?? MISSING, hasError: (ctx.issues[id]?.length ?? 0) > 0 };
}
