import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AuthGate } from '@/app/AuthGate';
import { RouteLoading } from '@/app/RouteLoading';
import { RouteErrorBoundary, RouteNotFound } from '@/app/RouteErrorBoundary';
import { lazyWithRetry, preloadRouteModules } from '@/lib/lazyWithRetry';

const loadAppLayout = () => import('@/app/layout/AppLayout').then((module) => ({ default: module.AppLayout }));
const loadLoginPage = () => import('@/features/auth/LoginPage').then((module) => ({ default: module.LoginPage }));
const loadTodayPage = () => import('@/features/today/TodayPage').then((module) => ({ default: module.TodayPage }));
const loadTaskFormPage = () => import('@/features/tasks/TaskFormPage').then((module) => ({ default: module.TaskFormPage }));
const loadPlannerPage = () => import('@/features/planner/PlannerPage').then((module) => ({ default: module.PlannerPage }));
const loadListsPage = () => import('@/features/lists/ListsPage').then((module) => ({ default: module.ListsPage }));
const loadHistoryPage = () => import('@/features/history/HistoryPage').then((module) => ({ default: module.HistoryPage }));
const loadSettingsPage = () => import('@/features/settings/SettingsPage').then((module) => ({ default: module.SettingsPage }));
const loadAccountDeletionPage = () => import('@/features/settings/SettingsPage').then((module) => ({ default: module.AccountDeletionPage }));
const loadStatsPage = () => import('@/features/stats/StatsPage').then((module) => ({ default: module.StatsPage }));
const loadDesignGallery = () => import('@/app/DesignGallery').then((module) => ({ default: module.DesignGallery }));

const AppLayout = lazyWithRetry(loadAppLayout);
const LoginPage = lazyWithRetry(loadLoginPage);
const TodayPage = lazyWithRetry(loadTodayPage);
const TaskFormPage = lazyWithRetry(loadTaskFormPage);
const PlannerPage = lazyWithRetry(loadPlannerPage);
const ListsPage = lazyWithRetry(loadListsPage);
const HistoryPage = lazyWithRetry(loadHistoryPage);
const SettingsPage = lazyWithRetry(loadSettingsPage);
const AccountDeletionPage = lazyWithRetry(loadAccountDeletionPage);
const StatsPage = lazyWithRetry(loadStatsPage);
const DesignGallery = lazyWithRetry(loadDesignGallery);

function suspended(element: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

const routes: RouteObject[] = [
  { path: '/login', element: <AuthGate mode="guest">{suspended(<LoginPage />)}</AuthGate>, errorElement: <RouteErrorBoundary /> },
  {
    element: <AuthGate>{suspended(<AppLayout />)}</AuthGate>,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/', element: suspended(<TodayPage />), errorElement: <RouteErrorBoundary /> },
      { path: '/planner', element: suspended(<PlannerPage />), errorElement: <RouteErrorBoundary /> },
      { path: '/lists', element: suspended(<ListsPage />), errorElement: <RouteErrorBoundary /> },
      { path: '/stats', element: suspended(<StatsPage />), errorElement: <RouteErrorBoundary /> },
      { path: '/history', element: suspended(<HistoryPage />), errorElement: <RouteErrorBoundary /> },
      { path: '/trash', element: suspended(<HistoryPage trashOnly />), errorElement: <RouteErrorBoundary /> },
      { path: '/settings', element: suspended(<SettingsPage />), errorElement: <RouteErrorBoundary /> },
      { path: '/settings/delete-account', element: suspended(<AccountDeletionPage />), errorElement: <RouteErrorBoundary /> },
      { path: '/new', element: suspended(<TaskFormPage />), errorElement: <RouteErrorBoundary /> },
      { path: '*', element: <RouteNotFound />, errorElement: <RouteErrorBoundary /> },
    ],
  },
];

if (import.meta.env.DEV) {
  routes.push({ path: '/design', element: suspended(<DesignGallery />), errorElement: <RouteErrorBoundary /> });
}

export const router = createBrowserRouter(routes);

export function preloadPrimaryRoutes() {
  return preloadRouteModules([loadTaskFormPage, loadPlannerPage, loadListsPage, loadStatsPage, loadHistoryPage, loadSettingsPage]);
}
