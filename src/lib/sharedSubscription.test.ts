import { describe, expect, it, vi } from 'vitest';
import { getSharedSubscriptionCount, shareSubscription } from './sharedSubscription';

describe('shareSubscription', () => {
  it('uses one upstream subscription for matching consumers and stops it after the last leaves', () => {
    const before = getSharedSubscriptionCount();
    const stop = vi.fn();
    const first = vi.fn();
    const second = vi.fn();
    let emit: (value: number) => void = () => {};
    const attach = vi.fn((onValue: (value: number) => void) => { emit = onValue; return stop; });

    const unsubscribeFirst = shareSubscription('shared-test-key', attach, first, vi.fn());
    const unsubscribeSecond = shareSubscription('shared-test-key', attach, second, vi.fn());
    expect(attach).toHaveBeenCalledTimes(1);
    expect(getSharedSubscriptionCount()).toBe(before + 1);

    emit(7);
    expect(first).toHaveBeenCalledWith(7);
    expect(second).toHaveBeenCalledWith(7);
    unsubscribeFirst();
    expect(stop).not.toHaveBeenCalled();
    unsubscribeSecond();
    expect(stop).toHaveBeenCalledTimes(1);
    expect(getSharedSubscriptionCount()).toBe(before);
  });
});
