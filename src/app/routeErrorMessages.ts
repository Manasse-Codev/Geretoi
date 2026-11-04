import { isRouteErrorResponse } from 'react-router-dom';
import { fr } from '@/i18n/fr';

export function getRouteErrorMessage(error: unknown) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return {
    notFound,
    eyebrow: notFound ? fr.routeError.notFoundEyebrow : fr.routeError.eyebrow,
    title: notFound ? fr.routeError.notFoundTitle : fr.routeError.title,
    message: notFound ? fr.routeError.notFoundMessage : fr.routeError.message,
  };
}
