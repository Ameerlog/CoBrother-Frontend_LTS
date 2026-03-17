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
import VentureDashboardPage from './pages/VentureDashboardPage';
import VentureAnalyticsPage from './pages/VentureAnalyticsPage';
import ProfileAnalyticsPage from './pages/ProfileAnalyticsPage';
import DomainsPage from './pages/DomainsPage';
import DomainsDashboardPage from './pages/DomainsDashboardPage';
import CoCreationDashboardPage from './pages/CoCreationDashboardPage';
import CoCreationPage from './pages/CoCreationPage';
import CoCreationAnalyticsPage from './pages/CoCreationAnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboardPage    from './pages/AdminDashboardPage';
import CoBrotherDashboardPage from './pages/CoBrotherDashboardPage';
import FeeRequestsPage       from './pages/FeeRequestsPage';
import { AdminGuard, CoBrotherGuard } from './components/auth/ProtectedRoute';
import AuctionPage from './pages/AuctionPage';
import PurchasesPage from './pages/PurchasesPage';
import AuctionsPage from './pages/AuctionsPage';


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


          <Route path="/auction/:auctionId" element={<ProfileGuard><AuctionPage /></ProfileGuard>} />
          {/* Authenticated but profile may be incomplete */}
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <CompleteProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/ventures/analytics" element={<ProfileGuard><VentureAnalyticsPage /></ProfileGuard>} />
          <Route path="/profile/analytics"  element={<ProfileGuard><ProfileAnalyticsPage /></ProfileGuard>} />

          <Route path="/domains" element={<ProfileGuard><DomainsPage /></ProfileGuard>} />
          <Route path="/domains/dashboard" element={<ProfileGuard><DomainsDashboardPage /></ProfileGuard>} />

          <Route path="/cocreation" element={<ProfileGuard><CoCreationPage /></ProfileGuard>} />
          <Route path="/cocreation/dashboard" element={<ProfileGuard><CoCreationDashboardPage /></ProfileGuard>} />
          <Route path="/cocreation/:id/analytics" element={<ProfileGuard><CoCreationAnalyticsPage /></ProfileGuard>} />
          <Route path="/notifications" element={<ProfileGuard><NotificationsPage /></ProfileGuard>} />
          <Route path="/admin"      element={<AdminGuard><AdminDashboardPage /></AdminGuard>} />
          <Route path="/cobrother"  element={<CoBrotherGuard><CoBrotherDashboardPage /></CoBrotherGuard>} />
          <Route path="/fee-requests" element={<ProtectedRoute><FeeRequestsPage /></ProtectedRoute>} />
          <Route path="/auctions"  element={<ProfileGuard><AuctionsPage  /></ProfileGuard>} />
          <Route path="/purchases" element={<ProfileGuard><PurchasesPage /></ProfileGuard>} />


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
            path="/ventures/dashboard"
            element={
              <ProfileGuard>
                <VentureDashboardPage />
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
