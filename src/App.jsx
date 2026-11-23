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
import SettingsLayout from './features/settings/pages/SettingsLayout';
import GeneralSettingsPage from './features/settings/pages/GeneralSettingsPage';
import ProfileSettingsPage from './features/settings/pages/ProfileSettingsPage';
import TeamSettingsPage from './features/settings/pages/TeamSettingsPage';
import NotificationsSettingsPage from './features/settings/pages/NotificationsSettingsPage';
import AiSettingsPage from './features/settings/pages/AiSettingsPage';
import TeamLayout from './features/team/pages/TeamLayout';
import TeamMembersPage from './features/team/pages/TeamMembersPage';
import TeamPerformancePage from './features/team/pages/TeamPerformancePage';
import RolesPermissionsPage from './features/team/pages/RolesPermissionsPage';
import InviteMemberPage from './features/team/pages/InviteMemberPage';
import AuthLayout from './layouts/AuthLayout/AuthLayout';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import AppLoader from './components/feedback/AppLoader/AppLoader';
import RoleGuard from './components/RoleGuard/RoleGuard';
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
          <Route
            path="/ai-assistant"
            element={
              <RoleGuard feature="ai-assistant">
                <AiAssistantPage />
              </RoleGuard>
            }
          />
          <Route
            path="/ai-assistant/:ticketId"
            element={
              <RoleGuard feature="ai-assistant">
                <AiAssistantPage />
              </RoleGuard>
            }
          />
          <Route path="/knowledge-base" element={<KbOverviewPage />} />
          <Route path="/knowledge-base/articles" element={<KbArticlesPage />} />
          <Route path="/knowledge-base/categories" element={<KbCategoriesPage />} />
          {/* KB reads are open to all roles, but article authoring is
              AGENT/ADMIN only (backend authorize("ADMIN", "AGENT")) — the
              editor routes are guarded so denied roles never reach the form
              (whose autosave would silently 403). */}
          <Route
            path="/knowledge-base/articles/new"
            element={
              <RoleGuard feature="kb-editor">
                <KbArticleEditorPage mode="create" />
              </RoleGuard>
            }
          />
          <Route
            path="/knowledge-base/articles/:id/edit"
            element={
              <RoleGuard feature="kb-editor">
                <KbArticleEditorPage mode="edit" />
              </RoleGuard>
            }
          />
          <Route path="/knowledge-base/articles/:id" element={<KbArticleDetailPage />} />
          {/* RoleGuard mirrors the backend's authorize() rules (see
              src/lib/accessControl.js): denied roles see the shared
              AccessDenied screen with no data fetch and no loader flash. */}
          <Route
            path="/reports"
            element={
              <RoleGuard feature="reports">
                <ReportsPage />
              </RoleGuard>
            }
          />
          <Route path="/team" element={<TeamLayout />}>
            <Route
              index
              element={
                <RoleGuard feature="team">
                  <TeamMembersPage />
                </RoleGuard>
              }
            />
            <Route
              path="performance"
              element={
                <RoleGuard feature="team">
                  <TeamPerformancePage />
                </RoleGuard>
              }
            />
            <Route
              path="roles"
              element={
                <RoleGuard feature="team">
                  <RolesPermissionsPage />
                </RoleGuard>
              }
            />
            {/* Invite keeps its own canInvite() gate (teamPermissions.js):
                AGENT is allowed to VIEW team but only ADMIN
                may invite, so this page needs a narrower rule than /team. */}
            <Route path="members/invite" element={<InviteMemberPage />} />
            <Route path="*" element={<Navigate to="/team" replace />} />
          </Route>
          {/* Settings: every authenticated role may view settings (GETs are
              open); admin-only saves are already disabled inside the pages.
              The guard documents the rule and is a no-op today. */}
          <Route
            path="/settings"
            element={
              <RoleGuard feature="settings">
                <SettingsLayout />
              </RoleGuard>
            }
          >
            <Route index element={<Navigate to="/settings/general" replace />} />
            <Route path="general" element={<GeneralSettingsPage />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
            <Route path="team" element={<TeamSettingsPage />} />
            <Route path="notifications" element={<NotificationsSettingsPage />} />
            <Route path="ai" element={<AiSettingsPage />} />
            <Route path="*" element={<Navigate to="/settings/general" replace />} />
          </Route>
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
