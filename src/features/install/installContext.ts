import { createContext } from 'react';

export interface InstallPromptContextValue {
  isIOS: boolean;
  isSafari: boolean;
  isInstalled: boolean;
  isInstallAvailable: boolean;
  showCard: boolean;
  guideOpen: boolean;
  successToast: boolean;
  requestInstall: () => void;
  dismissCard: () => void;
  closeGuide: () => void;
  dismissToast: () => void;
}

export const InstallPromptContext = createContext<InstallPromptContextValue | null>(null);
