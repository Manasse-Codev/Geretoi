import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfigurationError } from '@/app/ConfigurationError';

describe('ConfigurationError', () => {
  it('affiche les noms manquants sans afficher de valeurs de configuration', () => {
    render(<ConfigurationError missingVariables={['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN']} />);

    expect(screen.getByRole('alert')).not.toBeNull();
    expect(screen.getByText('VITE_FIREBASE_API_KEY')).not.toBeNull();
    expect(screen.getByText('VITE_FIREBASE_AUTH_DOMAIN')).not.toBeNull();
    expect(screen.queryByText(/AIza|firebaseapp\.com/)).toBeNull();
  });
});
