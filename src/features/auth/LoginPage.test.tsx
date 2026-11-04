import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '@/features/auth/LoginPage';

const authState = vi.hoisted(() => ({ user: null as { uid: string } | null }));
const authActions = vi.hoisted(() => ({
  signIn: vi.fn(),
  register: vi.fn(),
  resetPassword: vi.fn(),
  continueAnonymously: vi.fn(),
  clearError: vi.fn(),
}));

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => ({
    ...authActions,
    user: authState.user,
    loading: false,
    error: null,
    errorMessage: null,
  }),
}));

describe('LoginPage', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    authState.user = null;
    Object.values(authActions).forEach((action) => action.mockReset());
    authActions.signIn.mockResolvedValue(undefined);
    authActions.register.mockResolvedValue(undefined);
    authActions.resetPassword.mockResolvedValue(undefined);
    authActions.continueAnonymously.mockResolvedValue(undefined);
  });

  it('valide le mot de passe avant la connexion', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByText('Le mot de passe doit contenir au moins 6 caractères.')).toBeTruthy();
    expect(authActions.signIn).not.toHaveBeenCalled();
  });

  it('se connecte avec une adresse et un mot de passe valides', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    await waitFor(() => expect(authActions.signIn).toHaveBeenCalledWith('test@example.com', 'secret1'));
  });

  it('permet de créer un compte', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Créer un compte' }));
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer mon compte' }));
    await waitFor(() => expect(authActions.register).toHaveBeenCalledWith('new@example.com', 'secret1'));
  });

  it('demande la réinitialisation du mot de passe', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Mot de passe oublié ?' }));
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer le lien' }));
    await waitFor(() => expect(authActions.resetPassword).toHaveBeenCalledWith('test@example.com'));
  });

  it('affiche et masque le mot de passe', () => {
    render(<LoginPage />);
    const password = screen.getByLabelText('Mot de passe');
    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(password).toHaveAttribute('type', 'text');
  });
});
