import { Menu } from '@mui/material';
import type { ReactNode } from 'react';

interface SubMenuProps {
  /** The menu item the submenu opens next to, `null` while it is closed. */
  anchor: HTMLElement | null;
  onClose: () => void;
  /** The entries, usually `MenuAction`s. */
  children: ReactNode;
}

/** A menu that opens to the right of an item of its parent menu. */
export default function SubMenu({ anchor, onClose, children }: SubMenuProps) {
  return (
    <Menu
      open={anchor !== null}
      anchorEl={anchor}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      disableAutoFocus
      disableRestoreFocus
      hideBackdrop
      disableScrollLock
      disableEnforceFocus
      // Only the panel takes pointer events, so the parent menu stays usable.
      sx={{ pointerEvents: 'none', '& .MuiPaper-root': { pointerEvents: 'auto' } }}
    >
      {children}
    </Menu>
  );
}
