import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout/AppLayout';
import AuthLayout from '../layouts/AuthLayout/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import UnauthorizedPage from '../components/feedback/UnauthorizedPage/UnauthorizedPage';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';

export const router = createBrowserRouter([
  // Public App Layout Routes
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
              Welcome to the AI Help Desk. Please sign in to view, create, and manage support tickets.
            </p>
          </div>
        ),
      },
      {
        path: ROUTES.UNAUTHORIZED,
        element: <UnauthorizedPage />,
      },

      // Authenticated Protected Routes (All Roles: Customer, Agent, Admin)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: ROUTES.TICKETS,
            element: (
              <div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>
                  Support Tickets
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                  All authenticated users (Customers, Agents, Admins) can access tickets.
                </p>
              </div>
            ),
          },
        ],
      },

      // Role-Restricted: Agents and Admins only
      {
        element: <RoleRoute allowedRoles={[ROLES.AGENT, ROLES.ADMIN]} />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: (
              <div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>
                  Staff Dashboard
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                  Restricted to Support Agents and Administrators.
                </p>
              </div>
            ),
          },
        ],
      },

      // Role-Restricted: Administrators only
      {
        element: <RoleRoute allowedRoles={[ROLES.ADMIN]} />,
        children: [
          {
            path: ROUTES.CATEGORIES,
            element: (
              <div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>
                  Category Management
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                  Restricted to Administrators only.
                </p>
              </div>
            ),
          },
          {
            path: ROUTES.USERS,
            element: (
              <div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>
                  User & Role Management
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                  Restricted to Administrators only.
                </p>
              </div>
            ),
          },
        ],
      },

      // 404 Catch-All
      {
        path: ROUTES.NOT_FOUND,
        element: (
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>
              404 - Page Not Found
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              The requested page does not exist.
            </p>
          </div>
        ),
      },
    ],
  },

  // Auth Layout Routes (Card / Split container)
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
    ],
  },
]);

export default router;
