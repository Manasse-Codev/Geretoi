import { useEffect, useRef, useState } from 'react';
import { useNavigate, useRevalidator, useRouteError } from 'react-router-dom';
import { UpdateExperience } from '@/components/UpdateExperience';
import { fr } from '@/i18n/fr';
import { retryLazyImports } from '@/lib/lazyWithRetry';
import { getRouteErrorMessage } from '@/app/routeErrorMessages';

function errorDetail(error: unknown) {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === 'string') return error;
  return JSON.stringify(error) ?? String(error);
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const copy = getRouteErrorMessage(error);
  const [, setRetryKey] = useState(0);
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function retry() {
    retryLazyImports();
    setRetryKey((key) => key + 1);
    revalidator.revalidate();
  }

  if (!copy.notFound) return <UpdateExperience mode="full" state={offline ? 'offline' : 'ready'} onBackHome={() => navigate('/')} onRetry={retry} onUpdate={() => window.location.reload()} />;
  return <main aria-labelledby="route-error-title" className="route-error page-content">
    <div className="route-error__card surface-raised">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1 id="route-error-title" ref={titleRef} tabIndex={-1}>{copy.title}</h1>
      <p>{copy.message}</p>
      <div className="route-error__actions"><button className="btn btn--secondary surface-raised" onClick={() => navigate('/')} type="button">{fr.routeError.backHome}</button></div>
      {import.meta.env.DEV && <pre className="route-error__detail">{errorDetail(error)}</pre>}
    </div>
  </main>;
}

export function RouteNotFound() {
  throw new Response(fr.routeError.notFoundTitle, { status: 404, statusText: fr.routeError.notFoundTitle });
  return null;
}
