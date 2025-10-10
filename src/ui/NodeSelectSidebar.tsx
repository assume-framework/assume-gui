import { useContext } from "react";
import { DnDContext } from "../DragDropCtx";
import './NodeSelectSidebar.css';

export default function SelectSidebar(  ) {
    const [ ,setType] = useContext(DnDContext);
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        setType(nodeType)
        event.dataTransfer.effectAllowed = "move";
    }

    return (
        <aside id="nodeSelect">
            <div className="description">You can drag these nodes to the pane on the right.</div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'unit')} draggable>
                Unit Node
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'unitOperator')} draggable>
                Unit Operator Node
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'market')} draggable>
                Market Node
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'marketProvider')} draggable>
                Market Provider Node
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'marketProduct')} draggable>
                Market Product Node
            </div>
        </aside>
    )
}
