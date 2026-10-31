import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import PublicRoute from './components/PublicRoute/PublicRoute';
import AppLayout from './components/AppLayout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
import AuthLayout from './layouts/AuthLayout/AuthLayout';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import { useAuth } from './context/AuthContext';
import './styles/global.css';
import './App.css';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Protected Dashboard and Workspace Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tickets" element={<PlaceholderPage title="Tickets" />} />
          <Route path="/ai-assistant" element={<PlaceholderPage title="AI Assistant" />} />
          <Route path="/knowledge-base" element={<PlaceholderPage title="Knowledge Base" />} />
          <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="/team" element={<PlaceholderPage title="Team" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Route>

      {/* Catch-all: redirects to / if authenticated, otherwise to /signin */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/' : '/signin'} replace />}
      />
    </Routes>
  );
}
