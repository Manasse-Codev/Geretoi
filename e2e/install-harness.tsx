import React from 'react';
import ReactDOM from 'react-dom/client';
import { InstallCard } from '@/features/install/InstallCard';
import { InstallGuideSheet } from '@/features/install/InstallGuideSheet';
import { InstallPromptProvider } from '@/features/install/InstallPromptProvider';
import { InstallToast } from '@/features/install/InstallToast';
import { useInstallPrompt } from '@/features/install/useInstallPrompt';
import '@/styles/globals.css';
import '@/styles/app.css';

export function InstallTestSurface() {
  const install = useInstallPrompt();
  return <div className="app-shell">
    <main className="page-content">
      <h1>DayFlow</h1>
      <button onClick={() => window.dispatchEvent(new Event('dayflow:task-created'))} type="button">Tâche créée</button>
      {install.isInstallAvailable && <button onClick={install.requestInstall} type="button">Réglages : installer</button>}
    </main>
    <nav aria-label="Navigation" className="bottom-nav surface-raised">
      <div className="bottom-nav__tabs"><span aria-hidden="true" className="bottom-nav__indicator" /></div>
      <span className="bottom-nav__add-wrap"><button aria-label="Ajouter" className="bottom-nav__add" type="button">+</button></span>
    </nav>
    {!install.isInstalled && install.showCard && <InstallCard isIOS={install.isIOS} onInstall={install.requestInstall} onLater={install.dismissCard} visible />}
    <InstallGuideSheet isIOS={install.isIOS} isSafari={install.isSafari} onClose={install.closeGuide} open={install.guideOpen} />
    {install.successToast && <InstallToast onDismiss={install.dismissToast} />}
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><InstallPromptProvider><InstallTestSurface /></InstallPromptProvider></React.StrictMode>,
);
