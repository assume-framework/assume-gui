import { type ReactNode, useState } from 'react';
import { DnDContext } from './DragDropContext';

export const DnDProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState('');

  return <DnDContext.Provider value={[type, setType]}>{children}</DnDContext.Provider>;
};
