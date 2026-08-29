import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Plano Raiz é uma identidade só-escura -- aplica antes do primeiro paint,
// inclusive na landing page (que roda antes de qualquer estado de tema existir).
document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
