import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PwaRuntime } from './PwaRuntime';
import { setUnsavedChanges } from '@/lib/unsavedChanges';

const { registerMock } = vi.hoisted(() => ({ registerMock: vi.fn() }));
vi.mock('@/lib/pwaRegistration', () => ({ registerSW: registerMock }));
vi.mock('@/app/App', () => ({ App: () => <main>Application</main> }));

describe('PwaRuntime', () => {
  beforeEach(() => {
    registerMock.mockReset();
    setUnsavedChanges(false);
    vi.restoreAllMocks();
  });

  it('affiche le bandeau lors d’une mise à jour et protège les modifications en cours', () => {
    const update = vi.fn(async () => undefined);
    let notifyUpdate: () => void = () => {};
    registerMock.mockImplementation((options: { onNeedRefresh: () => void }) => {
      notifyUpdate = options.onNeedRefresh;
      return update;
    });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<PwaRuntime />);
    expect(screen.queryByText('Une nouvelle version est prête.')).toBeNull();
    act(() => notifyUpdate());
    expect(screen.getByText('Une nouvelle version est prête.')).toBeTruthy();

    setUnsavedChanges(true);
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));
    expect(window.confirm).toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();

    vi.mocked(window.confirm).mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));
    expect(update).toHaveBeenCalledWith(true);
  });
});
