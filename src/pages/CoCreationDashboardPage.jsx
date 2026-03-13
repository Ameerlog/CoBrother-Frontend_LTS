import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cocreationAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const PAYMENT_COLORS = {
  COMPLETED: { color: '#6ec896' },
  CREATED:   { color: '#c8a96e' },
  FAILED:    { color: '#c86e6e' },
};

export default function CoCreationDashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState('listings');
  const [listings, setListings]   = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [githubLink, setGithubLink]     = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([cocreationAPI.getMyListings(), cocreationAPI.getMyPurchases()])
      .then(([l, p]) => {
        setListings(Array.isArray(l.data) ? l.data : (l.data?.data ?? []));
        setPurchases(Array.isArray(p.data) ? p.data : (p.data?.data ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id) => {
    setConfirmingId(id);
    try {
      const { data } = await cocreationAPI.confirmPurchase(id);
      setGithubLink(data.githubLink);
      load(); // refresh
    } catch (e) {
      alert('Failed to confirm. Please try again.');
    } finally { setConfirmingId(null); }
  };

  const totalRevenue = listings
    .filter(s => s.paymentStatus === 'COMPLETED')
    .reduce((sum, s) => sum + s.price, 0);

  const totalSpent = purchases
    .filter(s => s.paymentStatus === 'COMPLETED')
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <AppLayout>
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>CoCreation Dashboard</h1>
            <p>Manage your software listings and purchases.</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/cocreation')}>
            ← Back to CoCreation
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Total Listings"  value={listings.length}                                            icon="⟁" />
          <StatCard label="Active"          value={listings.filter(s => s.softwareStatus === 'AVAILABLE').length} icon="✓" color="#6ec896" />
          <StatCard label="Sold"            value={listings.filter(s => s.softwareStatus === 'SOLD').length}   icon="💰" color="#c8a96e" />
          <StatCard label="Revenue"         value={`₹${Number(totalRevenue).toLocaleString('en-IN')}`}         icon="📈" color="#6ec896" />
          <StatCard label="Purchased"       value={purchases.length}                                           icon="🛒" />
          <StatCard label="Total Spent"     value={`₹${Number(totalSpent).toLocaleString('en-IN')}`}           icon="💳" color="#c86e6e" />
        </div>

        {/* Tabs */}
        <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`filter-tab ${tab === 'listings'  ? 'active' : ''}`} onClick={() => setTab('listings')}>
            My Listings ({listings.length})
          </button>
          <button className={`filter-tab ${tab === 'purchases' ? 'active' : ''}`} onClick={() => setTab('purchases')}>
            My Purchases ({purchases.length})
          </button>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : tab === 'listings' ? (
          listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⟁</div>
              <h3>No listings yet</h3>
              <button className="btn-primary" onClick={() => navigate('/cocreation')}>List Software</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {listings.map(s => (
                <SoftwareRow key={s.id} item={s} type="listing" onNavigate={() => navigate(`/cocreation/${s.id}/analytics`)} />
              ))}
            </div>
          )
        ) : (
          purchases.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>No purchases yet</h3>
              <button className="btn-primary" onClick={() => navigate('/cocreation')}>Browse Software</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {purchases.map(s => (
                <SoftwareRow
                  key={s.id} item={s} type="purchase"
                  onConfirm={() => handleConfirm(s.id)}
                  confirmingId={confirmingId}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* GitHub link reveal modal */}
      {githubLink && (
        <div className="modal-overlay" onClick={() => setGithubLink(null)}>
          <div className="modal-card" style={{ maxWidth: 440, textAlign: 'center' }}
               onClick={e => e.stopPropagation()}>
            <div className="modal-glow" />
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔓</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', marginBottom: '0.5rem' }}>
              GitHub Access Unlocked!
            </h2>
            <p style={{ color: '#a0a0b0', marginBottom: '1.25rem' }}>
              Your GitHub link has also been sent to your email.
            </p>
            <div style={{ padding: '0.875rem', background: 'rgba(110,200,150,0.08)',
                          border: '1px solid rgba(110,200,150,0.2)', borderRadius: 8,
                          marginBottom: '1.25rem', wordBreak: 'break-all' }}>
              <a href={githubLink} target="_blank" rel="noreferrer"
                 style={{ color: '#6ec896', fontWeight: 600 }}>
                {githubLink}
              </a>
            </div>
            <button className="btn-primary" onClick={() => setGithubLink(null)} style={{ width: '100%' }}>Done</button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function StatCard({ label, value, icon, color = '#e0e0f0' }) {
  return (
    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color, fontFamily: 'Cormorant Garamond, serif' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>{label}</div>
    </div>
  );
}

function SoftwareRow({ item, type, onConfirm, confirmingId, onNavigate }) {
  const p = item.paymentStatus ? PAYMENT_COLORS[item.paymentStatus] : null;
  const isConfirmed = item.completionStatus === 'CONFIRMED';
  const isPending   = item.completionStatus === 'PENDING' && item.paymentStatus === 'COMPLETED';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                  flexWrap: 'wrap', gap: '0.5rem' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '1rem', color: '#e0e0f0' }}>{item.name}</div>
        <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>
          {item.category?.replace(/_/g, ' ')} · {item.pricingDemand}
          {item.techStack && ` · ${item.techStack.split(',').slice(0,2).join(', ')}`}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c8a96e' }}>
          ₹{Number(item.price).toLocaleString('en-IN')}
        </span>

        <span style={{ fontSize: '0.72rem', fontWeight: 600,
                       color: item.softwareStatus === 'SOLD' ? '#c86e6e' : '#6ec896' }}>
          {item.softwareStatus}
        </span>

        {p && (
          <span style={{ fontSize: '0.72rem', color: p.color, fontWeight: 600 }}>
            {item.paymentStatus === 'COMPLETED' && '✓ Paid'}
            {item.paymentStatus === 'CREATED'   && '⏳ Pending'}
            {item.paymentStatus === 'FAILED'    && '✕ Failed'}
          </span>
        )}

        {type === 'listing' && (
          <button className="btn-ghost btn-sm" onClick={onNavigate} style={{ fontSize: '0.75rem' }}>
            📊 Analytics
          </button>
        )}

        {type === 'purchase' && isPending && (
          <button className="btn-primary btn-sm"
            onClick={onConfirm}
            disabled={confirmingId === item.id}
            style={{ fontSize: '0.75rem' }}>
            {confirmingId === item.id ? <span className="btn-spinner" /> : '✓ Mark as Complete'}
          </button>
        )}

        {type === 'purchase' && isConfirmed && item.githubLink && (
          <a href={item.githubLink} target="_blank" rel="noreferrer"
             style={{ fontSize: '0.75rem', color: '#6ec896', fontWeight: 600,
                      padding: '0.25rem 0.6rem', borderRadius: 6,
                      background: 'rgba(110,200,150,0.1)', border: '1px solid rgba(110,200,150,0.2)',
                      textDecoration: 'none' }}>
            🔓 View GitHub
          </a>
        )}

        {type === 'purchase' && isConfirmed && !item.githubLink && (
          <span style={{ fontSize: '0.72rem', color: '#6ec896' }}>✓ Completed</span>
        )}
      </div>
    </div>
  );
}