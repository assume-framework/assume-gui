import {
  AccountTreeOutlined,
  AddCircleOutline,
  ChevronRight,
  DeleteOutline,
} from '@mui/icons-material';
import { Divider, Menu } from '@mui/material';
import { useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import MenuItem from './MenuItem.tsx';
import SubMenu from './SubMenu.tsx';
import type { ContextMenuState } from './types.ts';
import { useGraphActions } from '../useGraphActions.ts';

export type { ContextMenuState };

interface GraphContextMenuProps {
  menu: ContextMenuState | null;
  onClose: () => void;
  /** Adds a node of the given type at the given flow position. */
  onAddNode: (nodeType: string, position: { x: number; y: number }) => void;
}

/** Right-click menu of the graph: add node / rearrange on the canvas, delete on a node or edge. */
export default function GraphContextMenu({ menu, onClose, onAddNode }: GraphContextMenuProps) {
  const { screenToFlowPosition, deleteElements } = useReactFlow();
  const { autoArrange } = useGraphActions();
  // Keep rendering the last menu while it fades out, otherwise its items change during the close.
  const [shown, setShown] = useState(menu);
  if (menu && menu !== shown) setShown(menu);
  const [addAnchor, setAddAnchor] = useState<HTMLElement | null>(null);

  const close = () => {
    setAddAnchor(null);
    onClose();
  };

  const addNode = (nodeType: string) => {
    if (menu) onAddNode(nodeType, screenToFlowPosition({ x: menu.x, y: menu.y }));
    close();
  };

  const target = shown?.target;

  return (
    <>
      <Menu
        open={menu !== null}
        onClose={close}
        anchorReference="anchorPosition"
        anchorPosition={shown ? { top: shown.y, left: shown.x } : undefined}
        // No backdrop: clicks reach the graph, which closes the menu on a left click and moves it
        // on the next right click. Only the panel takes pointer events.
        hideBackdrop
        disableScrollLock
        disableEnforceFocus
        sx={{ pointerEvents: 'none', '& .MuiPaper-root': { pointerEvents: 'auto' } }}
      >
        {target ? (
          <MenuItem
            icon={<DeleteOutline fontSize="small" />}
            label={`Delete ${target.isEdge ? 'edge' : 'node'}`}
            disabled={!target.deletable}
            onClick={() => {
              close();
              void deleteElements(
                target.isEdge ? { edges: [{ id: target.id }] } : { nodes: [{ id: target.id }] }
              );
            }}
          />
        ) : (
          <MenuItem
            icon={<AddCircleOutline fontSize="small" />}
            label="Add"
            trailing={<ChevronRight fontSize="small" />}
            selected={addAnchor !== null}
            onClick={(e) => setAddAnchor(e.currentTarget)}
            onMouseEnter={(e) => setAddAnchor(e.currentTarget)}
          />
        )}
        {!target && <Divider />}
        {!target && (
          <MenuItem
            icon={<AccountTreeOutlined fontSize="small" />}
            label="Rearrange"
            onMouseEnter={() => setAddAnchor(null)}
            onClick={() => {
              close();
              autoArrange();
            }}
          />
        )}
      </Menu>
      <SubMenu anchor={addAnchor} onClose={() => setAddAnchor(null)}>
        <MenuItem label="Unit operator" onClick={() => addNode('unitOperator')} />
        <MenuItem label="Unit" onClick={() => addNode('unit')} />
        <MenuItem label="Market provider" onClick={() => addNode('marketProvider')} />
        <MenuItem label="Market" onClick={() => addNode('market')} />
        <MenuItem label="Market product" onClick={() => addNode('marketProduct')} />
      </SubMenu>
    </>
  );
}
