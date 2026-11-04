import { describe, expect, it } from 'vitest';
import { getRouteErrorMessage } from './routeErrorMessages';

describe('getRouteErrorMessage', () => {
  it('returns only French user-facing text for import and render failures', () => {
    const copy = getRouteErrorMessage(new Error('Failed to fetch dynamically imported module'));

    expect(copy.title).toBe("Cet écran n'a pas pu se charger.");
    expect(copy.message).toBe('Vérifiez votre connexion et réessayez.');
    expect(copy.title).not.toMatch(/failed|module|import/i);
    expect(copy.message).not.toMatch(/failed|module|import/i);
  });

  it('maps route 404 responses to the French not-found state', () => {
    const copy = getRouteErrorMessage({ status: 404, statusText: 'Not Found', data: 'missing', internal: true });

    expect(copy.notFound).toBe(true);
    expect(copy.title).toBe('Cette page n’existe pas.');
    expect(copy.message).not.toMatch(/missing|404/i);
  });
});
