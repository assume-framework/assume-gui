import { useContext } from 'react';
import { DnDContext } from '../../DragDropCtx';

function Node({ type, name }: { type: string; name: string }) {
  const [, setType] = useContext(DnDContext);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="py-3 border-2 border-stone-400 rounded-md font-bold my-5 flex justify-center cursor-grab touch-none background-white text-s active:cursor-grabbing"
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
        <Node type={'marketProvider'} name={'Market Provider Node'} />
        <Node type={'market'} name={'Market Node'} />
        <Node type={'marketProduct'} name={'Market Product Node'} />
        <div className="h-2" />
        <Node type={'unitOperator'} name={'Unit Operator Node'} />
        <Node type={'unit'} name={'Unit Node'} />
      </div>
    </>
  );
}
