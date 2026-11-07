import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import PublicRoute from './components/PublicRoute/PublicRoute';
import AppLayout from './components/AppLayout/AppLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import CategoriesPage from './features/categories/pages/CategoriesPage';
import TicketsPage from './features/tickets/pages/TicketsPage';
import TicketDetailPage from './features/tickets/pages/TicketDetailPage';
import AiAssistantPage from './features/aiAssistant/AiAssistantPage';
import KnowledgeBasePage from './features/knowledgeBase/KnowledgeBasePage';
import ReportsPage from './features/reports/pages/ReportsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import AuthLayout from './layouts/AuthLayout/AuthLayout';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import { useAuth } from './features/auth/hooks/useAuth';
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
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/ai-assistant" element={<AiAssistantPage />} />
          <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="/reports" element={<ReportsPage />} />
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
