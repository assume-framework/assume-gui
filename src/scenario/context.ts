import { createContext, useContext, useMemo, useState } from 'react';
import {
  addConfigEdge,
  addConfigNode,
  clearChangedIssues,
  removeFromConfig,
  updateConfigData,
} from './model';
import type { ConfigData, ConfigEdge, ConfigNode, Forecast, Issues, ScenarioConfig } from './types';

/** Everything that changes the scenario. The functions are what components may call. */
export interface ScenarioActions {
  /** Sets the parameters of one node or edge and drops the issues that this fixes. */
  updateValue: (id: string, data: ConfigData, isEdge: boolean) => void;
  updateForecast: (type: keyof Forecast, value: string | null) => void;
  addNode: (node: ConfigNode) => void;
  /** Adds an edge, unless it exists already. */
  addEdge: (edge: ConfigEdge) => void;
  removeEntities: (nodeIds: string[], edgeIds: string[]) => void;
  /** Replaces the whole configuration (load, reset) and clears all issues. */
  replaceConfig: (config: ScenarioConfig) => void;
  setIssues: (issues: Issues) => void;
}

export interface ScenarioContextValue {
  config: ScenarioConfig;
  issues: Issues;
  actions: ScenarioActions;
}

export interface ItemView {
  data: ConfigData;
  hasError: boolean;
}

interface State {
  config: ScenarioConfig;
  issues: Issues;
}

/**
 * Gives components access to the scenario configuration and the actions to change it, so React
 * Flow only has to store the graph (ids, types, positions) and not a second copy of the parameters.
 */
export const ScenarioContext = createContext<ScenarioContextValue | null>(null);

const MISSING: ConfigData = { name: '' };

/** Parameters and validation state of a node or an edge. */
export function useItemView(id: string, isEdge: boolean): ItemView {
  const ctx = useScenario();
  const item = isEdge ? ctx.config.edges[id] : ctx.config.nodes[id];
  return { data: item?.data ?? MISSING, hasError: (ctx.issues[id]?.length ?? 0) > 0 };
}

export function useScenario(): ScenarioContextValue {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error('useScenario must be used inside a ScenarioContext provider');
  return ctx;
}

/**
 * Owns the scenario configuration and its validation issues. Provide the result as context.
 *
 * Config and issues live in one state object so that an update can derive the new issues from the
 * previous config without reading stale values, which keeps all actions stable.
 */
export function useScenarioState(initial: ScenarioConfig): ScenarioContextValue {
  const [state, setState] = useState<State>({ config: initial, issues: {} });

  const actions = useMemo<ScenarioActions>(
    () => ({
      updateValue: (id, data, isEdge) =>
        setState(({ config, issues }) => {
          const before = (isEdge ? config.edges[id] : config.nodes[id])?.data;
          return {
            config: updateConfigData(config, id, isEdge, data),
            issues: clearChangedIssues(issues, id, before, data),
          };
        }),
      updateForecast: (type, value) =>
        setState((s) => ({
          ...s,
          config: { ...s.config, forecasts: { ...s.config.forecasts, [type]: value } },
        })),
      addNode: (node) => setState((s) => ({ ...s, config: addConfigNode(s.config, node) })),
      addEdge: (edge) =>
        setState((s) =>
          s.config.edges[edge.id] ? s : { ...s, config: addConfigEdge(s.config, edge) }
        ),
      removeEntities: (nodeIds, edgeIds) => {
        if (nodeIds.length === 0 && edgeIds.length === 0) return;
        setState((s) => ({
          ...s,
          config: removeFromConfig(s.config, new Set(nodeIds), new Set(edgeIds)),
        }));
      },
      replaceConfig: (config) => setState({ config, issues: {} }),
      setIssues: (issues) => setState((s) => ({ ...s, issues })),
    }),
    []
  );

  return useMemo(() => ({ config: state.config, issues: state.issues, actions }), [state, actions]);
}
