'use client';
import { createContext, ReactNode, SetStateAction, useState } from 'react';


import { Dispatch } from 'react';

const DnDContext = createContext<[string, Dispatch<SetStateAction<string>>]>(['', (_) => {}]);

export default DnDContext;

export const DnDProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState('');

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
}
