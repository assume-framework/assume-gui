import { useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { buildGraph, extractLayout } from '../../scenario/model';
import type { GraphLayout, Scenario } from '../../scenario/types';
import { getLayoutedElements } from './autoLayout';

/** What the rest of the app may do with the drawing. */
export interface GraphActions {
  /** Positions and handles as currently drawn. */
  getLayout: () => GraphLayout;
  /** Draws the given scenario instead of the current graph. */
  replaceGraph: (scenario: Scenario) => void;
  /** Arranges all nodes automatically and fits the view. */
  autoArrange: () => void;
}

/**
 * Acts on the graph that `<Graph>` renders. React Flow owns the nodes and edges, so this works
 * anywhere below the `ReactFlowProvider` and the returned functions are stable.
 */
export function useGraphActions(): GraphActions {
  const { getNodes, getEdges, setNodes, setEdges, fitView } = useReactFlow();

  return useMemo(
    () => ({
      getLayout: () => extractLayout(getNodes(), getEdges()),
      replaceGraph: (scenario) => {
        const graph = buildGraph(scenario);
        setNodes(graph.nodes);
        setEdges(graph.edges);
      },
      autoArrange: () => {
        setNodes((nds) => getLayoutedElements(nds, getEdges()));
        window.requestAnimationFrame(() => fitView({ padding: 0.1 }));
      },
    }),
    [getNodes, getEdges, setNodes, setEdges, fitView]
  );
}
