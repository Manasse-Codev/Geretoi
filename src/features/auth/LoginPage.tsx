import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, Eye, EyeOff, Globe2, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Logo } from '@/components/Logo';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/features/auth/useAuth';
import type { AuthErrorCode } from '@/features/auth/authTypes';
import { fr } from '@/i18n/fr';

export interface LoginPageProps {
  compact?: boolean;
  onAuthenticated?: () => void;
  onClose?: () => void;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(email: string, password: string): AuthErrorCode | null {
  if (!emailPattern.test(email.trim())) return 'invalidEmail';
  if (password.length < 6) return 'weakPassword';
  return null;
}

export function LoginPage({ compact = false, onAuthenticated, onClose }: LoginPageProps) {
  const { user, signIn, register, signInGoogle, resetPassword, error, errorMessage, clearError } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'register' | 'reset'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const authenticationHandled = useRef(false);
  const activeError = localError ?? error;
  const message = localError ? fr.auth.errors[localError] : errorMessage;
  const emailError = activeError === 'invalidEmail' ? message ?? undefined : undefined;
  const passwordError = activeError === 'weakPassword' ? message ?? undefined : undefined;
  const fieldError = emailError !== undefined || passwordError !== undefined;

  useEffect(() => {
    if (!user) {
      authenticationHandled.current = false;
      return;
    }
    if (authenticationHandled.current) return;
    authenticationHandled.current = true;
    onAuthenticated?.();
  }, [onAuthenticated, user]);

  useEffect(() => {
    if (error) setResetSent(false);
  }, [error]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    const validationError = mode === 'reset'
      ? (!emailPattern.test(email.trim()) ? 'invalidEmail' : null)
      : validateCredentials(email, password);
    setLocalError(validationError);
    if (validationError) return;

    setSubmitting(true);
    if (mode === 'reset') {
      await resetPassword(email.trim());
      setResetSent(true);
    } else {
      await (mode === 'register' ? register(email.trim(), password) : signIn(email.trim(), password));
    }
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
    setMode((current) => current === 'register' ? 'signIn' : 'register');
    setLocalError(null);
    setResetSent(false);
    clearError();
  };

  const isReset = mode === 'reset';
  const isRegister = mode === 'register';
  const title = isReset ? fr.auth.resetTitle : isRegister ? fr.auth.createAccountTitle : fr.auth.loginTitle;
  const subtitle = isReset ? fr.auth.resetSubtitle : isRegister ? fr.auth.createAccountSubtitle : fr.auth.loginSubtitle;

  return (
    <main className={`${compact ? 'auth-screen auth-screen--compact' : 'auth-screen'} auth-screen--${mode}`}>
      <Card className="auth-card">
        <div className="auth-card__brand"><Logo className="auth-logo" size="md" /><span><Sparkles aria-hidden="true" size={15} />DayFlow</span></div>
        <div className="auth-card__heading">
          <h1>{title}</h1>
          <p className="auth-intro">{subtitle}</p>
        </div>

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
          {!isReset && <div className="auth-password-field">
            <TextField
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="auth-field__input"
              id="auth-password"
              label={fr.auth.passwordLabel}
              onChange={(event) => { setPassword(event.currentTarget.value); setLocalError(null); clearError(); }}
              placeholder={fr.auth.passwordPlaceholder}
              error={passwordError}
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={showPassword ? fr.auth.hidePassword : fr.auth.showPassword}
              className="auth-password-toggle focus-ring"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}
            </button>
          </div>}
          {!isReset && !isRegister && <button className="auth-forgot focus-ring" onClick={() => { setMode('reset'); setLocalError(null); setResetSent(false); clearError(); }} type="button">{fr.auth.forgotPassword}</button>}
          {resetSent && <p className="auth-success" role="status"><Mail aria-hidden="true" size={17} />{fr.auth.resetSent}</p>}
          {activeError && message && !fieldError && (
            <p className="auth-error" role="alert"><AlertCircle aria-hidden="true" size={18} /><span>{message}</span></p>
          )}
          <Button className="auth-submit" disabled={submitting || googleSubmitting} loading={submitting} type="submit" variant="primary">
            {isReset ? fr.auth.sendReset : isRegister ? fr.auth.createAccountAction : fr.auth.signIn}
          </Button>
        </form>

        {!isReset && <><div aria-hidden="true" className="auth-divider"><span>{fr.auth.or}</span></div>
        <Button className="auth-google" disabled={submitting || googleSubmitting} loading={googleSubmitting} onClick={() => void handleGoogle()} variant="secondary">
          <Globe2 aria-hidden="true" size={19} />{fr.auth.google}
        </Button></>}
        <p className="auth-switch">
          {isReset ? <button className="auth-link focus-ring" onClick={() => { setMode('signIn'); setResetSent(false); clearError(); }} type="button"><LockKeyhole aria-hidden="true" size={15} />{fr.auth.backToSignIn}</button> : <>{isRegister ? fr.auth.haveAccount : fr.auth.noAccount}{' '}<button className="auth-link focus-ring" onClick={toggleMode} type="button">{isRegister ? fr.auth.signIn : fr.auth.createAccount}</button></>}
        </p>
        {compact && onClose && <Button onClick={onClose} variant="ghost">{fr.auth.continueAsGuest}</Button>}
      </Card>
    </main>
  );
}
