import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/app/layout/AppLayout';
import { PlaceholderPage } from '@/app/PlaceholderPage';
import { fr } from '@/i18n/fr';

export const router = createBrowserRouter([
  { path: '/login', element: <PlaceholderPage title={fr.pages.login} /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <PlaceholderPage title={fr.pages.today} /> },
      { path: '/planner', element: <PlaceholderPage title={fr.pages.planner} /> },
      { path: '/lists', element: <PlaceholderPage title={fr.pages.lists} /> },
      { path: '/stats', element: <PlaceholderPage title={fr.pages.stats} /> },
      { path: '/history', element: <PlaceholderPage title={fr.pages.history} /> },
      { path: '/settings', element: <PlaceholderPage title={fr.pages.settings} /> },
      { path: '/focus', element: <PlaceholderPage title={fr.pages.focus} /> },
      { path: '/new', element: <PlaceholderPage title={fr.pages.newTask} /> },
    ],
  },
]);
