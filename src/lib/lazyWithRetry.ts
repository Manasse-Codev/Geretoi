import { createElement, useEffect, useState, type ComponentType } from 'react';
import { fr } from '@/i18n/fr';
import { hasPendingUnsavedChanges } from '@/lib/unsavedChanges';

type ModuleLoader<TProps extends object> = () => Promise<{ default: ComponentType<TProps> }>;
type ModuleRecord<TProps extends object> =
  | { status: 'pending'; promise: Promise<{ default: ComponentType<TProps> }> }
  | { status: 'fulfilled'; component: ComponentType<TProps> }
  | { status: 'rejected'; error: unknown };

const retryListeners = new Set<() => void>();
const lazyResetters = new Set<() => void>();
const reloadStorageKey = 'dayflow:chunk-reload';
let retryVersion = 0;

const wait = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

function isOnline() {
  return typeof navigator === 'undefined' || navigator.onLine;
}

function canReload() {
  try {
    const previous = Number(sessionStorage.getItem(reloadStorageKey));
    if (Number.isFinite(previous) && Date.now() - previous < 60_000) return false;
    sessionStorage.setItem(reloadStorageKey, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

function reloadAfterChunkFailure() {
  if (!isOnline()) return;
  if (hasPendingUnsavedChanges() && !window.confirm(fr.pwa.unsavedUpdate)) return;
  if (!canReload()) return;
  window.location.reload();
}

function notifyRetry() {
  retryVersion += 1;
  lazyResetters.forEach((reset) => reset());
  retryListeners.forEach((listener) => listener());
}

function listenForVitePreloadErrors() {
  if (typeof window === 'undefined') return;
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    if (isOnline()) reloadAfterChunkFailure();
    else notifyRetry();
  });
}

listenForVitePreloadErrors();

async function importWithRetry<TProps extends object>(loader: ModuleLoader<TProps>) {
  try {
    return await loader();
  } catch (firstError) {
    await wait(250);
    try {
      return await loader();
    } catch (secondError) {
      reloadAfterChunkFailure();
      throw secondError ?? firstError;
    }
  }
}

export function retryLazyImports() {
  notifyRetry();
}

export function lazyWithRetry<TProps extends object>(loader: ModuleLoader<TProps>) {
  let record: ModuleRecord<TProps> | undefined;
  lazyResetters.add(() => { record = undefined; });
  return function ResilientLazy(props: TProps) {
    const [, setVersion] = useState(retryVersion);
    useEffect(() => {
      const listener = () => {
        record = undefined;
        setVersion(retryVersion);
      };
      retryListeners.add(listener);
      return () => { retryListeners.delete(listener); };
    }, []);
    if (!record) {
      record = { status: 'pending', promise: importWithRetry(loader) };
      record.promise.then(
        (module) => { record = { status: 'fulfilled', component: module.default }; },
        (error: unknown) => { record = { status: 'rejected', error }; },
      );
    }
    if (record.status === 'pending') throw record.promise;
    if (record.status === 'rejected') throw record.error;
    return createElement(record.component, props);
  };
}

export async function preloadRouteModules(loaders: Array<() => Promise<unknown>>) {
  await Promise.allSettled(loaders.map((loader) => loader()));
}
