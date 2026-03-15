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
  if (loading) return <loading />;
  if (!user) return <Navigate to="/login" replace />;

  // CoBrother can only access /cobrother
  if (user.role === 'COBROTHER') return <Navigate to="/cobrother" replace />;

  if (!user.profileComplete) return <Navigate to="/complete-profile" replace />;
  return children;
}


export function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

export function CoBrotherGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'COBROTHER') return <Navigate to="/dashboard" replace />;
  return children;
}