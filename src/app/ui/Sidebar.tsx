import { useContext } from "react";
import { DnDContext } from "../DragDropCtx";

export default function Sidebar() {
    const [type, setType] = useContext(DnDContext);
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        setType(nodeType)
        console.log("drag start", nodeType, type)
        event.dataTransfer.effectAllowed = "move";
    }

    return (
        <aside>
            <div className="description">You can drag these nodes to the pane on the right.</div>
            <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'world')} draggable>
                World Node
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'unit')} draggable>
                Unit Node
            </div>
            <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'market')} draggable>
                Market Node
            </div>
        </aside>
    )
}