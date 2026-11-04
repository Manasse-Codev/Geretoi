import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren } from 'react';
import { App } from '@/app/App';

vi.mock('@/features/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: PropsWithChildren) => children,
}));

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user' }, loading: false, error: null, errorMessage: null,
    signIn: async () => undefined, register: async () => undefined,
    signInGoogle: async () => undefined, resetPassword: async () => undefined, signOut: async () => undefined, clearError: () => undefined,
  }),
}));

const { sync } = vi.hoisted(() => ({ sync: { fromCache: false, hasPendingWrites: false, isOffline: false } }));
vi.mock('@/features/settings/usePreferences', () => ({
  defaultPreferences: { theme: 'auto', language: 'fr', firstDayOfWeek: 'monday', timeFormat: '24h', density: 'comfortable' },
  usePreferences: () => ({ preferences: { theme: 'auto', language: 'fr', firstDayOfWeek: 'monday', timeFormat: '24h', density: 'comfortable' }, loading: false, error: null, update: async () => undefined }),
}));
vi.mock('@/features/tasks', () => ({
  useTodayTasks: () => ({ tasks: [], loading: false, error: null, errorMessage: null, isEmpty: true, sync }),
  useOverdueTasks: () => ({ tasks: [], loading: false, error: null, errorMessage: null, isEmpty: true, sync }),
  useHistory: () => ({ tasks: [], loading: false, error: null, errorMessage: null, isEmpty: true, sync, hasMore: false, loadMore: async () => undefined }),
  useTrash: () => ({ tasks: [], loading: false, error: null, errorMessage: null, isEmpty: true, sync, hasMore: false, loadMore: async () => undefined }),
  useTaskActions: () => ({ error: null, errorMessage: null, clearError: () => undefined, create: async () => 'task', update: async () => undefined, complete: async () => async () => undefined, reopen: async () => undefined, softDelete: async () => async () => undefined, restore: async () => undefined, permanentlyDelete: async () => undefined, duplicate: async () => 'task', toggleSubtask: async () => undefined, reschedule: async () => async () => undefined }),
}));
vi.mock('@/features/lists/useLists', () => ({ useLists: () => ({ lists: [], loading: false, error: null, errorMessage: null, isEmpty: true, sync }) }));
vi.mock('@/features/tags/useTags', () => ({ useTags: () => ({ tags: [], loading: false, error: null, errorMessage: null, isEmpty: true, sync }) }));

describe('App', () => {
  it('renders the Today screen with application navigation', async () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(await screen.findByRole('heading', { name: "Aujourd'hui" }, { timeout: 10000 })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Réglages' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Navigation principale' })).toBeTruthy();
  }, 10000);
});
