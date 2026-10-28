import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout/AppLayout';
import { ROUTES } from '../constants/routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)' }}>
              AI Help Desk System
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '640px' }}>
              Foundation successfully initialized with feature-based architecture, design tokens,
              centralized Axios client, and TanStack React Query.
            </p>
          </div>
        ),
      },
      {
        path: ROUTES.LOGIN,
        element: (
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>Login</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Authentication module placeholder.</p>
          </div>
        ),
      },
      {
        path: ROUTES.TICKETS,
        element: (
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>Tickets</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Ticket management placeholder.</p>
          </div>
        ),
      },
      {
        path: ROUTES.NOT_FOUND,
        element: (
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>404 - Not Found</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>The requested page does not exist.</p>
          </div>
        ),
      },
    ],
  },
]);

export default router;

