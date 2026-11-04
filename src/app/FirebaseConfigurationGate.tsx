import type { ReactNode } from 'react';
import { ConfigurationError } from '@/app/ConfigurationError';
import { missingFirebaseVariables } from '@/lib/firebaseEnvironment';

type FirebaseConfigurationGateProps = {
  env: Record<string, string | undefined>;
  isProduction: boolean;
  children: ReactNode;
};

export function FirebaseConfigurationGate({ env, isProduction, children }: FirebaseConfigurationGateProps) {
  const missingVariables = isProduction ? missingFirebaseVariables(env) : [];
  return missingVariables.length > 0 ? <ConfigurationError missingVariables={missingVariables} /> : children;
}
