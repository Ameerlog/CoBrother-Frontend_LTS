import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, ProfileGuard } from './components/auth/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import DashboardPage from './pages/DashboardPage';
import VenturesPage from './pages/VenturesPage';
import NewVenturePage from './pages/NewVenturePage';
import EditVenturePage from './pages/EditVenturePage';
import CommunityPage from './pages/CommunityPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* OAuth callback — path MUST match app.oauth2.redirect-uri in application.properties */}
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />

          {/* Authenticated but profile may be incomplete */}
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <CompleteProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Authenticated + profile complete required */}
          <Route
            path="/dashboard"
            element={
              <ProfileGuard>
                <DashboardPage />
              </ProfileGuard>
            }
          />
          <Route
            path="/ventures"
            element={
              <ProfileGuard>
                <VenturesPage />
              </ProfileGuard>
            }
          />
          <Route
            path="/ventures/new"
            element={
              <ProfileGuard>
                <NewVenturePage />
              </ProfileGuard>
            }
          />
          <Route
            path="/ventures/:id/edit"
            element={
              <ProfileGuard>
                <EditVenturePage />
              </ProfileGuard>
            }
          />
          <Route
            path="/community"
            element={
              <ProfileGuard>
                <CommunityPage />
              </ProfileGuard>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
