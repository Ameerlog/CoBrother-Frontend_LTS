import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { coVentureAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const STATUS_META = {
  PENDING:  { label: 'Pending',  color: '#c8a96e', bg: 'rgba(200,169,110,0.12)', icon: '⏳' },
  APPROVED: { label: 'Approved', color: '#6ec896', bg: 'rgba(110,200,150,0.12)', icon: '✓'  },
  REJECTED: { label: 'Rejected', color: '#c86e6e', bg: 'rgba(200,110,110,0.12)', icon: '✕'  },
};

const TYPE_LABELS = {
  FIFTY_FIFTY: '50:50', SIXTY_FORTY: '60:40', SEVENTY_THIRTY: '70:30',
  EIGHTY_TWENTY: '80:20', NINETY_TEN: '90:10', NEGOTIABLE: 'Negotiable',
};

export default function VentureDashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('incoming'); // 'incoming' | 'applied'

  return (
    <AppLayout>
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>Venture Dashboard</h1>
            <p>Manage applications to your ventures and track your own.</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/ventures')}>
            ← Back to Ventures
          </button>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${tab === 'incoming' ? 'active' : ''}`}
            onClick={() => setTab('incoming')}
          >
            📋 Incoming Applications
          </button>
          <button
            className={`filter-tab ${tab === 'applied' ? 'active' : ''}`}
            onClick={() => setTab('applied')}
          >
            🚀 My Applications
          </button>
        </div>

        {tab === 'incoming' ? <IncomingApplications /> : <MyApplications />}
      </div>
    </AppLayout>
  );
}

// ─── Incoming Applications (to MY ventures) ───────────────────────────────────
function IncomingApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId]     = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    coVentureAPI.getMyVentureApplications(statusFilter || undefined)
      .then(({ data }) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (appId, newStatus) => {
    setActionLoading(appId + newStatus);
    try {
      await coVentureAPI.updateStatus(appId, newStatus);
      setApplications(prev =>
        prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Applicant Name', 'Phone', 'Location', 'GST No', 'Venture', 'Status', 'Applied For', 'How can the User Help?'],
      ...applications.map(a => [
        a.fullName || '',
        a.phone || '',
        a.location || '',
        a.gstNo || '',
        a.venture?.brandDetails?.brandName || '',
        a.status || '',
        TYPE_LABELS[a.venture?.brandDetails?.ventureType] || '',
        a.description || '',
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = 'coventure-applications.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const grouped = applications.reduce((acc, app) => {
    const name = app.venture?.brandDetails?.brandName || 'Unknown Venture';
    if (!acc[name]) acc[name] = [];
    acc[name].push(app);
    return acc;
  }, {});

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              onClick={() => setStatusFilter(s)}
            >
              {s === '' ? 'All' : STATUS_META[s].label}
            </button>
          ))}
        </div>
        <button
          className="btn-secondary"
          style={{ marginLeft: 'auto', fontSize: '0.85rem' }}
          onClick={exportCSV}
          disabled={applications.length === 0}
        >
          ↓ Export CSV
        </button>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No applications yet</h3>
          <p>When someone applies to your ventures, they'll appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(grouped).map(([ventureName, apps]) => (
            <div key={ventureName}>
              <h3 style={{ color: '#e0e0f0', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>
                {ventureName}
                <span style={{ marginLeft: '0.5rem', color: '#a0a0b0', fontWeight: 400, fontSize: '0.85rem' }}>
                  ({apps.length} application{apps.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {apps.map(app => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    expanded={expandedId === app.id}
                    onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    onApprove={() => handleStatusUpdate(app.id, 'APPROVED')}
                    onReject={() => handleStatusUpdate(app.id, 'REJECTED')}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ app, expanded, onToggle, onApprove, onReject, actionLoading }) {
  const s = STATUS_META[app.status] || STATUS_META.PENDING;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer' }}
        onClick={onToggle}
      >
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, color: '#c0c0d0', fontSize: '1rem', flexShrink: 0
        }}>
          {app.fullName?.[0]?.toUpperCase() || '?'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: '#e0e0f0' }}>{app.fullName || 'Unknown'}</div>
          <div style={{ fontSize: '0.8rem', color: '#a0a0b0' }}>
            {app.phone || '—'}{app.location ? ` · ${app.location}` : ''}
          </div>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.25rem 0.75rem', borderRadius: '20px',
          background: s.bg, color: s.color, fontSize: '0.8rem', fontWeight: 500,
          flexShrink: 0
        }}>
          {s.icon} {s.label}
        </div>

        <span style={{ color: '#666', fontSize: '0.85rem', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <Detail label="Full Name" value={app.fullName} />
            <Detail label="Phone" value={app.phone} />
            <Detail label="Location" value={app.location} />
            <Detail label="GST No" value={app.gstNo || 'Not provided'} />
            <Detail label="How can the User Help?" value={app.description} />
          </div>

          {app.status === 'PENDING' && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                className="btn-primary btn-sm"
                onClick={onApprove}
                disabled={actionLoading !== null}
              >
                {actionLoading === app.id + 'APPROVED' ? <span className="btn-spinner" /> : '✓ Approve'}
              </button>
              <button
                className="btn-danger btn-sm"
                onClick={onReject}
                disabled={actionLoading !== null}
              >
                {actionLoading === app.id + 'REJECTED' ? <span className="btn-spinner" /> : '✕ Reject'}
              </button>
            </div>
          )}

          {app.status !== 'PENDING' && (
            <div style={{ fontSize: '0.82rem', color: '#888', marginTop: '0.25rem' }}>
              Application has been {app.status.toLowerCase()}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── My Applications (ventures I applied to) ──────────────────────────────────
function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    coVentureAPI.getMyApplications()
      .then(({ data }) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (applications.length === 0) return (
    <div className="empty-state">
      <div className="empty-icon">🚀</div>
      <h3>No applications yet</h3>
      <p>Browse ventures and apply to co-venture with other founders.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {applications.map(app => {
        const b = app.venture?.brandDetails || {};
        const s = STATUS_META[app.status] || STATUS_META.PENDING;
        return (
          <div key={app.id} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
          }}>
            {b.logoUrl
              ? <img src={b.logoUrl} alt={b.brandName} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
              : <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: 'rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#c0c0d0'
                }}>{b.brandName?.[0] || '?'}</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: '#e0e0f0' }}>{b.brandName || 'Unknown Venture'}</div>
              <div style={{ fontSize: '0.8rem', color: '#a0a0b0' }}>
                {b.industry?.replace(/_/g, ' ')}{b.ventureType ? ` · ${TYPE_LABELS[b.ventureType] || b.ventureType}` : ''}
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.25rem 0.75rem', borderRadius: '20px',
              background: s.bg, color: s.color, fontSize: '0.8rem', fontWeight: 500
            }}>
              {s.icon} {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function Detail({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontSize: '0.9rem', color: '#d0d0e0' }}>{value || '—'}</div>
    </div>
  );
}