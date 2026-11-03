import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '@/features/auth/LoginPage';

const authActions = vi.hoisted(() => ({
  signIn: vi.fn(),
  register: vi.fn(),
  signInGoogle: vi.fn(),
  clearError: vi.fn(),
}));

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => ({
    ...authActions,
    user: null,
    loading: false,
    error: null,
    errorMessage: null,
    signOut: vi.fn(),
  }),
}));

function submitLoginForm() {
  const button = screen.getByRole('button', { name: 'Se connecter' });
  const form = button.closest('form');
  if (!form) throw new Error('Formulaire de connexion introuvable.');
  fireEvent.submit(form);
}

describe('LoginPage', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    authActions.signIn.mockReset().mockResolvedValue(undefined);
    authActions.register.mockReset().mockResolvedValue(undefined);
    authActions.signInGoogle.mockReset().mockResolvedValue(undefined);
    authActions.clearError.mockReset();
  });

  it('annonce une adresse invalide et un mot de passe trop court en français', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Adresse e-mail' }), { target: { value: 'incorrect' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: '123' } });
    submitLoginForm();
    expect(await screen.findByText('Saisissez une adresse e-mail valide.')).toBeTruthy();
    expect((screen.getByLabelText('Adresse e-mail') as HTMLInputElement).getAttribute('aria-invalid')).toBe('true');

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'jour@example.fr' } });
    submitLoginForm();
    expect(await screen.findByText('Le mot de passe doit contenir au moins 6 caractères.')).toBeTruthy();
  });

  it('envoie les identifiants valides au service Firebase', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'jour@example.fr' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'secret123' } });
    submitLoginForm();
    await waitFor(() => expect(authActions.signIn).toHaveBeenCalledWith('jour@example.fr', 'secret123'));
  });

  it('permet de basculer vers la création de compte', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Créer un compte' }));
    expect(screen.getByRole('heading', { name: 'Créer votre compte' })).toBeTruthy();
  });
});
