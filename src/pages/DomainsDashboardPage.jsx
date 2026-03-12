import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { domainAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const STATUS_COLORS = {
  AVAILABLE: { color: '#6ec896', bg: 'rgba(110,200,150,0.1)', border: 'rgba(110,200,150,0.3)' },
  PENDING:   { color: '#c8a96e', bg: 'rgba(200,169,110,0.1)', border: 'rgba(200,169,110,0.3)' },
  SOLD:      { color: '#c86e6e', bg: 'rgba(200,110,110,0.1)', border: 'rgba(200,110,110,0.3)' },
};

const PAYMENT_COLORS = {
  COMPLETED: { color: '#6ec896' },
  CREATED:   { color: '#c8a96e' },
  FAILED:    { color: '#c86e6e' },
};

export default function DomainsDashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab]               = useState('listings');
  const [listings, setListings]     = useState([]);
  const [purchases, setPurchases]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([domainAPI.getMyListings(), domainAPI.getMyPurchases()])
      .then(([l, p]) => {
        setListings(Array.isArray(l.data) ? l.data : (l.data?.data ?? []));
        setPurchases(Array.isArray(p.data) ? p.data : (p.data?.data ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = listings
    .filter(d => d.domainStatus === 'SOLD')
    .reduce((sum, d) => sum + d.askingPrice, 0);

  const totalSpent = purchases
    .filter(d => d.paymentStatus === 'COMPLETED')
    .reduce((sum, d) => sum + d.askingPrice, 0);

  return (
    <AppLayout>
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>Domains Dashboard</h1>
            <p>Manage your domain listings and purchases.</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/domains')}>
            ← Back to Domains
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Total Listings" value={listings.length} icon="◇" />
          <StatCard label="Active" value={listings.filter(d => d.domainStatus === 'AVAILABLE').length} icon="✓" color="#6ec896" />
          <StatCard label="Sold" value={listings.filter(d => d.domainStatus === 'SOLD').length} icon="💰" color="#c8a96e" />
          <StatCard label="Revenue" value={`₹${Number(totalRevenue).toLocaleString('en-IN')}`} icon="📈" color="#6ec896" />
          <StatCard label="Purchased" value={purchases.length} icon="🛒" />
          <StatCard label="Total Spent" value={`₹${Number(totalSpent).toLocaleString('en-IN')}`} icon="💳" color="#c86e6e" />
        </div>

        {/* Tabs */}
        <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`filter-tab ${tab === 'listings' ? 'active' : ''}`} onClick={() => setTab('listings')}>
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
              <div className="empty-icon">◇</div>
              <h3>No listings yet</h3>
              <p>List your first domain to start selling.</p>
              <button className="btn-primary" onClick={() => navigate('/domains')}>List a Domain</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {listings.map(d => <DomainRow key={d.id} domain={d} type="listing" />)}
            </div>
          )
        ) : (
          purchases.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>No purchases yet</h3>
              <p>Browse domains and make your first purchase.</p>
              <button className="btn-primary" onClick={() => navigate('/domains')}>Browse Domains</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {purchases.map(d => <DomainRow key={d.id} domain={d} type="purchase" />)}
            </div>
          )
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, icon, color = '#e0e0f0' }) {
  return (
    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color, fontFamily: 'Cormorant Garamond, serif' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>{label}</div>
    </div>
  );
}

function DomainRow({ domain, type }) {
  const s = STATUS_COLORS[domain.domainStatus] || STATUS_COLORS.AVAILABLE;
  const p = domain.paymentStatus ? PAYMENT_COLORS[domain.paymentStatus] : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, flexWrap: 'wrap', gap: '0.5rem' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '1rem', color: '#e0e0f0' }}>
          {domain.domainName}{domain.domainExtension}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>
          {domain.domainCategory?.replace(/_/g, ' ')} · {domain.pricingDemand}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c8a96e' }}>
          ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
        </span>

        <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
          {domain.domainStatus}
        </span>

        {p && (
          <span style={{ fontSize: '0.72rem', color: p.color, fontWeight: 600 }}>
            {domain.paymentStatus === 'COMPLETED' && '✓ Paid'}
            {domain.paymentStatus === 'CREATED'   && '⏳ Pending'}
            {domain.paymentStatus === 'FAILED'    && '✕ Failed'}
          </span>
        )}

        {type === 'purchase' && domain.paymentStatus === 'COMPLETED' && (
          <span style={{ fontSize: '0.75rem', color: '#c8a96e', background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)', padding: '0.25rem 0.6rem', borderRadius: 6 }}>
            ⏳ Transfer within 24hrs
          </span>
        )}
      </div>
    </div>
  );
}