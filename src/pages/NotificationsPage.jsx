import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const TYPE_ICONS = {
  COVENTURE_APPLICATION_RECEIVED:      '📋',
  COVENTURE_APPLICATION_STATUS_CHANGED:'📣',
  DOMAIN_SOLD:                         '◇',
  SOFTWARE_PURCHASED:                  '⟁',
  SOFTWARE_MARKED_COMPLETE:            '✓',
  PROFILE_VIEWED:                      '👁',
  NEW_LISTING_IN_INDUSTRY:             '🆕',
};

const TYPE_COLORS = {
  COVENTURE_APPLICATION_RECEIVED:      '#c8a96e',
  COVENTURE_APPLICATION_STATUS_CHANGED:'#6ec896',
  DOMAIN_SOLD:                         '#6ec896',
  SOFTWARE_PURCHASED:                  '#6ec896',
  SOFTWARE_MARKED_COMPLETE:            '#6ec896',
  PROFILE_VIEWED:                      '#a06ec8',
  NEW_LISTING_IN_INDUSTRY:             '#6eadc8',
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('all');

  useEffect(() => {
    notificationAPI.getAll()
      .then(({ data }) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(n => n.map(x => ({ ...x, read: true })));
  };

  const handleClick = async (n) => {
    if (!n.read) {
      await notificationAPI.markOneRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
    if (n.link) navigate(n.link);
  };

  const unread = notifications.filter(n => !n.read);
  const filtered = filter === 'unread' ? unread : notifications;

  return (
    <AppLayout>
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>Notifications</h1>
            <p>{unread.length} unread notification{unread.length !== 1 ? 's' : ''}</p>
          </div>
          {unread.length > 0 && (
            <button className="btn-secondary" onClick={handleMarkAllRead}>
              ✓ Mark all as read
            </button>
          )}
        </div>

        <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`filter-tab ${filter === 'all'    ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({notifications.length})
          </button>
          <button className={`filter-tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
            Unread ({unread.length})
          </button>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>{filter === 'unread' ? 'All caught up!' : 'No notifications yet'}</h3>
            <p>{filter === 'unread' ? 'No unread notifications.' : 'Activity will show up here.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map(n => {
              const color = TYPE_COLORS[n.type] || '#c8a96e';
              return (
                <div key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    padding: '1rem 1.25rem',
                    background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.055)',
                    border: `1px solid ${n.read ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.14)'}`,
                    borderRadius: 10, cursor: n.link ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}>

                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem',
                    background: `${color}18`, border: `1px solid ${color}33`
                  }}>
                    {TYPE_ICONS[n.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between',
                                  alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.9rem',
                                     color: n.read ? '#c0c0d0' : '#e0e0f0' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#666', whiteSpace: 'nowrap' }}>
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem',
                                color: n.read ? '#888' : '#a8a8c0', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%',
                                  background: color, flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}