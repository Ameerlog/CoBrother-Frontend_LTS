import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gem, CheckCircle2, IndianRupee, ShoppingCart, CreditCard, Gavel, ShieldCheck } from 'lucide-react';
import { domainAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';
import DomainVerificationModal from './DomainVerificationModal';


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
  const [verifyTarget, setVerifyTarget] = useState(null);


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
      <div className="ventures-page domains-dashboard-page">
        <div className="page-header domains-dashboard-header">
          <div>
            <h1>Domains Dashboard</h1>
            <p>Manage your domain listings and purchases.</p>
          </div>
          <button className="btn-secondary domains-btn" onClick={() => navigate('/domains')}>
            <ArrowLeft size={16} /> Back to Domains
          </button>
        </div>

        <div className="domains-stats-grid">
          <StatCard label="Total Listings" value={listings.length} icon={<Gem size={18} />} />
          <StatCard label="Active" value={listings.filter(d => d.domainStatus === 'AVAILABLE').length} icon={<CheckCircle2 size={18} />} color="#047857" />
          <StatCard label="Sold" value={listings.filter(d => d.domainStatus === 'SOLD').length} icon={<IndianRupee size={18} />} color="#6d28d9" />
          <StatCard label="Revenue" value={`₹${Number(totalRevenue).toLocaleString('en-IN')}`} icon={<IndianRupee size={18} />} color="#047857" />
          <StatCard label="Purchased" value={purchases.length} icon={<ShoppingCart size={18} />} />
          <StatCard label="Total Spent" value={`₹${Number(totalSpent).toLocaleString('en-IN')}`} icon={<CreditCard size={18} />} color="#1d4ed8" />
        </div>

        <div className="filter-tabs domains-filter-tabs">
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
            <div className="domains-row-list">
              {listings.map(d => (
                <DomainRow
                  key={d.id}
                  domain={d}
                  type="listing"
                  onVerify={() => setVerifyTarget(d)}
                />
              ))}
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
            <div className="domains-row-list">
              {purchases.map(d => <DomainRow key={d.id} domain={d} type="purchase" />)}
            </div>
          )
        )}
      </div>
      {verifyTarget && (
        <DomainVerificationModal
          domain={verifyTarget}
          onClose={() => setVerifyTarget(null)}
          onVerified={() => {
            setListings(prev => prev.map(d =>
              d.id === verifyTarget.id ? { ...d, verified: true } : d
            ));
            setVerifyTarget(null);
          }}
        />
      )}
    </AppLayout>
  );
}

function StatCard({ label, value, icon, color = '#111827' }) {
  return (
    <div className="domains-stat-card">
      <div className="domains-stat-icon">{icon}</div>
      <div className="domains-stat-value" style={{ color }}>{value}</div>
      <div className="domains-stat-label">{label}</div>
    </div>
  );
}

function DomainRow({ domain, type, onVerify }) {
  const navigate = useNavigate();  // add useNavigate import to DomainsDashboardPage if not present
  const s = STATUS_COLORS[domain.domainStatus] || STATUS_COLORS.AVAILABLE;
  const p = domain.paymentStatus ? PAYMENT_COLORS[domain.paymentStatus] : null;
 
  const isAuction  = domain.saleType === 'AUCTION';
  const auction    = domain.auction;
  const auctionId  = auction?.id;
 
  const AUCTION_STATUS_COLORS = {
    DRAFT:    '#888',
    ACTIVE:   '#6ec896',
    EXTENDED: '#c8a96e',
    ENDED:    '#a06ec8',
    UNSOLD:   '#c86e6e',
    CLOSED:   '#666',
  };
 
  return (
    <div className="domain-row-card">
      <div>
        <div className="domain-row-name">
          {domain.domainName}{domain.domainExtension}
          {isAuction && (
            <span className="domain-row-auction-pill">
              <Gavel size={13} /> Auction
            </span>
          )}
        </div>
        <div className="domain-row-meta">
          {domain.pricingDemand}
          {isAuction && auction && (
            <span style={{ marginLeft: '0.5rem',
                           color: AUCTION_STATUS_COLORS[auction.status] || '#888' }}>
              · {auction.status}
              {auction.status === 'ACTIVE' || auction.status === 'EXTENDED'
                ? ` · ${auction.totalBids} bid${auction.totalBids !== 1 ? 's' : ''}`
                : ''}
            </span>
          )}
        </div>
      </div>
 
      <div className="domain-row-right">
        {!isAuction && (
          <span className="domain-row-price">
            ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
          </span>
        )}
        {isAuction && auction?.currentHighestBid > 0 && (
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6ec896' }}>
            Top: ₹{Number(auction.currentHighestBid).toLocaleString('en-IN')}
          </span>
        )}
        {isAuction && auction?.minBidPrice > 0 && auction?.currentHighestBid === 0 && (
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#c8a96e' }}>
            Min: ₹{Number(auction.minBidPrice).toLocaleString('en-IN')}
          </span>
        )}
 
        <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.72rem',
                       fontWeight: 600, color: s.color, background: s.bg,
                       border: `1px solid ${s.border}` }}>
          {domain.domainStatus}
        </span>
 
        {domain.takenDown && (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c86e6e',
                         background: 'rgba(200,110,110,0.1)',
                         border: '1px solid rgba(200,110,110,0.25)',
                         padding: '0.25rem 0.6rem', borderRadius: 6 }}>
            ⚠ Taken Down
          </span>
        )}
        {domain.takenDown && domain.takeDownReason && (
          <span style={{ fontSize: '0.72rem', color: '#888', fontStyle: 'italic' }}>
            Reason: {domain.takeDownReason}
          </span>
        )}
 
        {p && !isAuction && (
          <span style={{ fontSize: '0.72rem', color: p.color, fontWeight: 600 }}>
            {domain.paymentStatus === 'COMPLETED' && '✓ Paid'}
            {domain.paymentStatus === 'CREATED'   && '⏳ Pending'}
            {domain.paymentStatus === 'FAILED'    && '✕ Failed'}
          </span>
        )}
 
        {type === 'purchase' && domain.paymentStatus === 'COMPLETED' && (
          <span style={{ fontSize: '0.75rem', color: '#c8a96e',
                         background: 'rgba(200,169,110,0.1)',
                         border: '1px solid rgba(200,169,110,0.2)',
                         padding: '0.25rem 0.6rem', borderRadius: 6 }}>
            ⏳ Transfer within 24hrs
          </span>
        )}
 
        {/* Auction action buttons */}
        {type === 'listing' && isAuction && auctionId && (
          <button className="btn-secondary btn-sm domains-btn"
            onClick={() => navigate(`/auction/${auctionId}`)}
            style={{ fontSize: '0.75rem' }}>
            <Gavel size={13} /> View Auction →
          </button>
        )}
 
        {/* Verify button — only for non-auction or unverified auction drafts */}
        {type === 'listing' && domain.verified && (
          <span className="domain-row-verified">
            <ShieldCheck size={14} /> Verified
          </span>
        )}
 
        {type === 'listing' && !domain.verified && domain.domainStatus === 'AVAILABLE' && (
          <button className="btn-secondary btn-sm domains-btn" onClick={onVerify}
            style={{ fontSize: '0.75rem' }}>
            🔍 Verify
            {isAuction && auction?.status === 'DRAFT' && ' (Starts Auction)'}
          </button>
        )}
      </div>
    </div>
  );
}