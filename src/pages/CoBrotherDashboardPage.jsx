import { useState, useEffect } from 'react';
import { coBrotherAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const STATUS_COLORS = {
  PAYMENT_PENDING:   '#c8a96e',
  FORWARDED:         '#a06ec8',
  ACCEPTED:          '#6ec896',
  REJECTED:          '#c86e6e',
  CANCELLED:         '#666',
};

export default function CoBrotherDashboardPage() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [respondId, setRespondId] = useState(null);

  const load = () => {
    setLoading(true);
    coBrotherAPI.getRequests()
      .then(({ data }) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (id, accepted, note) => {
    try {
      await coBrotherAPI.respond(id, accepted, note);
      setRespondId(null);
      load();
    } catch (e) {
      alert(e.response?.data || 'Failed to respond.');
    }
  };

  const pending   = requests.filter(r => r.status === 'FORWARDED');
  const completed = requests.filter(r => r.status !== 'FORWARDED');

  return (
    <AppLayout>
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>CoBrother Dashboard</h1>
            <p>Manage your assigned requests.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))',
                      gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Total Assigned" value={requests.length} icon="◆" />
          <StatCard label="Pending"  value={pending.length}   icon="⏳" color="#a06ec8" />
          <StatCard label="Accepted" value={requests.filter(r => r.status === 'ACCEPTED').length}
                    icon="✓" color="#6ec896" />
          <StatCard label="Rejected" value={requests.filter(r => r.status === 'REJECTED').length}
                    icon="✕" color="#c86e6e" />
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◆</div>
            <h3>No requests assigned yet</h3>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#a06ec8', marginBottom: '1rem', fontSize: '0.9rem',
                             fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pending Response
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pending.map(r => (
                    <RequestCard key={r.id} request={r}
                      onRespond={() => setRespondId(r.id)} />
                  ))}
                </div>
              </div>
            )}
            {completed.length > 0 && (
              <div>
                <h3 style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem',
                             fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Completed
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {completed.map(r => <RequestCard key={r.id} request={r} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {respondId && (
        <RespondModal
          request={requests.find(r => r.id === respondId)}
          onRespond={handleRespond}
          onClose={() => setRespondId(null)}
        />
      )}
    </AppLayout>
  );
}

function RequestCard({ request, onRespond }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = STATUS_COLORS[request.status] || '#888';

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem', cursor: 'pointer' }}
           onClick={() => setExpanded(v => !v)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#e0e0f0' }}>{request.entityTitle}</div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>
            {request.requestType}
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: statusColor }}>
          {request.status?.replace(/_/g, ' ')}
        </span>
        <span style={{ color: '#666', fontSize: '0.85rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                        marginBottom: '1rem' }}>
            <ContactBlock label="Lister"
              name={request.listerName} email={request.listerEmail}
              phone={request.listerPhone} />
            <ContactBlock label="Applicant / Buyer"
              name={request.applicantName} email={request.applicantEmail}
              phone={request.applicantPhone} />
          </div>

          {request.coBrotherNote && (
            <div style={{ fontSize: '0.82rem', color: '#a0a0b0', marginBottom: '0.75rem' }}>
              <strong>Your Note:</strong> {request.coBrotherNote}
            </div>
          )}

          {request.status === 'FORWARDED' && onRespond && (
            <button className="btn-primary btn-sm" onClick={onRespond}>
              Respond →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ContactBlock({ label, name, email, phone }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#888',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ fontSize: '0.9rem', color: '#e0e0f0' }}>{name || '—'}</div>
      <div style={{ fontSize: '0.78rem', color: '#888' }}>{email || '—'}</div>
      <div style={{ fontSize: '0.78rem', color: '#888' }}>{phone || '—'}</div>
    </div>
  );
}

function RespondModal({ request, onRespond, onClose }) {
  const [note, setNote]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (accepted) => {
    setLoading(true);
    await onRespond(request.id, accepted, note);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 460 }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-badge">Respond to Request</div>
          <h2>{request?.entityTitle}</h2>
          <p>{request?.requestType} · {request?.listerName}</p>
        </div>

        <div className="form-group" style={{ margin: '1.5rem 0' }}>
          <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.5rem',
                          display: 'block' }}>Note (optional)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add a note for the lister…" rows={3}
            style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={() => handle(true)}
            disabled={loading} style={{ flex: 1 }}>
            {loading ? <span className="btn-spinner" /> : '✓ Accept'}
          </button>
          <button className="btn-danger" onClick={() => handle(false)}
            disabled={loading} style={{ flex: 1 }}>
            {loading ? <span className="btn-spinner" /> : '✕ Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = '#e0e0f0' }) {
  return (
    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color,
                    fontFamily: 'Cormorant Garamond, serif' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>{label}</div>
    </div>
  );
}