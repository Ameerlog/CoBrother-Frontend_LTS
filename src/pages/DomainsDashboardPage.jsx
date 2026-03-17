import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

function StatCard({ label, value, icon, color = '#e0e0f0' }) {
  return (
    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color, fontFamily: 'Cormorant Garamond, serif' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>{label}</div>
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
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
      flexWrap: 'wrap', gap: '0.5rem',
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '1rem', color: '#e0e0f0',
                      display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {domain.domainName}{domain.domainExtension}
          {isAuction && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a06ec8',
                           background: 'rgba(160,110,200,0.1)',
                           border: '1px solid rgba(160,110,200,0.25)',
                           padding: '0.15rem 0.45rem', borderRadius: 4 }}>
              🔨 Auction
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>
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
 
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {!isAuction && (
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c8a96e' }}>
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
          <button className="btn-secondary btn-sm"
            onClick={() => navigate(`/auction/${auctionId}`)}
            style={{ fontSize: '0.75rem',
                     background: 'rgba(160,110,200,0.1)',
                     border: '1px solid rgba(160,110,200,0.3)',
                     color: '#a06ec8' }}>
            🔨 View Auction →
          </button>
        )}
 
        {/* Verify button — only for non-auction or unverified auction drafts */}
        {type === 'listing' && domain.verified && (
          <span style={{ fontSize: '0.75rem', color: '#6ec896', fontWeight: 600 }}>
            ✓ Verified
          </span>
        )}
 
        {type === 'listing' && !domain.verified && domain.domainStatus === 'AVAILABLE' && (
          <button className="btn-secondary btn-sm" onClick={onVerify}
            style={{ fontSize: '0.75rem' }}>
            🔍 Verify
            {isAuction && auction?.status === 'DRAFT' && ' (Starts Auction)'}
          </button>
        )}
      </div>
    </div>
  );
}