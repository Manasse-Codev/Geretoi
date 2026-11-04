type Subscriber<T> = { onValue: (value: T) => void; onError: (error: unknown) => void };
type Relay = { onValue: (value: unknown) => void; onError: (error: unknown) => void };
type SharedEntry = { subscribers: Set<Relay>; unsubscribe?: () => void };

const entries = new Map<string, SharedEntry>();

/** Shares an identical live query while at least one screen is subscribed. */
export function shareSubscription<T>(
  key: string,
  attach: (onValue: (value: T) => void, onError: (error: unknown) => void) => () => void,
  onValue: Subscriber<T>['onValue'],
  onError: Subscriber<T>['onError'],
): () => void {
  let entry = entries.get(key);
  if (!entry) {
    entry = { subscribers: new Set() };
    entries.set(key, entry);
  }
  const currentEntry = entry;
  const subscriber: Relay = {
    onValue: (value) => onValue(value as T),
    onError,
  };
  currentEntry.subscribers.add(subscriber);
  if (!currentEntry.unsubscribe) {
    currentEntry.unsubscribe = attach(
      (value) => currentEntry.subscribers.forEach((listener) => listener.onValue(value)),
      (error) => {
        currentEntry.unsubscribe?.();
        currentEntry.unsubscribe = undefined;
        currentEntry.subscribers.forEach((listener) => listener.onError(error));
      },
    );
  }
  return () => {
    currentEntry.subscribers.delete(subscriber);
    if (currentEntry.subscribers.size === 0) {
      currentEntry.unsubscribe?.();
      entries.delete(key);
    }
  };
}

export function getSharedSubscriptionCount() {
  return entries.size;
}
