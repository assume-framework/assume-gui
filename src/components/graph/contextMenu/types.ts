/** The node or edge a context menu was opened on. */
export interface MenuTarget {
  id: string;
  isEdge: boolean;
  deletable: boolean;
}

export interface ContextMenuState {
  /** Screen position of the click. */
  x: number;
  y: number;
  /** Element under the cursor, `null` on the empty canvas. */
  target: MenuTarget | null;
}
