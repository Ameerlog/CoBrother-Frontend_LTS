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
      <div className="container mx-auto p-4 pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-0">Domains Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your domain listings and purchases.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50" onClick={() => navigate('/domains')}>
            <ArrowLeft size={16} /> Back to Domains
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-gray-600 mb-2">Total Listings</div>
            <div className="text-2xl font-bold font-display">{listings.length}</div>
            <div className="text-xs text-gray-600 font-semibold mt-1">Listings</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-gray-600 mb-2">Active</div>
            <div className="text-2xl font-bold font-display">{listings.filter(d => d.domainStatus === 'AVAILABLE').length}</div>
            <div className="text-xs text-gray-600 font-semibold mt-1">Active Listings</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-gray-600 mb-2">Sold</div>
            <div className="text-2xl font-bold font-display">{listings.filter(d => d.domainStatus === 'SOLD').length}</div>
            <div className="text-xs text-gray-600 font-semibold mt-1">Sold Listings</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-gray-600 mb-2">Revenue</div>
            <div className="text-2xl font-bold font-display">₹{Number(totalRevenue).toLocaleString('en-IN')}</div>
            <div className="text-xs text-gray-600 font-semibold mt-1">Total Revenue</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-gray-600 mb-2">Purchased</div>
            <div className="text-2xl font-bold font-display">{purchases.length}</div>
            <div className="text-xs text-gray-600 font-semibold mt-1">Purchases</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-gray-600 mb-2">Total Spent</div>
            <div className="text-2xl font-bold font-display">₹{Number(totalSpent).toLocaleString('en-IN')}</div>
            <div className="text-xs text-gray-600 font-semibold mt-1">Total Spent</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${tab === 'listings' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50'}`} onClick={() => setTab('listings')}>
            My Listings ({listings.length})
          </button>
          <button className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${tab === 'purchases' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50'}`} onClick={() => setTab('purchases')}>
            My Purchases ({purchases.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" /></div>
        ) : tab === 'listings' ? (
          listings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">◇</div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">List your first domain to start selling.</p>
              <button className="px-5 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg border-none cursor-pointer" onClick={() => navigate('/domains')}>List a Domain</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
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
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">No purchases yet</h3>
              <p className="text-gray-600 mb-6">Browse domains and make your first purchase.</p>
              <button className="px-5 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg border-none cursor-pointer" onClick={() => navigate('/domains')}>Browse Domains</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
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

function DomainRow({ domain, type, onVerify }) {
  const navigate = useNavigate();  
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
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-[10px] px-5 py-4 gap-3 transition-all hover:-translate-y-px hover:shadow-lg">
      <div>
        <div className="font-bold text-gray-900 text-base flex items-center gap-2">
          {domain.domainName}{domain.domainExtension}
          {isAuction && (
            <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full">
              <Gavel size={13} /> Auction
            </span>
          )}
        </div>
        <div className="text-[0.8rem] text-gray-500 mt-0.5">
          {domain.pricingDemand}
          {isAuction && auction && (
            <span style={{ marginLeft: '0.5rem', color: AUCTION_STATUS_COLORS[auction.status] || '#888' }}>
              · {auction.status}
              {auction.status === 'ACTIVE' || auction.status === 'EXTENDED'
                ? ` · ${auction.totalBids} bid${auction.totalBids !== 1 ? 's' : ''}`
                : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {!isAuction && (
          <span className="text-[0.95rem] font-bold text-gray-900">
            ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
          </span>
        )}
        {isAuction && auction?.currentHighestBid > 0 && (
          <span className="text-[0.875rem] font-bold text-green-600">
            Top: ₹{Number(auction.currentHighestBid).toLocaleString('en-IN')}
          </span>
        )}
        {isAuction && auction?.minBidPrice > 0 && auction?.currentHighestBid === 0 && (
          <span className="text-[0.875rem] font-bold text-amber-600">
            Min: ₹{Number(auction.minBidPrice).toLocaleString('en-IN')}
          </span>
        )}

        <span className="px-2.5 py-1 rounded-md text-[0.72rem] font-semibold" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
          {domain.domainStatus}
        </span>

        {domain.takenDown && (
          <span className="text-[0.72rem] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
            ⚠ Taken Down
          </span>
        )}
        {domain.takenDown && domain.takeDownReason && (
          <span className="text-[0.72rem] text-gray-400 italic">
            Reason: {domain.takeDownReason}
          </span>
        )}

        {p && !isAuction && (
          <span className="text-[0.72rem] font-semibold" style={{ color: p.color }}>
            {domain.paymentStatus === 'COMPLETED' && '✓ Paid'}
            {domain.paymentStatus === 'CREATED'   && '⏳ Pending'}
            {domain.paymentStatus === 'FAILED'    && '✕ Failed'}
          </span>
        )}

        {type === 'purchase' && domain.paymentStatus === 'COMPLETED' && (
          <span className="text-[0.75rem] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
            ⏳ Transfer within 24hrs
          </span>
        )}

        {/* Auction action buttons */}
        {type === 'listing' && isAuction && auctionId && (
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-xs rounded-full cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50"
            onClick={() => navigate(`/auction/${auctionId}`)}>
            <Gavel size={13} /> View Auction →
          </button>
        )}

        {/* Verify button — only for non-auction or unverified auction drafts */}
        {type === 'listing' && domain.verified && (
          <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md">
            <ShieldCheck size={14} /> Verified
          </span>
        )}

        {type === 'listing' && !domain.verified && domain.domainStatus === 'AVAILABLE' && (
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-xs rounded-full cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50" onClick={onVerify}>
            🔍 Verify
            {isAuction && auction?.status === 'DRAFT' && ' (Starts Auction)'}
          </button>
        )}
      </div>
    </div>
  );
}