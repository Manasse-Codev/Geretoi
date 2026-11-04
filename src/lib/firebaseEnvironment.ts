export const requiredFirebaseVariables = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export function missingFirebaseVariables(env: Record<string, string | undefined>): string[] {
  return requiredFirebaseVariables.filter((name) => !env[name]?.trim());
}

export function shouldUseFirebaseEmulators({
  dev,
  mode,
  enabled,
}: {
  dev: boolean;
  mode: string;
  enabled: string | undefined;
}): boolean {
  return (dev || mode === 'test') && mode !== 'production' && enabled === 'true';
}
