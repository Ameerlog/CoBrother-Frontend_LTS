import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Spring Boot OAuth2 success handler redirects here:
 *   /auth/callback?token=JWT&refreshToken=...&profileComplete=true/false
 *
 * Strategy:
 *  1. Store tokens in localStorage directly (don't go through login() yet)
 *  2. Call refreshUser() which hits /profile/me with the stored token
 *  3. Navigate based on the real profileComplete value from the DB
 */
export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { login, refreshUser } = useAuth();
  const navigate = useNavigate();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token          = params.get('token');
    const refreshToken   = params.get('refreshToken');
    // URL param as fallback if /profile/me fails
    const profileCompleteParam = params.get('profileComplete') === 'true';
    const error          = params.get('error');

    // ── Validate ─────────────────────────────────────────────────────────
    if (error || !token || !refreshToken) {
      console.error('[OAuth] Missing tokens or error:', { error, token: !!token, refreshToken: !!refreshToken });
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    // ── Step 1: store tokens BEFORE calling any API ───────────────────────
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);

    // ── Step 2: seed empty user so ProtectedRoute doesn't bounce ─────────
    login({ accessToken: token, refreshToken }, null);

    // ── Step 3: fetch real user profile ───────────────────────────────────
    refreshUser()
      .then((fetchedUser) => {
        const isComplete = fetchedUser?.profileComplete ?? profileCompleteParam;
        console.log('[OAuth] profileComplete:', isComplete, 'user:', fetchedUser?.email);
        navigate(isComplete ? '/dashboard' : '/complete-profile', { replace: true });
      })
      .catch((err) => {
        console.error('[OAuth] refreshUser failed:', err);
        // Use URL param as fallback
        navigate(profileCompleteParam ? '/dashboard' : '/complete-profile', { replace: true });
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f', color: '#e8d5b0', gap: '1.5rem'
    }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
      <p style={{ opacity: 0.5, fontFamily: 'DM Sans, sans-serif' }}>Completing sign-in…</p>
    </div>
  );
}
