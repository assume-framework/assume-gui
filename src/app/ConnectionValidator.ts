import { Connection } from "@xyflow/react";

export function isValidConnection(connection: Connection): boolean {
    const { source, sourceHandle, target, targetHandle } = connection;

    return target.split("_")[0] == sourceHandle?.split("_")[0]
}