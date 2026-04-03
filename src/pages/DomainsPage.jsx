import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Gavel, ShoppingCart, MessageSquare, Trash2, CheckCircle } from 'lucide-react';
import { domainAPI, domainEnquiryAPI, auctionAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import { useLikes } from '../hooks/useLikes';
import LikeButton from '../components/common/LikeButton';
import { useFilterSort } from '../hooks/useFilterSort';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import SkeletonCard from '../components/common/Skeleton';
import ConfirmDialog from '../components/common/ConfirmDialog';

const DOMAIN_PRICING_OPTIONS = [
  { value: 'FIXED', label: 'Fixed Price' },
  { value: 'NEGOTIABLE', label: 'Negotiable' },
];

const STATUS_COLORS = {
  AVAILABLE: { color: '#6ec896', bg: 'rgba(110,200,150,0.1)', border: 'rgba(110,200,150,0.3)' },
  PENDING: { color: '#c8a96e', bg: 'rgba(200,169,110,0.1)', border: 'rgba(200,169,110,0.3)' },
  SOLD: { color: '#c86e6e', bg: 'rgba(200,110,110,0.1)', border: 'rgba(200,110,110,0.3)' },
};

export default function DomainsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allDomains, setAllDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [buyTarget, setBuyTarget] = useState(null);
  const [successDomain, setSuccessDomain] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [enquireTarget, setEnquireTarget] = useState(null);
  const [enquireSuccess, setEnquireSuccess] = useState(false);
  const [filterTab, setFilterTab] = useState('all');

  const { toggle: toggleLike, get: getLike } = useLikes('DOMAIN', allDomains);

  const visibleDomains = filterTab === 'mine'
    ? allDomains.filter(d => d.listedBy?.id === user?.id)
    : allDomains.filter(d =>
      d.domainStatus === "AVAILABLE" && !d.takenDown
    );

  const {
    paginated, totalCount,
    search, category, minPrice, maxPrice, sortBy,
    handleSearch, handleCategory, handleMinPrice, handleMaxPrice, handleSort,
    clearAll, activeFilterCount,
    page, totalPages, setPage,
  } = useFilterSort(visibleDomains, {
    searchFields: ['domainName', 'domainExtension'],
    priceField: 'askingPrice',
    categoryField: 'pricingDemand',
    dateField: 'createdAt',
  }, 20);

  useEffect(() => {
    setLoading(true);
    const req = filterTab === 'mine' ? domainAPI.getMyListings() : domainAPI.getAll();
    req.then(({ data }) => {
      const domains = Array.isArray(data) ? data : (data?.data ?? []);
      setAllDomains(filterTab === 'mine'
        ? domains
        : domains.filter(d => d.domainStatus === 'AVAILABLE'));
    })
      .catch(() => setAllDomains([]))
      .finally(() => setLoading(false));
  }, [filterTab]);

  useEffect(() => {
    if (filterTab !== 'mine') return;
    setLoading(true);
    domainAPI.getMyListings()
      .then(({ data }) => {
        const domains = Array.isArray(data) ? data : (data?.data ?? []);
        setAllDomains(domains);
      })
      .catch(() => setAllDomains([]))
      .finally(() => setLoading(false));
  }, [filterTab]);

  const handleDelete = async () => {
    try {
      await domainAPI.delete(deleteTarget);
      await refreshDomains();
    } catch (e) {
      const status = e.response?.status;
      const message = e.response?.data?.error;
      if (status === 403) {
        alert(message || 'You are not authorized to delete this domain listing.');
      } else if (status === 404) {
        alert(message || 'This domain was not found or may already be deleted.');
        await refreshDomains();
      } else {
        alert(message || 'Failed to remove listing. Please try again.');
      }
    } finally { setDeleteTarget(null); }
  };

  const refreshDomains = () => {
    const req = filterTab === 'mine' ? domainAPI.getMyListings() : domainAPI.getAll();
    return req.then(({ data }) => {
      const domains = Array.isArray(data) ? data : (data?.data ?? []);
      setAllDomains(filterTab === 'mine'
        ? domains
        : domains.filter(d => d.domainStatus === 'AVAILABLE'));
    });
  };

  return (
    <AppLayout>
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 m-0">Domains</h1>
            <p className="text-gray-600 mt-1">Buy and sell premium domain names.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50" onClick={() => navigate('/domains/dashboard')}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg cursor-pointer border-none" onClick={() => setShowForm(true)}>
              <Plus size={16} /> List Domain
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${filterTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50'}`}
            onClick={() => setFilterTab('all')}>All Domains</button>
          <button className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${filterTab === 'mine' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50'}`}
            onClick={() => setFilterTab('mine')}>My Listings</button>
        </div>

        {showForm && (
          <div className="mb-6">
            <DomainForm
              onSaved={d => { setAllDomains(prev => [d, ...prev]); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <FilterBar
          search={search} onSearch={handleSearch}
          category={category} onCategory={handleCategory}
          categoryOptions={DOMAIN_PRICING_OPTIONS}
          minPrice={minPrice} onMinPrice={handleMinPrice}
          maxPrice={maxPrice} onMaxPrice={handleMaxPrice}
          sortBy={sortBy} onSort={handleSort}
          onClear={clearAll} activeFilterCount={activeFilterCount}
          placeholder="Search domains by name or extension…"
          theme="light"
        />

        {!loading && allDomains.length > 0 && (
          <div className="text-sm text-gray-600 mb-4">
            {totalCount} domain{totalCount !== 1 ? 's' : ''} found
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">◇</div>
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
              {activeFilterCount > 0 ? 'No domains match your filters' :
                filterTab === 'mine' ? 'You have no active listings' :
                  'No domains listed yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeFilterCount > 0
                ? 'Try adjusting your search or filters.'
                : 'Be the first to list a domain for sale.'}
            </p>
            {activeFilterCount > 0
              ? <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-sm rounded-full cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50" onClick={clearAll}>Clear Filters</button>
              : <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700" onClick={() => setShowForm(true)}>
                List a Domain
              </button>
            }
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginated.map(d => (
                <DomainCard
                  key={d.id}
                  domain={d}
                  isOwner={d.listedBy?.id === user?.id}
                  likeState={getLike(d.id)}
                  onLike={() => toggleLike(d.id)}
                  onView={() => setDetailTarget(d)}
                  onBuy={() => setBuyTarget(d)}
                  onEnquire={() => setEnquireTarget(d)}
                  onViewAuction={() => navigate(`/auction/${d.auction?.id}`)}
                  onDelete={() => setDeleteTarget(d.id)}
                />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages}
              onPage={setPage} totalCount={totalCount} pageSize={20} />
          </>
        )}
      </div>

      {buyTarget && (
        <BuyDomainModal
          domain={buyTarget}
          onClose={() => setBuyTarget(null)}
          onSuccess={d => {
            setSuccessDomain(d);
            setBuyTarget(null);
            setAllDomains(prev => prev.map(x => x.id === d.id ? d : x));
          }}
        />
      )}

      {successDomain && (
        <PurchaseSuccessModal domain={successDomain} onClose={() => setSuccessDomain(null)} />
      )}

      {detailTarget && (
        <DomainDetailModal
          domain={detailTarget}
          isOwner={detailTarget.listedBy?.id === user?.id}
          likeState={getLike(detailTarget.id)}
          onLike={() => toggleLike(detailTarget.id)}
          onClose={() => { setDetailTarget(null); refreshDomains(); }}
          onBuy={() => { setBuyTarget(detailTarget); setDetailTarget(null); }}
          onEnquire={() => { setEnquireTarget(detailTarget); setDetailTarget(null); }}
          onViewAuction={() => {
            navigate(`/auction/${detailTarget.auction?.id}`);
            setDetailTarget(null);
          }}
        />
      )}

      {enquireTarget && (
        <DomainEnquiryModal
          domain={enquireTarget}
          user={user}
          onClose={() => setEnquireTarget(null)}
          onSuccess={() => { setEnquireTarget(null); setEnquireSuccess(true); }}
        />
      )}

      {enquireSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEnquireSuccess(false)}>
          <div className="relative w-full max-w-[420px] text-center bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(17,24,39,0.16)] p-8">
            <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none" />
            <div className="text-green-600 flex justify-center mb-4"><CheckCircle size={46} /></div>
            <h2 className="font-display text-[1.75rem] text-gray-900 mb-2">Enquiry Submitted!</h2>
            <p className="text-gray-500 mb-6">
              Our team will review your request and get back to you shortly.
            </p>
            <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700" onClick={() => setEnquireSuccess(false)}>Done</button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Domain Listing?"
        message="This will remove your domain from the marketplace. You can re-list it later."
        confirmLabel="Remove"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}

// ─── Domain Card ──────────────────────────────────────────────────────────────
function DomainCard({ domain, isOwner, onView, onBuy, onEnquire, onViewAuction,
  onDelete, likeState, onLike }) {
  const s = STATUS_COLORS[domain.domainStatus] || STATUS_COLORS.AVAILABLE;
  const isAuction = domain.saleType === 'AUCTION';
  const isHighValue = !isAuction && domain.askingPrice >= 500000;
  const auction = domain.auction;
  const auctionLive = auction?.status === 'ACTIVE' || auction?.status === 'EXTENDED';
  const domainInitials = (domain.domainName || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <div className="card-glow-hover p-5 bg-white border border-gray-200 rounded-[14px] flex flex-col gap-3 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-indigo-200" onClick={onView}>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3 mb-1">
          <div className={`w-[42px] h-[42px] border rounded-[10px] flex items-center justify-center text-lg font-bold flex-shrink-0 ${isAuction ? 'bg-purple-50 border-purple-200 text-purple-500' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
            {domainInitials}
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <h3 className="font-display text-[1.05rem] font-bold text-gray-900 mb-0.5">{domain.domainName}{domain.domainExtension}</h3>
            <span className="text-xs text-gray-500 truncate">{domain.pricingDemand}</span>
          </div>
          {isOwner && <div className="ml-auto px-2 py-0.5 bg-green-50 border border-green-200 rounded text-[0.7rem] text-green-600 flex-shrink-0">Owner</div>}
          {domain.takenDown && (
            <div className="px-2 py-0.5 bg-red-100 border border-red-300 rounded text-[0.68rem] font-bold text-red-500 flex-shrink-0">
              ⚠ Taken Down
            </div>
          )}
        </div>
        <div className="my-2 flex items-center gap-1.5 flex-wrap">
          {!isAuction && (
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
              {domain.domainStatus}
            </span>
          )}
          {domain.verified && (
            <span className="px-2.5 py-1 rounded-md text-[0.72rem] font-bold text-green-500 bg-green-50 border border-green-300">
              ✓ Verified
            </span>
          )}
          {isHighValue && domain.domainStatus === 'AVAILABLE' && (
            <span className="px-2 py-0.5 rounded text-[0.68rem] font-bold text-purple-600 bg-purple-50 border border-purple-200">
              Premium
            </span>
          )}
          {isAuction && (
            <>
              <span className="px-2 py-0.5 rounded text-[0.68rem] font-bold text-purple-600 bg-purple-50 border border-purple-200">
                🔨 Auction
              </span>
              {auction?.status === 'ACTIVE' && <span className="text-[0.68rem] text-green-500 font-bold">🟢 Live</span>}
              {auction?.status === 'EXTENDED' && <span className="text-[0.68rem] text-amber-500 font-bold">⚡ Extended</span>}
              {auction?.status === 'DRAFT' && <span className="text-[0.68rem] text-gray-500">⏳ Draft</span>}
            </>
          )}
        </div>
        {isAuction && auction ? (
          <div className="mb-2">
            {auction.currentHighestBid > 0 ? (
              <>
                <div className="text-[0.65rem] text-gray-500">Highest Bid</div>
                <div className="font-display text-[1.85rem] font-bold text-green-600 leading-tight tracking-[-0.01em]">
                  ₹{Number(auction.currentHighestBid).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-gray-500">
                  {auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''}
                </div>
              </>
            ) : (
              <>
                <div className="text-[0.65rem] text-gray-500">Starting Bid</div>
                <div className="font-display text-[1.85rem] font-bold text-gray-900 leading-tight tracking-[-0.01em]">
                  ₹{Number(auction.minBidPrice).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-green-500">No bids yet</div>
              </>
            )}
          </div>
        ) : (
          <div className="font-display text-[1.85rem] font-bold text-gray-900 leading-tight tracking-[-0.01em]">
            ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
          </div>
        )}
      </div>

      <div className="flex gap-3 text-xs text-gray-400 items-center">
        <span title="Views">👁 {domain.views || 0}</span>
        <LikeButton liked={likeState?.liked} count={likeState?.count} onToggle={onLike} />
      </div>

      <div className="flex gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
        {isOwner ? (
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 font-semibold text-xs rounded-lg cursor-pointer transition-colors hover:bg-red-100"
            onClick={e => { e.stopPropagation(); onDelete(); }}>
            <Trash2 size={14} /> Remove
          </button>
        ) : isAuction ? (
          auctionLive ? (
            <button
              onClick={e => { e.stopPropagation(); onViewAuction(); }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-purple-50 border border-purple-300 text-purple-700 font-semibold text-sm rounded-lg cursor-pointer transition-colors hover:bg-purple-600 hover:text-white hover:border-purple-600 min-h-[42px]">
              <Gavel size={14} /> Bid Now →
            </button>
          ) : (
            <span className="text-[0.8rem] text-gray-500 font-medium">
              {auction?.status === 'DRAFT' ? 'Coming Soon' :
                auction?.status === 'ENDED' ? 'Auction Ended' :
                  auction?.status === 'UNSOLD' ? 'Unsold' : 'Closed'}
            </span>
          )
        ) : domain.domainStatus === 'AVAILABLE' ? (
          isHighValue ? (
            <button
              onClick={e => { e.stopPropagation(); onEnquire(); }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-purple-400 text-gray-900 font-semibold text-sm rounded-lg cursor-pointer transition-colors hover:bg-purple-600 hover:text-white hover:border-purple-600 min-h-[42px]">
              <MessageSquare size={14} /> Enquire Now →
            </button>
          ) : (
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors hover:bg-indigo-700"
              onClick={e => { e.stopPropagation(); onBuy(); }}>
              <ShoppingCart size={14} /> Buy Now →
            </button>
          )
        ) : (
          <span className="text-[0.8rem] text-gray-500 font-medium">
            {domain.domainStatus === 'SOLD' ? 'Sold' : 'Pending'}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Domain Form ──────────────────────────────────────────────────────────────
function DomainForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    domainName: '', domainExtension: '',
    askingPrice: '', pricingDemand: '',
    saleType: 'ONE_TIME', minBidPrice: '', auctionDuration: 'SEVEN_DAYS',
    contactInfo: { email: '', phoneNumber: '' },
    agreement: { terms: false },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setContact = (k, v) =>
    setForm(f => ({ ...f, contactInfo: { ...f.contactInfo, [k]: v } }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.saleType === 'AUCTION' && (!form.minBidPrice || parseFloat(form.minBidPrice) <= 0)) {
      setError('Please enter a valid minimum bid price.');
      return;
    }
    setLoading(true); setError('');
    try {
      const { data: domain } = await domainAPI.create({
        domainName: form.domainName,
        domainExtension: form.domainExtension,
        askingPrice: form.saleType === 'AUCTION' ? 0 : parseFloat(form.askingPrice),
        pricingDemand: form.pricingDemand,
        saleType: form.saleType,
        contactInfo: form.contactInfo,
        agreement: form.agreement,
      });
      if (form.saleType === 'AUCTION' && domain.id) {
        await auctionAPI.create(domain.id, {
          minBidPrice: parseFloat(form.minBidPrice),
          duration: form.auctionDuration,
        });
      }
      onSaved(domain);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to list domain.');
    } finally { setLoading(false); }
  };

  const isAuction = form.saleType === 'AUCTION';

  const inputCls = 'px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all w-full';
  const labelCls = 'text-sm font-medium text-gray-700';

  return (
    <div className="p-8 bg-white border border-gray-200 rounded-[18px] shadow-sm">
      <h3 className="font-display text-2xl text-gray-900 font-semibold">List Your Domain</h3>
      <p className="text-gray-500 text-sm mt-1">Fill in the details to list your domain for sale.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Domain Name <span className="text-red-500">*</span></label>
          <input className={inputCls}
            value={form.domainName + form.domainExtension}
            onChange={e => {
              const full = e.target.value;
              const dot = full.indexOf('.');
              if (dot !== -1) {
                setForm(f => ({ ...f, domainName: full.slice(0, dot), domainExtension: full.slice(dot) }));
              } else {
                setForm(f => ({ ...f, domainName: full, domainExtension: '' }));
              }
            }}
            placeholder="e.g. mybrand.com" required
          />
          <span className="text-xs text-gray-500 mt-1 block">
            Include the extension (e.g. .com, .in, .io)
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Sale Type <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-3 mt-1.5">
            {[
              { value: 'ONE_TIME', label: '🛒 One-Time Sale', desc: 'Set a fixed price. Buyer pays and gets the domain.' },
              { value: 'AUCTION', label: '🔨 Auction', desc: 'Bidders compete. Highest bid wins after your chosen duration.' },
            ].map(opt => (
              <div key={opt.value}
                onClick={() => setForm(f => ({ ...f, saleType: opt.value }))}
                className={`p-3.5 rounded-lg cursor-pointer border-2 transition-all duration-150 ${form.saleType === opt.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white'
                  }`}>
                <div className={`font-semibold text-sm mb-1 ${form.saleType === opt.value ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                  {opt.label}
                </div>
                <div className="text-xs text-gray-500 leading-snug">{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {!isAuction && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Asking Price (₹) <span className="text-red-500">*</span></label>
                <input className={inputCls} type="number" min="0" value={form.askingPrice}
                  onChange={e => setForm(f => ({ ...f, askingPrice: e.target.value }))}
                  placeholder="e.g. 50000" required={!isAuction} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Pricing Type <span className="text-red-500">*</span></label>
                <select className={inputCls} value={form.pricingDemand}
                  onChange={e => setForm(f => ({ ...f, pricingDemand: e.target.value }))} required={!isAuction}>
                  <option value="">Select pricing type</option>
                  <option value="FIXED">Fixed Price</option>
                  <option value="NEGOTIABLE">Negotiable</option>
                </select>
              </div>
            </>
          )}
        </div>

        {isAuction && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Minimum Bid (₹) <span className="text-red-500">*</span></label>
                <input className={inputCls} type="number" min="1" value={form.minBidPrice}
                  onChange={e => setForm(f => ({ ...f, minBidPrice: e.target.value }))}
                  placeholder="e.g. 5000" required />
                <span className="text-[0.72rem] text-gray-500 mt-1 block">
                  Each subsequent bid must be at least 5% higher.
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Auction Duration <span className="text-red-500">*</span></label>
                <select className={inputCls} value={form.auctionDuration}
                  onChange={e => setForm(f => ({ ...f, auctionDuration: e.target.value }))}>
                  <option value="ONE_DAY">1 Day</option>
                  <option value="SEVEN_DAYS">7 Days</option>
                  <option value="FIFTEEN_DAYS">15 Days</option>
                  <option value="THIRTY_DAYS">30 Days</option>
                </select>
              </div>
            </div>
            <div className="p-3.5 bg-amber-100 border border-amber-400 rounded-lg text-[0.82rem] text-amber-900 leading-relaxed">
              ⚡ Auction domains go live only after domain verification (≈15 mins). Your listing
              stays in <strong>Draft</strong> until verification is complete, then the auction
              timer starts automatically.
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Contact Email <span className="text-red-500">*</span></label>
            <input className={inputCls} type="email" value={form.contactInfo.email}
              onChange={e => setContact('email', e.target.value)}
              placeholder="your@email.com" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Phone</label>
            <input className={inputCls} value={form.contactInfo.phoneNumber}
              onChange={e => setContact('phoneNumber', e.target.value)}
              placeholder="10-digit number" maxLength={10} />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 mt-0.5 cursor-pointer accent-indigo-600 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0" checked={form.agreement.terms}
            onChange={e => setForm(f => ({ ...f, agreement: { terms: e.target.checked } }))}
            required />
          <span className="text-sm text-gray-700">I confirm I own this domain and agree to the Terms & Conditions.</span>
        </label>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex gap-3 mt-2">
          <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> :
              isAuction ? 'List for Auction →' : 'List Domain →'}
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent text-gray-500 font-semibold text-sm rounded-[10px] border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ─── Buy Domain Modal ─────────────────────────────────────────────────────────
function BuyDomainModal({ domain, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuy = async () => {
    setLoading(true); setError('');
    try {
      const { data: orderData } = await domainAPI.createOrder(domain.id);
      const options = {
        key: orderData.keyId, amount: orderData.amount * 100, currency: orderData.currency,
        name: 'CoBrother', description: `Purchase ${domain.domainName}${domain.domainExtension}`,
        order_id: orderData.orderId,
        handler: async response => {
          try {
            await domainAPI.verifyPayment(domain.id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess({ ...domain, domainStatus: 'SOLD', paymentStatus: 'COMPLETED' });
          } catch { setError('Payment verification failed. Contact support.'); setLoading(false); }
        },
        modal: { ondismiss: async () => { await domainAPI.handleFailure(domain.id); setLoading(false); } },
        prefill: {}, theme: { color: '#c8a96e' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async () => {
        await domainAPI.handleFailure(domain.id);
        setError('Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) { setError(err.response?.data || 'Failed to initiate payment.'); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[480px] bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none" />
        <button className="absolute top-4 right-4 z-20 bg-transparent border-none text-gray-400 text-xl cursor-pointer transition-colors hover:text-gray-700" onClick={onClose}>✕</button>
        <div className="mb-6">
          <div className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-[0.72rem] font-semibold text-indigo-600 uppercase tracking-wide mb-2">Domain Purchase</div>
          <h2 className="font-display text-[1.75rem] font-semibold text-gray-900 mb-1">{domain.domainName}{domain.domainExtension}</h2>
          <p className="text-sm text-gray-500">{domain.pricingDemand}</p>
        </div>
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-lg text-[0.82rem] text-green-800 leading-relaxed mb-3">
          ⏳ A confirmation email has been sent. The seller will initiate the domain transfer
          within <strong>24 hours</strong>.
        </div>
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-[0.82rem] text-amber-800 leading-relaxed mb-5">
          ⏳ After payment, you will be updated within <strong>24 hours</strong> with transfer details.
        </div>
        {error && <div className="text-sm text-red-500 mb-4">{error}</div>}
        <div className="flex gap-3">
          <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleBuy} disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> :
              `Pay ₹${Number(domain.askingPrice).toLocaleString('en-IN')} →`}
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent text-gray-500 font-semibold text-sm rounded-[10px] border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Purchase Success Modal ───────────────────────────────────────────────────
function PurchaseSuccessModal({ domain, onClose }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[440px] text-center bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none" />
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="font-display text-[1.75rem] font-semibold text-gray-900 mb-2">Purchase Successful!</h2>
        <p className="text-gray-500 mb-5">
          You've successfully purchased{' '}
          <strong className="text-gray-900">{domain.domainName}{domain.domainExtension}</strong>
        </p>
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-[0.82rem] text-amber-800 leading-relaxed mb-6">
          ⏳ A confirmation email has been sent. The seller will initiate the domain transfer
          within <strong>24 hours</strong>.
        </div>
        <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// ─── Domain Detail Modal ──────────────────────────────────────────────────────
function DomainDetailModal({ domain, isOwner, onClose, onBuy, onEnquire,
  onViewAuction, likeState, onLike }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    domainAPI.get(domain.id)
      .then(({ data }) => setDetail(data?.data ?? data))
      .catch(() => setDetail(domain))
      .finally(() => setLoading(false));
  }, [domain.id]);

  const d = detail || domain;
  const c = d.contactInfo || {};
  const s = STATUS_COLORS[d.domainStatus] || STATUS_COLORS.AVAILABLE;
  const isAuction = d.saleType === 'AUCTION';
  const isHighValue = !isAuction && d.askingPrice >= 500000;
  const auction = d.auction;
  const auctionLive = auction?.status === 'ACTIVE' || auction?.status === 'EXTENDED';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(17,24,39,0.16)] p-8">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none" />
        <button className="absolute top-4 right-4 z-20 bg-transparent border-none text-gray-400 text-xl cursor-pointer transition-colors hover:text-gray-700" onClick={onClose}>✕</button>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-7 h-7 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-[0.72rem] font-semibold text-indigo-600 uppercase tracking-wide">{isAuction ? '🔨 Auction' : 'Domain'}</div>
                {d.verified && (
                  <span className="px-2 py-0.5 rounded text-[0.68rem] font-bold text-green-600 bg-green-50 border border-green-300">
                    ✓ Verified
                  </span>
                )}
                {isHighValue && (
                  <span className="px-2 py-0.5 rounded text-[0.68rem] font-bold text-purple-600 bg-purple-50 border border-purple-200">
                    Premium
                  </span>
                )}
              </div>
              <h2 className="font-display text-[1.75rem] font-semibold text-gray-900 mb-1">{d.domainName}{d.domainExtension}</h2>
              <p className="text-sm text-gray-500">{d.pricingDemand}</p>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {isAuction && auction ? (
                <>
                  <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-[0.82rem] text-green-800">
                    {auction.currentHighestBid > 0
                      ? `🏆 ₹${Number(auction.currentHighestBid).toLocaleString('en-IN')}`
                      : `🔨 Min ₹${Number(auction.minBidPrice).toLocaleString('en-IN')}`}
                  </div>
                  <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[0.82rem] text-gray-600">
                    📋 {auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''}
                  </div>
                </>
              ) : (
                <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-[0.82rem] text-green-800">
                  💰 ₹{Number(d.askingPrice).toLocaleString('en-IN')}
                </div>
              )}
              <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[0.82rem] text-gray-600">
                👁 {d.views || 0} views
              </div>
              {!isAuction && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                  {d.domainStatus}
                </span>
              )}
            </div>

            {isAuction && auction && (
              <Section title="Auction Info">
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem label="Status"
                    value={auction.status === 'ACTIVE' ? '🟢 Live' :
                      auction.status === 'EXTENDED' ? '⚡ Extended' :
                        auction.status === 'DRAFT' ? '⏳ Pending Verification' :
                          auction.status} />
                  <DetailItem label="Duration" value={auction.duration?.replace(/_/g, ' ')} />
                  {auction.endTime && (
                    <DetailItem label="Ends"
                      value={new Date(
                        auction.endTime.endsWith('Z') ? auction.endTime : auction.endTime + 'Z'
                      ).toLocaleDateString('en-IN',
                        { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} />
                  )}
                  {auction.currentHighestBid > 0 && (
                    <DetailItem label="Next Min Bid"
                      value={`₹${Number(auction.currentHighestBid * 1.05)
                        .toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                  )}
                </div>
              </Section>
            )}

            {isHighValue && !isOwner && d.domainStatus === 'AVAILABLE' && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-lg mb-5 text-[0.83rem] text-purple-700">
                ❆ This is a premium domain. Submit an enquiry and our team will facilitate
                the transaction.
              </div>
            )}

            {(c.email || c.phoneNumber) && (
              <Section title="Contact">
                <div className="grid grid-cols-2 gap-3">
                  {c.email && <DetailItem label="Email" value={c.email} />}
                  {c.phoneNumber && <DetailItem label="Phone" value={c.phoneNumber} />}
                </div>
              </Section>
            )}

            {d.listedBy && (
              <Section title="Listed By">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-600">
                    {d.listedBy.firstname?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="font-semibold text-gray-900 text-[0.9rem]">
                    {d.listedBy.firstname} {d.listedBy.lastname}
                  </div>
                </div>
              </Section>
            )}

            <div className="flex gap-3 mt-6 flex-wrap items-center">
              {!isOwner && (
                isAuction ? (
                  auctionLive ? (
                    <button
                      onClick={onViewAuction}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-purple-50 border border-purple-300 text-purple-700 font-semibold text-sm rounded-lg cursor-pointer transition-colors hover:bg-purple-600 hover:text-white hover:border-purple-600">
                      🔨 Go to Auction →
                    </button>
                  ) : null
                ) : d.domainStatus === 'AVAILABLE' ? (
                  isHighValue ? (
                    <button
                      onClick={onEnquire}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-white border border-purple-400 text-gray-900 font-semibold text-sm rounded-lg cursor-pointer transition-colors hover:bg-purple-600 hover:text-white hover:border-purple-600">
                      Enquire Now →
                    </button>
                  ) : (
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700" onClick={onBuy}>Buy Now →</button>
                  )
                ) : null
              )}
              <LikeButton liked={likeState?.liked} count={likeState?.count}
                onToggle={onLike} size="md" />
              <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent text-gray-500 font-semibold text-sm rounded-[10px] border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100" onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Domain Enquiry Modal ─────────────────────────────────────────────────────
function DomainEnquiryModal({ domain, user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    fullName: `${user?.firstname || ''} ${user?.lastname || ''}`.trim(),
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Correct signature: (domainId, { fullName, email, phone, message })
      await domainEnquiryAPI.submit(domain.id, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit enquiry.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[500px] bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none" />
        <button className="absolute top-4 right-4 z-20 bg-transparent border-none text-gray-400 text-xl cursor-pointer transition-colors hover:text-gray-700" onClick={onClose}>✕</button>
        <div className="mb-6">
          <div className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-[0.72rem] font-semibold text-indigo-600 uppercase tracking-wide mb-2">Domain Enquiry</div>
          <h2 className="font-display text-[1.75rem] font-semibold text-gray-900 mb-1">{domain.domainName}{domain.domainExtension}</h2>
          <p className="text-sm text-gray-500">₹{Number(domain.askingPrice).toLocaleString('en-IN')} · {domain.pricingDemand}</p>
        </div>
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg mb-5 text-[0.83rem] text-amber-800">
          ⚡ For high-value domains, our team will facilitate the transaction.
          Fill in your details and we'll be in touch shortly.
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
            <input className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all" value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Your full name" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
              <input className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
              <input className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit number" maxLength={10} required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Message / Reason for Enquiry <span className="text-red-500">*</span></label>
            <textarea className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all resize-vertical" value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Tell us why you're interested and any specific requirements…"
              rows={4} required />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <div className="flex gap-3 mt-1">
            <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : 'Submit Enquiry →'}
            </button>
            <button type="button" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent text-gray-500 font-semibold text-sm rounded-[10px] border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <div className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="border border-gray-200 bg-white rounded-[10px] p-2.5">
      <div className="text-[0.72rem] text-gray-500 font-bold uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[0.95rem] text-gray-900 font-semibold">{value}</div>
    </div>
  );
}