import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import coBrotherLogo from '../assets/Cobrother_logo.png';

export default function LoginPage() {
  const { user, loading, login, refreshUser } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [searchParams] = useSearchParams();
  const from = location.state?.from?.pathname || '/dashboard';

  const [mode, setMode]   = useState('password');
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({ email: '', password: '', otpCode: '' });
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo]   = useState('');

  // ── If already logged in, redirect away ──────────────────────────────────
  useEffect(() => {
    if (!loading && user) {
      navigate(user.profileComplete ? '/dashboard' : '/complete-profile', { replace: true });
    }
  }, [user, loading]);

  // ── Show OAuth error if redirected back with ?error= ─────────────────────
  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
      setError('Google sign-in failed. Please try again.');
    }
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Helper: handle any successful login response ──────────────────────────
  const handleLoginSuccess = async (data) => {
    // Backend may nest under data.data
    const payload = data?.data ?? data;
    const accessToken  = payload?.accessToken  || payload?.token;
    const refreshToken = payload?.refreshToken;

    if (!accessToken) throw new Error('No access token in response');

    login({ accessToken, refreshToken }, null);
    const fetchedUser = await refreshUser();
    navigate(fetchedUser?.profileComplete ? from : '/complete-profile', { replace: true });
  };

  // ── Password login ────────────────────────────────────────────────────────
  const handlePasswordLogin = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { data } = await authAPI.login({ email: form.email, password: form.password });
      await handleLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Invalid email or password.');
    } finally { setBusy(false); }
  };

  // ── OTP: send ─────────────────────────────────────────────────────────────
  const handleSendOtp = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await authAPI.sendOtp(form.email);
      setStep(2);
      setInfo(`OTP sent to ${form.email}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally { setBusy(false); }
  };

  // ── OTP: verify ───────────────────────────────────────────────────────────
  const handleVerifyOtp = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { data } = await authAPI.verifyOtp(form.email, form.otpCode);
      await handleLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally { setBusy(false); }
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "https://api.cobrother.com";
    window.location.href = `${apiUrl}/oauth2/authorization/google`;
  };

  // Don't flash login page if already loading auth state
  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 max-md:p-4 relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-purple/16 rounded-full blur-[80px] opacity-70 -top-[150px] -right-[100px]" />
        <div className="absolute w-[400px] h-[400px] bg-blue-500/12 rounded-full blur-[80px] opacity-70 -bottom-[100px] -left-[100px]" />
        <div className="absolute inset-0 opacity-65" style={{backgroundImage: 'linear-gradient(rgba(148,163,184,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.14) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
      </div>

      <div className="relative z-10 w-full max-w-[440px] bg-white/95 p-10 max-md:p-8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100 backdrop-blur-xl">
        <div className="text-center mb-10 max-md:mb-8">
          <img src={coBrotherLogo} alt="CoBrother" className="w-36 max-md:w-28 h-auto object-contain mx-auto mb-6 block" />
          <h1 className="font-display text-3xl max-md:text-2xl font-bold text-gray-900 whitespace-nowrap">Welcome to CoBrother</h1>
          <p className="text-gray-500 text-sm mt-2 tracking-wide">Where ventures find their co-pilots</p>
        </div>

        <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:border-purple hover:bg-purple-50 hover:shadow-[0_10px_24px_rgba(148,64,221,0.12)] active:scale-[0.98]" onClick={handleGoogleLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
{/* 
        <div className="auth-divider"><span>or</span></div>

        <div className="auth-mode-toggle">
          <button
            className={mode === 'password' ? 'active' : ''}
            onClick={() => { setMode('password'); setError(''); setStep(1); }}
          >Password</button>
          <button
            className={mode === 'otp' ? 'active' : ''}
            onClick={() => { setMode('otp'); setError(''); setStep(1); }}
          >OTP Login</button>
        </div>

        {error && <div className="form-error">{error}</div>}
        {info  && <div className="form-info">{info}</div>}

        {mode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary full-width" disabled={busy}>
              {busy ? <span className="btn-spinner" /> : 'Sign In'}
            </button>
          </form>
        )}

        {mode === 'otp' && step === 1 && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <button type="submit" className="btn-primary full-width" disabled={busy}>
              {busy ? <span className="btn-spinner" /> : 'Send OTP'}
            </button>
          </form>
        )}

        {mode === 'otp' && step === 2 && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label>Enter OTP sent to {form.email}</label>
              <input name="otpCode" value={form.otpCode} onChange={handleChange}
                placeholder="6-digit code" maxLength={6} className="otp-input" required />
            </div>
            <button type="submit" className="btn-primary full-width" disabled={busy}>
              {busy ? <span className="btn-spinner" /> : 'Verify & Sign In'}
            </button>
            <button type="button" className="btn-ghost full-width"
              onClick={() => { setStep(1); setInfo(''); setForm(f => ({ ...f, otpCode: '' })); }}>
              ← Back
            </button>
          </form>
        )}

        <div className="auth-links">
          <span>Don't have an account?</span>
          <Link to="/register">Register</Link>
        </div> */}
      </div>
    </div>
  );
}
