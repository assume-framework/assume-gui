import {
  BaseEdge,
  EdgeLabelRenderer,
  getSimpleBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react';
import type { EditSidebarData } from './SidebarComponents/NodeEditSidebar';
import { UNIT_MARKET_STRATEGY_LABELS } from './UnitMarketStrategies';

export function UnitMarketEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps<Edge<EditSidebarData>>) {
  const [edgePath, labelX, labelY] = getSimpleBezierPath({ sourceX, sourceY, targetX, targetY });
  const border_color = data?.errorField == '' ? 'border-stone-300' : 'border-red-400';
  const selectedStrategy = typeof data?.strategy === 'string' ? data.strategy : undefined;
  const label = selectedStrategy
    ? (UNIT_MARKET_STRATEGY_LABELS[selectedStrategy] ?? selectedStrategy)
    : 'Select strategy';
  return (
    <>
      <BaseEdge path={edgePath} id={id} />;
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className={`nodrag nopan absolute px-1.5 py-0.5 shadow rounded bg-white border text-[10px] ${border_color} ${
            selected ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
          }`}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
