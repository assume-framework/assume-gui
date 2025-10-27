'use client';
import { createContext, type ReactNode, type SetStateAction, useState } from 'react';


import type { Dispatch } from 'react';

const DnDContext = createContext<[string, Dispatch<SetStateAction<string>>]>(['', () => {}]);

export { DnDContext };

export const DnDProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState('');

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
}
