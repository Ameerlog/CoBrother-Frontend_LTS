import { useState, useEffect } from 'react';
import { adminAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const TYPE_COLORS = {
  COVENTURE:  { color: '#c8a96e', bg: 'rgba(200,169,110,0.1)' },
  DOMAIN:     { color: '#6eadc8', bg: 'rgba(110,173,200,0.1)' },
  COCREATION: { color: '#6ec896', bg: 'rgba(110,200,150,0.1)' },
};

const STATUS_COLORS = {
  PAYMENT_PENDING:   '#c8a96e',
  PAYMENT_COMPLETED: '#6eadc8',
  FORWARDED:         '#a06ec8',
  ACCEPTED:          '#6ec896',
  REJECTED:          '#c86e6e',
  CANCELLED:         '#666',
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('coventures');
  const [data, setData] = useState([]);
  const [coBrothers, setCoBrothers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [forwardModal, setForwardModal] = useState(null);

  useEffect(() => {
    adminAPI.getCoBrothers()
      .then(({ data }) => setCoBrothers(Array.isArray(data) ? data : []))
      .catch(() => {});
    adminAPI.getCoBrotherRequests()
      .then(({ data }) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchers = {
      coventures:  adminAPI.getCoVentures,
      domains:     adminAPI.getDomains,
      cocreations: adminAPI.getCoCreations,
    };
    if (!fetchers[tab]) { setLoading(false); return; }
    fetchers[tab]()
      .then(({ data }) => setData(Array.isArray(data) ? data : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const handleForward = async (entityId, type, coBrotherId) => {
    try {
      await adminAPI.forward({ entityId, type, coBrotherId });
      alert('Payment request sent to lister.');
      setForwardModal(null);
      adminAPI.getCoBrotherRequests()
        .then(({ data }) => setRequests(Array.isArray(data) ? data : []));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to forward.');
    }
  };

  const tabs = [
    { id: 'coventures',  label: '📋 CoVentures' },
    { id: 'domains',     label: '◇ Domains' },
    { id: 'cocreations', label: '⟁ CoCreations' },
    { id: 'requests',    label: '◆ CoBrother Requests' },
  ];

  return (
    <AppLayout>
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage all platform activity.</p>
          </div>
        </div>

        <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
          {tabs.map(t => (
            <button key={t.id}
              className={`filter-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : tab === 'requests' ? (
          <RequestsTable requests={requests} />
        ) : data.length === 0 ? (
          <div className="empty-state">
            <h3>No records found</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.map(item => (
              <AdminRow
                key={item.id}
                item={item}
                type={tab.slice(0, -1).toUpperCase().replace('COVENTURE', 'COVENTURE')
                  .replace('DOMAIN', 'DOMAIN').replace('COCREATION', 'COCREATION')}
                tabType={tab}
                coBrothers={coBrothers}
                onForward={(entityId, type) => setForwardModal({ entityId, type })}
              />
            ))}
          </div>
        )}
      </div>

      {forwardModal && (
        <ForwardModal
          entityId={forwardModal.entityId}
          type={forwardModal.type}
          coBrothers={coBrothers}
          requests={requests}          // ✅ pass this
          onForward={handleForward}
          onClose={() => setForwardModal(null)}
        />
      )}
    </AppLayout>
  );
}

function AdminRow({ item, tabType, coBrothers, onForward }) {
  const [expanded, setExpanded] = useState(false);

  const getTitle = () => {
    if (tabType === 'coventures') return item.venture?.brandDetails?.brandName || 'CoVenture #' + item.id;
    if (tabType === 'domains') return (item.domainName || '') + (item.domainExtension || '');
    return item.name || 'Software #' + item.id;
  };

  const getType = () => {
    if (tabType === 'coventures') return 'COVENTURE';
    if (tabType === 'domains') return 'DOMAIN';
    return 'COCREATION';
  };

  const getListerInfo = () => {
    if (tabType === 'coventures') return item.venture?.listedBy;
    return item.listedBy;
  };

  const getApplicantInfo = () => {
    if (tabType === 'coventures') return item.applicant;
    return item.purchasedBy;
  };

  const lister    = getListerInfo();
  const applicant = getApplicantInfo();

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem', cursor: 'pointer' }}
           onClick={() => setExpanded(v => !v)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#e0e0f0' }}>{getTitle()}</div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>
            ID: {item.id}
          </div>
        </div>
        <span style={{ color: '#666', fontSize: '0.85rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)',
                      padding: '1rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                        marginBottom: '1rem' }}>
            <div>
              <div style={labelStyle}>Lister</div>
              {lister ? (
                <>
                  <div style={valueStyle}>{lister.firstname} {lister.lastname}</div>
                  <div style={{ fontSize: '0.78rem', color: '#888' }}>{lister.email}</div>
                  <div style={{ fontSize: '0.78rem', color: '#888' }}>{lister.phoneNumber || '—'}</div>
                </>
              ) : <div style={valueStyle}>—</div>}
            </div>
            <div>
              <div style={labelStyle}>{tabType === 'coventures' ? 'Applicant' : 'Buyer'}</div>
              {applicant ? (
                <>
                  <div style={valueStyle}>{applicant.firstname} {applicant.lastname}</div>
                  <div style={{ fontSize: '0.78rem', color: '#888' }}>{applicant.email}</div>
                  <div style={{ fontSize: '0.78rem', color: '#888' }}>{applicant.phoneNumber || '—'}</div>
                </>
              ) : <div style={valueStyle}>Not yet</div>}
            </div>
          </div>

          <button className="btn-secondary btn-sm"
            onClick={() => onForward(item.id, getType())}
            style={{ fontSize: '0.8rem' }}>
            ◆ Forward to CoBrother
          </button>
        </div>
      )}
    </div>
  );
}

function RequestsTable({ requests }) {
  if (requests.length === 0) return (
    <div className="empty-state"><h3>No CoBrother requests yet</h3></div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {requests.map(r => (
        <div key={r.id} style={{ padding: '1rem 1.25rem',
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ fontWeight: 600, color: '#e0e0f0' }}>{r.entityTitle}</span>
              <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '0.5rem' }}>
                {r.requestType}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700,
                           color: STATUS_COLORS[r.status] || '#888' }}>
              {r.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#888' }}>
            Lister: {r.listerName} · {r.listerEmail}
          </div>
          {r.applicantName && (
            <div style={{ fontSize: '0.78rem', color: '#888' }}>
              Applicant: {r.applicantName} · {r.applicantEmail}
            </div>
          )}
          <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.3rem' }}>
            CoBrother: {r.assignedCoBrother?.firstname} {r.assignedCoBrother?.lastname}
          </div>
        </div>
      ))}
    </div>
  );
}

function ForwardModal({ entityId, type, coBrothers, requests, onForward, onClose }) {
  const [selectedCoBrother, setSelectedCoBrother] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if there's already an active non-cancelled request for this entity
  const activeRequests = requests.filter(r =>
    r.entityId === entityId &&
    r.requestType === type &&
    r.status !== 'CANCELLED' &&
    r.status !== 'REJECTED'
  );

  const alreadyAccepted = activeRequests.some(r => r.status === 'ACCEPTED');
  const pendingPayment  = activeRequests.some(r =>
    r.status === 'PAYMENT_PENDING' || r.status === 'FORWARDED');

  const handleSubmit = async () => {
    if (!selectedCoBrother) { alert('Please select a CoBrother'); return; }
    setLoading(true);
    await onForward(entityId, type, Number(selectedCoBrother));
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 440 }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-badge">Forward to CoBrother</div>
          <h2>Assign CoBrother</h2>
          <p>Select a CoBrother for this {type.toLowerCase()} request.</p>
        </div>

        {/* ── Warnings ── */}
        {alreadyAccepted && (
          <div style={{ padding: '0.875rem', background: 'rgba(200,110,110,0.08)',
                        border: '1px solid rgba(200,110,110,0.25)', borderRadius: 8,
                        marginBottom: '1rem', fontSize: '0.83rem', color: '#c86e6e' }}>
            ⚠️ This request has already been accepted by a CoBrother.
            Forwarding again is not recommended.
          </div>
        )}
        {!alreadyAccepted && pendingPayment && (
          <div style={{ padding: '0.875rem', background: 'rgba(200,169,110,0.08)',
                        border: '1px solid rgba(200,169,110,0.25)', borderRadius: 8,
                        marginBottom: '1rem', fontSize: '0.83rem', color: '#c8a96e' }}>
            ⚠️ The lister already has a pending payment request for this entity.
            You can only assign a different CoBrother after the current request is cancelled.
          </div>
        )}

        <div className="form-group" style={{ margin: '1rem 0' }}>
          <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.5rem',
                          display: 'block' }}>Select CoBrother</label>
          <select value={selectedCoBrother}
            onChange={e => setSelectedCoBrother(e.target.value)}>
            <option value="">Choose a CoBrother…</option>
            {coBrothers.map(cb => {
              // Mark already-assigned CoBrothers
              const alreadyAssigned = activeRequests
                .some(r => r.assignedCoBrother?.id === cb.id);
              return (
                <option key={cb.id} value={cb.id} disabled={alreadyAssigned}>
                  {cb.firstname} {cb.lastname} ({cb.email})
                  {alreadyAssigned ? ' — Already assigned' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ padding: '0.875rem', background: 'rgba(200,169,110,0.08)',
                      border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8,
                      marginBottom: '1.25rem', fontSize: '0.83rem', color: '#c8a96e' }}>
          ⚡ A ₹1,000 payment request will be sent to the lister via email.
          CoBrother is notified only after payment is confirmed.
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={handleSubmit}
            disabled={loading || !selectedCoBrother || alreadyAccepted || pendingPayment}
            style={{ flex: 1 }}>
            {loading ? <span className="btn-spinner" /> : 'Send Payment Request →'}
          </button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
const labelStyle = { fontSize: '0.72rem', fontWeight: 600, color: '#888',
                     textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' };
const valueStyle = { fontSize: '0.9rem', color: '#e0e0f0', fontWeight: 500 };