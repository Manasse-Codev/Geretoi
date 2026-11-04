import React from 'react';
import ReactDOM from 'react-dom/client';
import { PwaRuntime } from '@/app/PwaRuntime';
import '@/styles/globals.css';
import '@/styles/app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PwaRuntime />
  </React.StrictMode>,
);
