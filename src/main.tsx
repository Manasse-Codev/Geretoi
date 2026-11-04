import React from 'react';
import ReactDOM from 'react-dom/client';
import { PwaRuntime } from '@/app/PwaRuntime';
import '@/styles/globals.css';
import '@/styles/app.css';
import { missingFirebaseVariables } from '@/lib/firebaseEnvironment';
import { ConfigurationError } from '@/app/ConfigurationError';

const missingFirebaseConfig = import.meta.env.PROD
  ? missingFirebaseVariables(import.meta.env)
  : [];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {missingFirebaseConfig.length > 0 ? <ConfigurationError missingVariables={missingFirebaseConfig} /> : <PwaRuntime />}
  </React.StrictMode>,
);
