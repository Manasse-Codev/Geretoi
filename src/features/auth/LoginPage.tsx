import { useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, Globe2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Logo } from '@/components/Logo';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/features/auth/useAuth';
import type { AuthErrorCode } from '@/features/auth/authTypes';
import { fr } from '@/i18n/fr';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(email: string, password: string): AuthErrorCode | null {
  if (!emailPattern.test(email.trim())) return 'invalidEmail';
  if (password.length < 6) return 'weakPassword';
  return null;
}

export function LoginPage() {
  const { signIn, register, signInGoogle, error, errorMessage, clearError } = useAuth();
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const activeError = localError ?? error;
  const message = localError ? fr.auth.errors[localError] : errorMessage;
  const emailError = activeError === 'invalidEmail' ? message ?? undefined : undefined;
  const passwordError = activeError === 'weakPassword' ? message ?? undefined : undefined;
  const fieldError = emailError !== undefined || passwordError !== undefined;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    const validationError = validateCredentials(email, password);
    setLocalError(validationError);
    if (validationError) return;

    setSubmitting(true);
    await (creatingAccount ? register(email.trim(), password) : signIn(email.trim(), password));
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    clearError();
    setLocalError(null);
    setGoogleSubmitting(true);
    await signInGoogle();
    setGoogleSubmitting(false);
  };

  const toggleMode = () => {
    setCreatingAccount((current) => !current);
    setLocalError(null);
    clearError();
  };

  return (
    <main className="auth-screen">
      <Card className="auth-card">
        <Logo className="auth-logo" size="lg" />
        <h1>{creatingAccount ? fr.auth.createAccountTitle : fr.auth.loginTitle}</h1>
        <p className="auth-intro">{fr.auth.subtitle}</p>

        <form className="auth-form" noValidate onSubmit={(event) => void handleSubmit(event)}>
          <TextField
            autoComplete="email"
            className="auth-field__input"
            id="auth-email"
            label={fr.auth.emailLabel}
            onChange={(event) => { setEmail(event.currentTarget.value); setLocalError(null); clearError(); }}
            placeholder={fr.auth.emailPlaceholder}
            error={emailError}
            type="email"
            value={email}
          />
          <TextField
            autoComplete={creatingAccount ? 'new-password' : 'current-password'}
            className="auth-field__input"
            id="auth-password"
            label={fr.auth.passwordLabel}
            onChange={(event) => { setPassword(event.currentTarget.value); setLocalError(null); clearError(); }}
            placeholder={fr.auth.passwordPlaceholder}
            error={passwordError}
            type="password"
            value={password}
          />
          {activeError && message && !fieldError && (
            <p className="auth-error" role="alert"><AlertCircle aria-hidden="true" size={18} /><span>{message}</span></p>
          )}
          <Button className="auth-submit" disabled={submitting || googleSubmitting} loading={submitting} type="submit" variant="primary">
            {creatingAccount ? fr.auth.createAccount : fr.auth.signIn}
          </Button>
        </form>

        <div aria-hidden="true" className="auth-divider"><span>{fr.auth.or}</span></div>
        <Button className="auth-google" disabled={submitting || googleSubmitting} loading={googleSubmitting} onClick={() => void handleGoogle()} variant="secondary">
          <Globe2 aria-hidden="true" size={19} />
          {fr.auth.google}
        </Button>
        <p className="auth-switch">
          {creatingAccount ? fr.auth.haveAccount : fr.auth.noAccount}{' '}
          <button className="auth-link focus-ring" onClick={toggleMode} type="button">
            {creatingAccount ? fr.auth.signIn : fr.auth.createAccount}
          </button>
        </p>
      </Card>
    </main>
  );
}
