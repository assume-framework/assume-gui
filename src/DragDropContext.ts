import { createContext, type Dispatch, type SetStateAction } from 'react';

/**
 * Holds the node type that is currently being dragged from the sidebar.
 * Lives in its own file (without components) so React Fast Refresh keeps working.
 */
export const DnDContext = createContext<[string, Dispatch<SetStateAction<string>>]>(['', () => {}]);
