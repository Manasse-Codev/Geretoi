import React from 'react';
import ReactDOM from 'react-dom/client';
import { PwaRuntime } from '@/app/PwaRuntime';
import { FirebaseConfigurationGate } from '@/app/FirebaseConfigurationGate';
import '@/styles/globals.css';
import '@/styles/app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseConfigurationGate env={import.meta.env} isProduction={import.meta.env.PROD}>
      <PwaRuntime />
    </FirebaseConfigurationGate>
  </React.StrictMode>,
);
