import { useContext } from 'react';
import { DnDContext } from '../../DragDropContext';

function DraggableNode({ type, name }: { type: string; name: string }) {
  const [, setType] = useContext(DnDContext);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="py-3 border-2 border-stone-400 rounded-md font-bold my-5 flex justify-center cursor-grab touch-none bg-white active:cursor-grabbing"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      {name}
    </div>
  );
}

export default function SelectSidebar() {
  return (
    <>
      <div className="px-4 pt-4 pb-6 mb-2 text-sm">
        <div className="mb-4">Drag nodes into the canvas.</div>
        <DraggableNode type={'marketProvider'} name={'Market Provider Node'} />
        <DraggableNode type={'market'} name={'Market Node'} />
        <DraggableNode type={'marketProduct'} name={'Market Product Node'} />
        <div className="h-2" />
        <DraggableNode type={'unitOperator'} name={'Unit Operator Node'} />
        <DraggableNode type={'unit'} name={'Unit Node'} />
      </div>
    </>
  );
}
