import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AuthGate } from '@/app/AuthGate';
import { RouteLoading } from '@/app/RouteLoading';
import { fr } from '@/i18n/fr';
const AppLayout = lazy(() => import('@/app/layout/AppLayout').then((module) => ({ default: module.AppLayout })));
const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const TodayPage = lazy(() => import('@/features/today/TodayPage').then((module) => ({ default: module.TodayPage })));
const TaskFormPage = lazy(() => import('@/features/tasks/TaskFormPage').then((module) => ({ default: module.TaskFormPage })));
const PlannerPage = lazy(() => import('@/features/planner/PlannerPage').then((module) => ({ default: module.PlannerPage })));
const ListsPage = lazy(() => import('@/features/lists/ListsPage').then((module) => ({ default: module.ListsPage })));
const HistoryPage = lazy(() => import('@/features/history/HistoryPage').then((module) => ({ default: module.HistoryPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const AccountDeletionPage = lazy(() => import('@/features/settings/SettingsPage').then((module) => ({ default: module.AccountDeletionPage })));
const StatsPage = lazy(() => import('@/features/stats/StatsPage').then((module) => ({ default: module.StatsPage })));

function suspended(element: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

const routes: RouteObject[] = [
  { path: '/login', element: <AuthGate mode="guest">{suspended(<LoginPage />)}</AuthGate> },
  {
    element: <AuthGate>{suspended(<AppLayout />)}</AuthGate>,
    children: [
      { path: '/', element: suspended(<TodayPage />) },
      { path: '/planner', element: suspended(<PlannerPage />) },
      { path: '/lists', element: suspended(<ListsPage />) },
      { path: '/stats', element: suspended(<StatsPage />) },
      { path: '/history', element: suspended(<HistoryPage />) },
      { path: '/trash', element: suspended(<HistoryPage trashOnly />) },
      { path: '/settings', element: suspended(<SettingsPage />) },
      { path: '/settings/delete-account', element: suspended(<AccountDeletionPage />) },
      { path: '/focus', element: <main className="screen"><h1>{fr.pages.focus}</h1><p className="feature-help">Le minuteur Focus n’est pas encore relié à une fonctionnalité de session.</p></main> },
      { path: '/new', element: suspended(<TaskFormPage />) },
    ],
  },
];

if (import.meta.env.DEV) {
  routes.push({ path: '/design', lazy: async () => { const module = await import('@/app/DesignGallery'); return { Component: module.DesignGallery }; } });
}

export const router = createBrowserRouter(routes);
