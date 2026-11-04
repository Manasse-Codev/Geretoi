import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
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

export function LoginPage({ compact = false, onAuthenticated, onClose }: LoginPageProps) {
  const { user, signIn, register, resetPassword, continueAnonymously, error, errorMessage, clearError } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'register' | 'reset'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [anonymousSubmitting, setAnonymousSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const authenticationHandled = useRef(false);

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

  const activeError = localError ?? error;
  const message = localError ? fr.auth.errors[localError] : errorMessage;
  const emailError = activeError === 'invalidEmail' ? message ?? undefined : undefined;
  const passwordError = activeError === 'weakPassword' ? message ?? undefined : undefined;
  const fieldError = emailError !== undefined || passwordError !== undefined;
  const isReset = mode === 'reset';
  const isRegister = mode === 'register';

  function resetError() {
    setLocalError(null);
    clearError();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetError();
    if (!emailPattern.test(email.trim())) {
      setLocalError('invalidEmail');
      return;
    }
    if (!isReset && password.length < 6) {
      setLocalError('weakPassword');
      return;
    }
    setSubmitting(true);
    try {
      if (isReset) {
        setResetSent(await resetPassword(email.trim()));
      } else if (isRegister) {
        await register(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function continueAsAnonymous() {
    resetError();
    setAnonymousSubmitting(true);
    try {
      await continueAnonymously();
    } finally {
      setAnonymousSubmitting(false);
    }
  }

  function switchMode(nextMode: 'signIn' | 'register' | 'reset') {
    setMode(nextMode);
    setResetSent(false);
    resetError();
  }

  return (
    <main className={`${compact ? 'auth-screen auth-screen--compact' : 'auth-screen'} auth-screen--email`}>
      <Card className="auth-card">
        <div className="auth-card__brand"><Logo className="auth-logo" size="md" /><span><Sparkles aria-hidden="true" size={15} />DayFlow</span></div>
        <div className="auth-card__heading">
          <h1>{isReset ? 'Réinitialiser votre mot de passe' : isRegister ? 'Commencez à mieux vous organiser' : 'Bienvenue sur DayFlow'}</h1>
          <p className="auth-intro">
            {isReset
              ? 'Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.'
              : isRegister
                ? 'Créez votre compte et prenez le contrôle de vos journées.'
                : 'Organisez vos journées, simplement.'}
          </p>
        </div>

        <form className="auth-form" noValidate onSubmit={(event) => void submit(event)}>
          <TextField
            autoComplete="email"
            className="auth-field__input"
            id="auth-email"
            label={fr.auth.emailLabel}
            onChange={(event) => { setEmail(event.currentTarget.value); resetError(); }}
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
              onChange={(event) => { setPassword(event.currentTarget.value); resetError(); }}
              placeholder={fr.auth.passwordPlaceholder}
              error={passwordError}
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button aria-label={showPassword ? fr.auth.hidePassword : fr.auth.showPassword} className="auth-password-toggle focus-ring" onClick={() => setShowPassword((value) => !value)} type="button">
              {showPassword ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}
            </button>
          </div>}
          {!isReset && !isRegister && <button className="auth-forgot focus-ring" onClick={() => switchMode('reset')} type="button">{fr.auth.forgotPassword}</button>}
          {resetSent && <p className="auth-success" role="status"><Mail aria-hidden="true" size={17} />{fr.auth.resetSent}</p>}
          {activeError && message && !fieldError && <p className="auth-error" role="alert"><AlertCircle aria-hidden="true" size={18} /><span>{message}</span></p>}
          <Button className="auth-submit" disabled={submitting || anonymousSubmitting} loading={submitting} type="submit" variant="primary">
            {isReset ? fr.auth.sendReset : isRegister ? fr.auth.createAccountAction : fr.auth.signIn}
          </Button>
        </form>

        {!isReset && <div className="auth-divider"><span>OU</span></div>}
        {!isReset && <Button className="auth-anonymous" disabled={submitting || anonymousSubmitting} loading={anonymousSubmitting} onClick={() => void continueAsAnonymous()} variant="secondary">Continuer sans compte</Button>}
        <div className="auth-privacy"><ShieldCheck aria-hidden="true" size={18} /><span>Vos données restent protégées par votre compte Firebase.</span></div>
        <p className="auth-switch">
          {isReset
            ? <button className="auth-link focus-ring" onClick={() => switchMode('signIn')} type="button"><LockKeyhole aria-hidden="true" size={15} />{fr.auth.backToSignIn}</button>
            : <>{isRegister ? fr.auth.haveAccount : fr.auth.noAccount}{' '}<button className="auth-link focus-ring" onClick={() => switchMode(isRegister ? 'signIn' : 'register')} type="button">{isRegister ? fr.auth.signIn : fr.auth.createAccount}</button></>}
        </p>
        {compact && onClose && <Button onClick={onClose} variant="ghost">Fermer</Button>}
      </Card>
    </main>
  );
}
