import { BaseEdge, EdgeLabelRenderer, getSimpleBezierPath, type Edge, type EdgeProps } from "@xyflow/react";
import type { EditSidebarData } from "./NodeEditSidebar";

export function UnitMarketEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps<Edge<EditSidebarData>>) {
    const [edgePath, labelX, labelY] = getSimpleBezierPath({ sourceX, sourceY, targetX, targetY });

    return <>
        <BaseEdge path={edgePath} id={id} />;
        <EdgeLabelRenderer>
            <div
                style={{
                    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                }}
                className="nodrag nopan absolute px-1 py-0.5 shadow-md rounded-md bg-white border-2 border-stone-400"
            >
                {data?.name}
            </div>
        </EdgeLabelRenderer>
    </>
}
