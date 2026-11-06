import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './Home';
import { ReactFlowProvider } from '@xyflow/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactFlowProvider>
      <Home />
    </ReactFlowProvider>
  </StrictMode>
);
