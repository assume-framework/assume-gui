import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Footer from './components/layout/Footer';
import { ReactFlowProvider } from '@xyflow/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactFlowProvider>
      <div className="flex h-full flex-col">
        <App />
        <Footer />
      </div>
    </ReactFlowProvider>
  </StrictMode>
);
