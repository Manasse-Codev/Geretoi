import { useContext } from 'react';
import { InstallPromptContext } from '@/features/install/installContext';

export function useInstallPrompt() {
  const context = useContext(InstallPromptContext);
  if (!context) throw new Error('InstallPromptProvider is missing');
  return context;
}
