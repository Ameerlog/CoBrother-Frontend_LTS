import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/services';
import coBrotherLogo from '../assets/Cobrother_logo.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      await authAPI.register({ email: form.email, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg"><div className="auth-bg-orb orb-1" /><div className="auth-bg-orb orb-2" /></div>
        <div className="auth-card success-card">
          <div className="success-icon">✉</div>
          <h2>Check your inbox</h2>
          <p>We've sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.</p>
          <Link to="/login" className="btn-primary full-width" style={{ display:'block', textAlign:'center', marginTop:'1.5rem' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb-1" />
        <div className="auth-bg-orb orb-2" />
        <div className="auth-bg-grid" />
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <img src={coBrotherLogo} alt="CoBrother" className="auth-logo-image" />
          <h1>Create Account</h1>
          <p>Join the CoBrother community</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Repeat password" required />
          </div>
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-links">
          <span>Already have an account?</span>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
