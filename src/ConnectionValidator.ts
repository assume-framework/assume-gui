import type { Connection, Edge } from "@xyflow/react";

export function isValidConnection(connection: Connection | Edge): boolean {
    const { source, target, sourceHandle, targetHandle } = connection;

    return targetHandle?.split("_")[0] == source?.split("_")[0] && sourceHandle?.split("_")[0] === target?.split("_")[0]; ;
}
