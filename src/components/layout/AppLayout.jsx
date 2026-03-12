import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
    { to: '/ventures', label: 'Ventures', icon: '◈' },
    { to: '/domains',    label: 'Domains',   icon: '◇' },
    { to: '/community', label: 'Community', icon: '◉' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <nav className="topnav">
        <Link to="/dashboard" className="topnav-brand">
          <span className="brand-mark">CB</span>
          <span className="brand-name">CoBrother</span>
        </Link>

        <div className={`topnav-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${location.pathname.startsWith(l.to) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="topnav-right">
          <div className="user-pill">
            <div className="user-avatar">
              {user?.firstname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="user-name">{user?.firstname || user?.email?.split('@')[0]}</span>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              ⏻
            </button>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
