import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../api/services';

const TYPE_ICONS = {
  COVENTURE_APPLICATION_RECEIVED:      '📋',
  COVENTURE_APPLICATION_STATUS_CHANGED:'📣',
  DOMAIN_SOLD:                         '◇',
  SOFTWARE_PURCHASED:                  '⟁',
  SOFTWARE_MARKED_COMPLETE:            '✓',
  PROFILE_VIEWED:                      '👁',
  NEW_LISTING_IN_INDUSTRY:             '🆕',
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen]           = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const bellRef = useRef(null);

  
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
    { to: '/ventures', label: 'Ventures', icon: '◈' },
    { to: '/domains',    label: 'Domains',   icon: '◇' },
    { to: '/cocreation',  label: 'CoCreation',  icon: '⟁' },
    { to: '/community', label: 'Community', icon: '◉' },
  ];

  // Add after existing navLinks:
  const coBrotherLinks = [
    { to: '/cobrother', label: 'CoBrother', icon: '◆' },
  ];
  
  // Admin sees everything + admin panel
  const adminLinks = [
    ...navLinks,
    { to: '/admin', label: 'Admin', icon: '⚙' },
  ];
  
  const visibleLinks = user?.role === 'COBROTHER'
  ? coBrotherLinks
  : user?.role === 'ADMIN'
  ? adminLinks
  : navLinks;

  useEffect(() => {
    const fetchCount = () =>
      notificationAPI.getUnreadCount()
        .then(({ data }) => setUnreadCount(data.count))
        .catch(() => {});
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close bell when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellOpen = async () => {
    if (!bellOpen) {
      try {
        const { data } = await notificationAPI.getRecent();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {}
    }
    setBellOpen(v => !v);
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      await notificationAPI.markOneRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    }
    setBellOpen(false);
    if (n.link) navigate(n.link);
  };

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
          {visibleLinks.map((l) => (
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

        <div className="bell-wrapper" ref={bellRef}>
            <button className="bell-btn" onClick={handleBellOpen} title="Notifications">
              🔔
              {unreadCount > 0 && (
                <span className="bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>

            {bellOpen && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button className="notif-mark-all" onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id}
                        className={`notif-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(n)}>
                        <div className="notif-icon">
                          {TYPE_ICONS[n.type] || '🔔'}
                        </div>
                        <div className="notif-content">
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-message">{n.message}</div>
                          <div className="notif-time">{timeAgo(n.createdAt)}</div>
                        </div>
                        {!n.read && <div className="notif-dot" />}
                      </div>
                    ))
                  )}
                </div>

                <div className="notif-dropdown-footer">
                  <Link to="/notifications" onClick={() => setBellOpen(false)}>
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>
          
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
