import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FirebaseConfigurationGate } from '@/app/FirebaseConfigurationGate';

const completeRequiredConfig = {
  VITE_FIREBASE_API_KEY: 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'example-project',
  VITE_FIREBASE_APP_ID: '1:123:web:abc',
};

describe('FirebaseConfigurationGate', () => {
  afterEach(cleanup);

  it('affiche l’application lorsque seules les variables obligatoires sont fournies', () => {
    render(
      <FirebaseConfigurationGate env={completeRequiredConfig} isProduction>
        <p>Application chargée</p>
      </FirebaseConfigurationGate>,
    );

    expect(screen.getByText('Application chargée')).not.toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('affiche l’écran de configuration avec le nom de chaque variable obligatoire absente', () => {
    const { container } = render(
      <FirebaseConfigurationGate env={{ ...completeRequiredConfig, VITE_FIREBASE_API_KEY: '' }} isProduction>
        <p>Application chargée</p>
      </FirebaseConfigurationGate>,
    );

    expect(screen.getByRole('heading', { name: 'Configuration manquante' })).not.toBeNull();
    expect(screen.getByText('VITE_FIREBASE_API_KEY')).not.toBeNull();
    expect(screen.queryByText('Application chargée')).toBeNull();
    expect(container.textContent).not.toContain('test-api-key');
  });
});
