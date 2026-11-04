import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WelcomeDialog } from '@/components/WelcomeDialog';

describe('WelcomeDialog', () => {
  beforeEach(() => localStorage.clear());

  it('mémorise la fermeture de la présentation', () => {
    const onClose = vi.fn();
    render(<WelcomeDialog onClose={onClose} open />);
    fireEvent.click(screen.getByRole('button', { name: 'Découvrir DayFlow' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(localStorage.getItem('dayflow-welcome-seen')).toBe('true');
  });
});
