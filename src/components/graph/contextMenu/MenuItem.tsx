import { ListItemIcon, ListItemText, MenuItem as Item, type MenuItemProps as ItemProps } from '@mui/material';
import type { ReactNode } from 'react';

interface MenuItemProps extends Omit<ItemProps, 'children'> {
  icon?: ReactNode;
  label: string;
  /** Shown at the right end, e.g. a chevron for items that open a submenu. */
  trailing?: ReactNode;
}

/**
 * One row of a context menu. Extra props are passed on to the `MenuItem`, because the surrounding
 * `Menu` injects focus props into its direct children.
 */
export default function MenuItem({ icon, label, trailing, ...props }: MenuItemProps) {
  return (
    <Item {...props}>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText>{label}</ListItemText>
      {trailing}
    </Item>
  );
}
