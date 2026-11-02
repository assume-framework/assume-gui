import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './Home';
import { ReactFlowProvider } from '@xyflow/react';
import { DnDProvider } from './DragDropCtx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactFlowProvider>
      <DnDProvider>
        <Home />
      </DnDProvider>
    </ReactFlowProvider>
  </StrictMode>
);
