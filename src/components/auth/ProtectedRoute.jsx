import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


// ── Spinner shown while auth state is loading ─────────────────────────────
function FullScreenSpinner() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f'
      }}
    >
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
}


/**
 * ProtectedRoute — requires the user to be logged in
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}


/**
 * ProfileGuard — requires login AND profileComplete === true
 */
export function ProfileGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  // CoBrother users go to their panel
  if (user.role === 'COBROTHER') {
    return <Navigate to="/cobrother" replace />;
  }

  // Admin users go to admin panel
  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // If profile not complete
  if (!user.profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}


/**
 * AdminGuard — only ADMIN role can access
 */
export function AdminGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


/**
 * CoBrotherGuard — only COBROTHER role can access
 */
export function CoBrotherGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== 'COBROTHER') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}