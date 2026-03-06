import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Spinner shown while auth state is loading ─────────────────────────────
function FullScreenSpinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0a0f'
    }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
}

/**
 * ProtectedRoute — requires the user to be logged in (token exists + /profile/me succeeds).
 * While loading: shows spinner (never redirects prematurely).
 * Not logged in: redirects to /login.
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenSpinner />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

/**
 * ProfileGuard — requires login AND profileComplete === true.
 * While loading: shows spinner.
 * Not logged in: → /login
 * Logged in but profile incomplete: → /complete-profile
 */
export function ProfileGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  console.log('ProfileGuard:', {
    loading,
    user,
    pathname: location.pathname,
    search: location.search,
    linkedin: searchParams.get('linkedin'),
    profileComplete: user?.profileComplete
  });

  if (loading) return <FullScreenSpinner />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;

  const isLinkedInCallback = searchParams.get('linkedin') === 'success' 
                          || searchParams.get('linkedin_error');
  
  console.log('isLinkedInCallback:', isLinkedInCallback);
  
  if (isLinkedInCallback) return children;

  if (user.profileComplete !== true) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}