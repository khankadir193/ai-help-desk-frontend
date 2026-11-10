import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import PublicRoute from './components/PublicRoute/PublicRoute';
import AppLayout from './components/AppLayout/AppLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import TicketsPage from './features/tickets/pages/TicketsPage';
import TicketDetailPage from './features/tickets/pages/TicketDetailPage';
import AiAssistantPage from './features/aiAssistant/AiAssistantPage';
import KbOverviewPage from './features/knowledge-base/pages/KbOverviewPage';
import KbArticlesPage from './features/knowledge-base/pages/KbArticlesPage';
import KbCategoriesPage from './features/knowledge-base/pages/KbCategoriesPage';
import KbArticleDetailPage from './features/knowledge-base/pages/KbArticleDetailPage';
import KbArticleEditorPage from './features/knowledge-base/pages/KbArticleEditorPage';
import ReportsPage from './features/reports/pages/ReportsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import AuthLayout from './layouts/AuthLayout/AuthLayout';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import AppLoader from './components/feedback/AppLoader/AppLoader';
import { useAuth } from './features/auth/hooks/useAuth';
import './App.css';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Polished global app loader while restoring auth session on initial load or refresh
  if (isLoading) {
    return <AppLoader message="Restoring session..." />;
  }

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
          <Route path="/categories" element={<Navigate to="/knowledge-base/categories" replace />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/ai-assistant" element={<AiAssistantPage />} />
          <Route path="/knowledge-base" element={<KbOverviewPage />} />
          <Route path="/knowledge-base/articles" element={<KbArticlesPage />} />
          <Route path="/knowledge-base/categories" element={<KbCategoriesPage />} />
          <Route path="/knowledge-base/articles/new" element={<KbArticleEditorPage mode="create" />} />
          <Route path="/knowledge-base/articles/:id/edit" element={<KbArticleEditorPage mode="edit" />} />
          <Route path="/knowledge-base/articles/:id" element={<KbArticleDetailPage />} />
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
