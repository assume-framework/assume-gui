import { BaseEdge, EdgeLabelRenderer, getSimpleBezierPath, type EdgeProps } from '@xyflow/react';
import { useItemView } from '../scenario/context';
import { UNIT_MARKET_STRATEGY_LABELS } from './UnitMarketStrategies';

export function UnitMarketEdge({ id, sourceX, sourceY, targetX, targetY, selected }: EdgeProps) {
  const { data, hasError } = useItemView(id, true);
  const [edgePath, labelX, labelY] = getSimpleBezierPath({ sourceX, sourceY, targetX, targetY });
  const borderColor = hasError ? 'border-red-400' : 'border-stone-300';
  const selectedStrategy = data.strategy || undefined;
  const label = selectedStrategy
    ? (UNIT_MARKET_STRATEGY_LABELS[selectedStrategy] ?? selectedStrategy)
    : 'Select strategy';
  return (
    <>
      <BaseEdge path={edgePath} id={id} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className={`nodrag nopan absolute px-1.5 py-0.5 shadow rounded bg-white border text-[10px] ${borderColor} ${
            selected ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
          }`}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
