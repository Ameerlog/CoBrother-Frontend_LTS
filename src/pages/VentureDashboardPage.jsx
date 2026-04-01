import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { coVentureAPI, likeAPI, ventureAPI } from '../api/services';
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
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 m-0">Venture Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage applications to your ventures and track your own.</p>
          </div>
          <button className="px-4 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50" onClick={() => navigate('/ventures')}>
            ← Back to Ventures
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${tab === 'likes' ? 'bg-purple-600 text-white border-2 border-purple-600' : 'bg-white border-2 border-purple-400 text-purple-600 hover:bg-purple-50'}`}
            onClick={() => setTab('likes')}
          >
            ❤️ Likes Received
          </button>
          <button
            className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${tab === 'incoming' ? 'bg-purple-600 text-white border-2 border-purple-600' : 'bg-white border-2 border-purple-400 text-purple-600 hover:bg-purple-50'}`}
            onClick={() => setTab('incoming')}
          >
            📋 Incoming Applications
          </button>
          <button
            className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${tab === 'applied' ? 'bg-purple-600 text-white border-2 border-purple-600' : 'bg-white border-2 border-purple-400 text-purple-600 hover:bg-purple-50'}`}
            onClick={() => setTab('applied')}
          >
            🚀 My Applications
          </button>
        </div>

        {tab === 'incoming' ? <IncomingApplications /> : tab === 'applied' ? <MyApplications /> : <LikesReceived />}
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
      <div className="flex gap-3 items-center mb-6 flex-wrap">
        <div className="flex gap-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
            <button
              key={s}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 ${statusFilter === s ? 'bg-purple-600 text-white border-2 border-purple-600' : 'bg-white border-2 border-purple-400 text-purple-600 hover:bg-purple-50'}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === '' ? 'All' : STATUS_META[s].label}
            </button>
          ))}
        </div>
        <button
          className="ml-auto px-4 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={exportCSV}
          disabled={applications.length === 0}
        >
          ↓ Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" /></div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600">When someone applies to your ventures, they'll appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([ventureName, apps]) => (
            <div key={ventureName}>
              <h3 className="text-gray-900 mb-3 text-base font-semibold">
                {ventureName}
                <span className="ml-2 text-gray-600 font-normal text-sm">
                  ({apps.length} application{apps.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="flex flex-col gap-3">
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="w-[38px] h-[38px] rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-base flex-shrink-0">
          {app.fullName?.[0]?.toUpperCase() || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900">{app.fullName || 'Unknown'}</div>
          <div className="text-xs text-gray-500">
            {app.phone || '—'}{app.location ? ` · ${app.location}` : ''}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
          style={{ background: s.bg, color: s.color }}>
          {s.icon} {s.label}
        </div>

        <span className="text-gray-500 text-sm flex-shrink-0">
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Detail label="Full Name" value={app.fullName} />
            <Detail label="Phone" value={app.phone} />
            <Detail label="Location" value={app.location} />
            <Detail label="GST No" value={app.gstNo || 'Not provided'} />
            <Detail label="How can the User Help?" value={app.description} />
          </div>

          {app.status === 'PENDING' && (
            <div className="flex gap-3 mt-2">
              <button
                className="px-4 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={onApprove}
                disabled={actionLoading !== null}
              >
                {actionLoading === app.id + 'APPROVED' ? <span className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" /> : '✓ Approve'}
              </button>
              <button
                className="px-4 py-2 bg-red-500 border border-red-500 text-white rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={onReject}
                disabled={actionLoading !== null}
              >
                {actionLoading === app.id + 'REJECTED' ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✕ Reject'}
              </button>
            </div>
          )}

          {app.status !== 'PENDING' && (
            <div className="text-xs text-gray-500 mt-1">
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

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" /></div>;

  if (applications.length === 0) return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🚀</div>
      <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">No applications yet</h3>
      <p className="text-gray-600">Browse ventures and apply to co-venture with other founders.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {applications.map(app => {
        const b = app.venture?.brandDetails || {};
        const s = STATUS_META[app.status] || STATUS_META.PENDING;
        return (
          <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 flex-wrap shadow-sm">
            {b.logoUrl
              ? <img src={b.logoUrl} alt={b.brandName} className="w-10 h-10 rounded-lg object-cover" />
              : <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center font-bold text-purple-600">{b.brandName?.[0] || '?'}</div>
            }
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900">{b.brandName || 'Unknown Venture'}</div>
              <div className="text-xs text-gray-500">
                {b.industry?.replace(/_/g, ' ')}{b.ventureType ? ` · ${TYPE_LABELS[b.ventureType] || b.ventureType}` : ''}
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: s.bg, color: s.color }}>
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
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-700">{value || '—'}</div>
    </div>
  );
}

function LikesReceived() {
  const [ventures, setVentures] = useState([]);
  const [likeData, setLikeData] = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    ventureAPI.getMyVentures()
      .then(async ({ data }) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setVentures(list);
        if (list.length > 0) {
          const ids = list.map(v => v.id);
          const { data: likes } = await likeAPI.bulkStatus('VENTURE', ids);
          setLikeData(likes);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" /></div>;

  if (ventures.length === 0) return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">❤️</div>
      <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">No ventures listed yet</h3>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {ventures.map(v => {
        const b = v.brandDetails || {};
        const ls = likeData[String(v.id)] || { liked: false, count: 0 };
        return (
          <div key={v.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-[10px] flex-wrap gap-2 shadow-sm">
            <div>
              <div className="font-semibold text-gray-900">{b.brandName}</div>
              <div className="text-xs text-gray-500 mt-1">
                {b.industry?.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-400 font-semibold">
                ❤️ {ls.count} like{ls.count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}