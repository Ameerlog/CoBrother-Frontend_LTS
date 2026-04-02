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
  { value: 'FIXED',      label: 'Fixed Price' },
  { value: 'NEGOTIABLE', label: 'Negotiable'  },
];

const STATUS_COLORS = {
  AVAILABLE: { color: '#6ec896', bg: 'rgba(110,200,150,0.1)', border: 'rgba(110,200,150,0.3)' },
  PENDING:   { color: '#c8a96e', bg: 'rgba(200,169,110,0.1)', border: 'rgba(200,169,110,0.3)' },
  SOLD:      { color: '#c86e6e', bg: 'rgba(200,110,110,0.1)', border: 'rgba(200,110,110,0.3)' },
};

export default function DomainsPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [allDomains, setAllDomains]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [buyTarget, setBuyTarget]           = useState(null);
  const [successDomain, setSuccessDomain]   = useState(null);
  const [detailTarget, setDetailTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [enquireTarget, setEnquireTarget]   = useState(null);
  const [enquireSuccess, setEnquireSuccess] = useState(false);
  const [filterTab, setFilterTab]           = useState('all');

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
    searchFields:  ['domainName', 'domainExtension'],
    priceField:    'askingPrice',
    categoryField: 'pricingDemand',
    dateField:     'createdAt',
  }, 20);

  useEffect(() => {
    setLoading(true);
    domainAPI.getAll()
      .then(({ data }) => setAllDomains(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setAllDomains([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await domainAPI.delete(deleteTarget);
      setAllDomains(d => d.filter(x => x.id !== deleteTarget));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to remove listing.');
    } finally { setDeleteTarget(null); }
  };

  const refreshDomains = () =>
    domainAPI.getAll()
      .then(({ data }) => setAllDomains(Array.isArray(data) ? data : (data?.data ?? [])));

  return (
    <AppLayout>
      <div className="ventures-page domains-page domains-main-page">
        <div className="page-header domains-header">
          <div>
            <h1>Domains</h1>
            <p>Buy and sell premium domain names.</p>
          </div>
          <div className="domains-header-actions">
            <button className="btn-secondary domains-btn" onClick={() => navigate('/domains/dashboard')}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button className="btn-primary domains-btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> List Domain
            </button>
          </div>
        </div>

        <div className="filter-tabs">
          <button className={`filter-tab ${filterTab === 'all'  ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}>All Domains</button>
          <button className={`filter-tab ${filterTab === 'mine' ? 'active' : ''}`}
            onClick={() => setFilterTab('mine')}>My Listings</button>
        </div>

        {showForm && (
          <div className="community-form-section">
            <DomainForm
              onSaved={d => { setAllDomains(prev => [d, ...prev]); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <FilterBar
          search={search}           onSearch={handleSearch}
          category={category}       onCategory={handleCategory}
          categoryOptions={DOMAIN_PRICING_OPTIONS}
          minPrice={minPrice}       onMinPrice={handleMinPrice}
          maxPrice={maxPrice}       onMaxPrice={handleMaxPrice}
          sortBy={sortBy}           onSort={handleSort}
          onClear={clearAll}        activeFilterCount={activeFilterCount}
          placeholder="Search domains by name or extension…"
          theme="light"
        />

        {!loading && allDomains.length > 0 && (
          <div className="domains-result-count">
            {totalCount} domain{totalCount !== 1 ? 's' : ''} found
          </div>
        )}

        {loading ? (
          <div className="ventures-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◇</div>
            <h3>
              {activeFilterCount > 0 ? 'No domains match your filters' :
               filterTab === 'mine' ? 'You have no active listings' :
               'No domains listed yet'}
            </h3>
            <p>
              {activeFilterCount > 0
                ? 'Try adjusting your search or filters.'
                : 'Be the first to list a domain for sale.'}
            </p>
            {activeFilterCount > 0
              ? <button className="btn-secondary domains-btn" onClick={clearAll}>Clear Filters</button>
              : <button className="btn-primary domains-btn-primary" onClick={() => setShowForm(true)}>
                  List a Domain
                </button>
            }
          </div>
        ) : (
          <>
            <div className="ventures-grid">
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
        <div className="modal-overlay" onClick={() => setEnquireSuccess(false)}>
          <div className="modal-card domains-light-modal" style={{ maxWidth: 420, textAlign: 'center' }}>
            <div className="modal-glow" />
            <div className="domain-success-icon"><CheckCircle size={46} /></div>
            <h2 className="domain-success-title">Enquiry Submitted!</h2>
            <p className="domain-success-text">
              Our team will review your request and get back to you shortly.
            </p>
            <button className="btn-primary" onClick={() => setEnquireSuccess(false)}
              style={{ width: '100%' }}>Done</button>
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
  const s           = STATUS_COLORS[domain.domainStatus] || STATUS_COLORS.AVAILABLE;
  const isAuction   = domain.saleType === 'AUCTION';
  const isHighValue = !isAuction && domain.askingPrice >= 500000;
  const auction     = domain.auction;
  const auctionLive = auction?.status === 'ACTIVE' || auction?.status === 'EXTENDED';
  const domainInitials = (domain.domainName || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <div className="venture-card venture-card-pro domain-card-pro" onClick={onView} style={{ cursor: 'pointer' }}>
      <div className="venture-card-left">
        <div className="venture-card-top">
          <div className="venture-logo-placeholder"
               style={{ fontSize: '1.1rem', fontWeight: 700,
                        color: isAuction ? '#a06ec8' : '#c8a96e' }}>
            {domainInitials}
          </div>
          <div className="venture-card-meta">
            <h3 className="venture-name">{domain.domainName}{domain.domainExtension}</h3>
            <span className="venture-type">{domain.pricingDemand}</span>
          </div>
          {isOwner && <div className="owner-badge">Owner</div>}
          {domain.takenDown && (
            <div style={{ padding: '0.2rem 0.5rem', background: 'rgba(200,110,110,0.15)',
                          border: '1px solid rgba(200,110,110,0.3)', borderRadius: 4,
                          fontSize: '0.68rem', fontWeight: 700, color: '#c86e6e' }}>
              ⚠ Taken Down
            </div>
          )}
        </div>
        <div style={{ margin: '0.5rem 0 0.5rem', display: 'flex',
                      alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {!isAuction && (
            <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem',
                           fontWeight: 600, color: s.color, background: s.bg,
                           border: `1px solid ${s.border}` }}>
              {domain.domainStatus}
            </span>
          )}
          {domain.verified && (
            <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.72rem',
                           fontWeight: 700, color: '#6ec896', background: 'rgba(110,200,150,0.1)',
                           border: '1px solid rgba(110,200,150,0.3)' }}>
              ✓ Verified
            </span>
          )}
          {isHighValue && domain.domainStatus === 'AVAILABLE' && (
            <span style={{ padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.68rem',
                           fontWeight: 700, color: '#a06ec8',
                           background: 'rgba(160,110,200,0.1)',
                           border: '1px solid rgba(160,110,200,0.25)' }}>
              Premium
            </span>
          )}
          {isAuction && (
            <>
              <span style={{ padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.68rem',
                             fontWeight: 700, color: '#a06ec8',
                             background: 'rgba(160,110,200,0.1)',
                             border: '1px solid rgba(160,110,200,0.25)' }}>
                🔨 Auction
              </span>
              {auction?.status === 'ACTIVE'   && <span style={{ fontSize: '0.68rem', color: '#6ec896', fontWeight: 700 }}>🟢 Live</span>}
              {auction?.status === 'EXTENDED' && <span style={{ fontSize: '0.68rem', color: '#c8a96e', fontWeight: 700 }}>⚡ Extended</span>}
              {auction?.status === 'DRAFT'    && <span style={{ fontSize: '0.68rem', color: '#888' }}>⏳ Draft</span>}
            </>
          )}
        </div>
        {isAuction && auction ? (
          <div style={{ marginBottom: '0.5rem' }}>
            {auction.currentHighestBid > 0 ? (
              <>
                <div style={{ fontSize: '0.65rem', color: '#888' }}>Highest Bid</div>
                <div className="venture-deal" style={{ color: '#6ec896' }}>
                  ₹{Number(auction.currentHighestBid).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#888' }}>
                  {auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.65rem', color: '#888' }}>Starting Bid</div>
                <div className="venture-deal">
                  ₹{Number(auction.minBidPrice).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6ec896' }}>No bids yet</div>
              </>
            )}
          </div>
        ) : (
          <div className="venture-deal">
            ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
          </div>
        )}
      </div>

      <div className="venture-card-center">
        <div className="venture-stats venture-stats-row">
          <span title="Views">👁 {domain.views || 0}</span>
          <LikeButton liked={likeState?.liked} count={likeState?.count} onToggle={onLike} />
        </div>
      </div>

      <div className="venture-card-right">
        <div className="venture-card-actions venture-card-actions-pro" onClick={e => e.stopPropagation()}>
          {isOwner ? (
              <button className="btn-danger btn-sm"
              onClick={e => { e.stopPropagation(); onDelete(); }}>
              <Trash2 size={14} /> Remove
            </button>
          ) : isAuction ? (
            auctionLive ? (
              <button
                onClick={e => { e.stopPropagation(); onViewAuction(); }}
                className="domain-auction-btn">
                <Gavel size={14} /> Bid Now →
              </button>
            ) : (
              <span className="domain-muted-status">
                {auction?.status === 'DRAFT'  ? 'Coming Soon' :
                 auction?.status === 'ENDED'  ? 'Auction Ended' :
                 auction?.status === 'UNSOLD' ? 'Unsold' : 'Closed'}
              </span>
            )
          ) : domain.domainStatus === 'AVAILABLE' ? (
            isHighValue ? (
              <button
                onClick={e => { e.stopPropagation(); onEnquire(); }}
                className="domain-enquire-btn">
                <MessageSquare size={14} /> Enquire Now →
              </button>
            ) : (
              <button className="btn-primary btn-sm"
                onClick={e => { e.stopPropagation(); onBuy(); }}>
                <ShoppingCart size={14} /> Buy Now →
              </button>
            )
          ) : (
            <span className="domain-muted-status">
              {domain.domainStatus === 'SOLD' ? 'Sold' : 'Pending'}
            </span>
          )}
        </div>
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
  const [error, setError]     = useState('');

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
        domainName:      form.domainName,
        domainExtension: form.domainExtension,
        askingPrice:     form.saleType === 'AUCTION' ? 0 : parseFloat(form.askingPrice),
        pricingDemand:   form.pricingDemand,
        saleType:        form.saleType,
        contactInfo:     form.contactInfo,
        agreement:       form.agreement,
      });
      if (form.saleType === 'AUCTION' && domain.id) {
        await auctionAPI.create(domain.id, {
          minBidPrice: parseFloat(form.minBidPrice),
          duration:    form.auctionDuration,
        });
      }
      onSaved(domain);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to list domain.');
    } finally { setLoading(false); }
  };

  const isAuction = form.saleType === 'AUCTION';

  return (
    <div className="community-form-card">
      <h3>List Your Domain</h3>
      <p className="form-subtext">Fill in the details to list your domain for sale.</p>
      <form onSubmit={handleSubmit} className="venture-form" style={{ marginTop: '1.25rem' }}>
        <div className="form-group">
          <label>Domain Name <span className="required">*</span></label>
          <input
            value={form.domainName + form.domainExtension}
            onChange={e => {
              const full = e.target.value;
              const dot  = full.indexOf('.');
              if (dot !== -1) {
                setForm(f => ({ ...f, domainName: full.slice(0, dot), domainExtension: full.slice(dot) }));
              } else {
                setForm(f => ({ ...f, domainName: full, domainExtension: '' }));
              }
            }}
            placeholder="e.g. mybrand.com" required
          />
          <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.3rem', display: 'block' }}>
            Include the extension (e.g. .com, .in, .io)
          </span>
        </div>

        <div className="form-group">
          <label>Sale Type <span className="required">*</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.35rem' }}>
            {[
              { value: 'ONE_TIME', label: '🛒 One-Time Sale', desc: 'Set a fixed price. Buyer pays and gets the domain.' },
              { value: 'AUCTION',  label: '🔨 Auction',       desc: 'Bidders compete. Highest bid wins after your chosen duration.' },
            ].map(opt => (
              <div key={opt.value}
                onClick={() => setForm(f => ({ ...f, saleType: opt.value }))}
                style={{
                  padding: '0.875rem 1rem', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${form.saleType === opt.value ? 'rgba(200,169,110,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  background: form.saleType === opt.value ? 'rgba(200,169,110,0.08)' : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.15s',
                }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem',
                              color: form.saleType === opt.value ? '#c8a96e' : '#c0c0d0', marginBottom: '0.3rem' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.4 }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          {!isAuction && (
            <div className="form-group">
              <label>Asking Price (₹) <span className="required">*</span></label>
              <input type="number" min="0" value={form.askingPrice}
                onChange={e => setForm(f => ({ ...f, askingPrice: e.target.value }))}
                placeholder="e.g. 50000" required={!isAuction} />
            </div>
          )}
          <div className="form-group">
            <label>Pricing Type <span className="required">*</span></label>
            <select value={form.pricingDemand}
              onChange={e => setForm(f => ({ ...f, pricingDemand: e.target.value }))} required>
              <option value="">Select pricing type</option>
              <option value="FIXED">Fixed Price</option>
              <option value="NEGOTIABLE">Negotiable</option>
            </select>
          </div>
        </div>

        {isAuction && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Minimum Bid (₹) <span className="required">*</span></label>
                <input type="number" min="1" value={form.minBidPrice}
                  onChange={e => setForm(f => ({ ...f, minBidPrice: e.target.value }))}
                  placeholder="e.g. 5000" required />
                <span style={{ fontSize: '0.72rem', color: '#888', marginTop: '0.3rem', display: 'block' }}>
                  Each subsequent bid must be at least 5% higher.
                </span>
              </div>
              <div className="form-group">
                <label>Auction Duration <span className="required">*</span></label>
                <select value={form.auctionDuration}
                  onChange={e => setForm(f => ({ ...f, auctionDuration: e.target.value }))}>
                  <option value="ONE_DAY">1 Day</option>
                  <option value="SEVEN_DAYS">7 Days</option>
                  <option value="FIFTEEN_DAYS">15 Days</option>
                  <option value="THIRTY_DAYS">30 Days</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '0.875rem 1rem', background: 'rgba(200,169,110,0.08)',
                          border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8,
                          fontSize: '0.82rem', color: '#c8a96e', lineHeight: 1.5 }}>
              ⚡ Auction domains go live only after domain verification (≈15 mins). Your listing
              stays in <strong>Draft</strong> until verification is complete, then the auction
              timer starts automatically.
            </div>
          </>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Contact Email <span className="required">*</span></label>
            <input type="email" value={form.contactInfo.email}
              onChange={e => setContact('email', e.target.value)}
              placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.contactInfo.phoneNumber}
              onChange={e => setContact('phoneNumber', e.target.value)}
              placeholder="10-digit number" maxLength={10} />
          </div>
        </div>

        <label className="checkbox-label">
          <input type="checkbox" checked={form.agreement.terms}
            onChange={e => setForm(f => ({ ...f, agreement: { terms: e.target.checked } }))}
            required />
          <span>I confirm I own this domain and agree to the Terms & Conditions.</span>
        </label>

        {error && <div className="form-error">{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
            {loading ? <span className="btn-spinner" /> :
              isAuction ? 'List for Auction →' : 'List Domain →'}
          </button>
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ─── Buy Domain Modal ─────────────────────────────────────────────────────────
function BuyDomainModal({ domain, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

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
              razorpayOrderId:   response.razorpay_order_id,
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 480 }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-badge">Domain Purchase</div>
          <h2>{domain.domainName}{domain.domainExtension}</h2>
          <p>{domain.pricingDemand}</p>
        </div>
        <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(110,200,150,0.08)',
                      border: '1px solid rgba(110,200,150,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>Purchase Price</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#6ec896',
                        fontFamily: 'Cormorant Garamond, serif' }}>
            ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
          </div>
        </div>
        <div style={{ padding: '0.875rem 1rem', background: 'rgba(200,169,110,0.08)',
                      border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8,
                      marginBottom: '1.5rem', fontSize: '0.875rem', color: '#c8a96e' }}>
          ⏳ After payment, you will be updated within <strong>24 hours</strong> with transfer details.
        </div>
        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={handleBuy} disabled={loading} style={{ flex: 1 }}>
            {loading ? <span className="btn-spinner" /> :
              `Pay ₹${Number(domain.askingPrice).toLocaleString('en-IN')} →`}
          </button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Purchase Success Modal ───────────────────────────────────────────────────
function PurchaseSuccessModal({ domain, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 440, textAlign: 'center' }}>
        <div className="modal-glow" />
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem',
                     marginBottom: '0.5rem' }}>Purchase Successful!</h2>
        <p style={{ color: '#a0a0b0', marginBottom: '1.5rem' }}>
          You've successfully purchased{' '}
          <strong style={{ color: '#e0e0f0' }}>{domain.domainName}{domain.domainExtension}</strong>
        </p>
        <div style={{ padding: '1rem', background: 'rgba(200,169,110,0.08)',
                      border: '1px solid rgba(200,169,110,0.2)', borderRadius: 10,
                      marginBottom: '1.5rem', fontSize: '0.875rem', color: '#c8a96e' }}>
          ⏳ A confirmation email has been sent. The seller will initiate the domain transfer
          within <strong>24 hours</strong>.
        </div>
        <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>Done</button>
      </div>
    </div>
  );
}

// ─── Domain Detail Modal ──────────────────────────────────────────────────────
function DomainDetailModal({ domain, isOwner, onClose, onBuy, onEnquire,
                              onViewAuction, likeState, onLike }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched            = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    domainAPI.get(domain.id)
      .then(({ data }) => setDetail(data?.data ?? data))
      .catch(() => setDetail(domain))
      .finally(() => setLoading(false));
  }, [domain.id]);

  const d           = detail || domain;
  const c           = d.contactInfo || {};
  const s           = STATUS_COLORS[d.domainStatus] || STATUS_COLORS.AVAILABLE;
  const isAuction   = d.saleType === 'AUCTION';
  const isHighValue = !isAuction && d.askingPrice >= 500000;
  const auction     = d.auction;
  const auctionLive = auction?.status === 'ACTIVE' || auction?.status === 'EXTENDED';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card domain-detail-modal-light" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
                            flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                <div className="modal-badge">{isAuction ? '🔨 Auction' : 'Domain'}</div>
                {d.verified && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857',
                                 background: '#ecfdf5', padding: '0.2rem 0.5rem',
                                 borderRadius: 4, border: '1px solid #a7f3d0' }}>
                    ✓ Verified
                  </span>
                )}
                {isHighValue && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6d28d9',
                                 background: '#f5f3ff', padding: '0.2rem 0.5rem',
                                 borderRadius: 4, border: '1px solid #ddd6fe' }}>
                    Premium
                  </span>
                )}
              </div>
              <h2>{d.domainName}{d.domainExtension}</h2>
              <p>{d.pricingDemand}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {isAuction && auction ? (
                <>
                  <div style={{ padding: '0.5rem 1rem', background: '#ecfdf5',
                                border: '1px solid #a7f3d0', borderRadius: 8,
                                fontSize: '0.875rem', color: '#047857' }}>
                    {auction.currentHighestBid > 0
                      ? `🏆 ₹${Number(auction.currentHighestBid).toLocaleString('en-IN')}`
                      : `🔨 Min ₹${Number(auction.minBidPrice).toLocaleString('en-IN')}`}
                  </div>
                  <div style={{ padding: '0.5rem 1rem', background: '#f9fafb',
                                border: '1px solid #e5e7eb', borderRadius: 8,
                                fontSize: '0.875rem', color: '#6b7280' }}>
                    📋 {auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''}
                  </div>
                </>
              ) : (
                <div style={{ padding: '0.5rem 1rem', background: '#ecfdf5',
                              border: '1px solid #a7f3d0', borderRadius: 8,
                              fontSize: '0.875rem', color: '#047857' }}>
                  💰 ₹{Number(d.askingPrice).toLocaleString('en-IN')}
                </div>
              )}
              <div style={{ padding: '0.5rem 1rem', background: '#f9fafb',
                            border: '1px solid #e5e7eb', borderRadius: 8,
                            fontSize: '0.875rem', color: '#6b7280' }}>
                👁 {d.views || 0} views
              </div>
              {!isAuction && (
                <span style={{ padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.875rem',
                               fontWeight: 600, color: s.color, background: s.bg,
                               border: `1px solid ${s.border}` }}>
                  {d.domainStatus}
                </span>
              )}
            </div>

            {isAuction && auction && (
              <Section title="Auction Info">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <DetailItem label="Status"
                    value={auction.status === 'ACTIVE'   ? '🟢 Live' :
                           auction.status === 'EXTENDED' ? '⚡ Extended' :
                           auction.status === 'DRAFT'    ? '⏳ Pending Verification' :
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
              <div style={{ padding: '0.875rem 1rem', background: '#f5f3ff',
                            border: '1px solid #ddd6fe', borderRadius: 8,
                            marginBottom: '1.25rem', fontSize: '0.83rem', color: '#6d28d9' }}>
                ✦ This is a premium domain. Submit an enquiry and our team will facilitate
                the transaction.
              </div>
            )}

            {(c.email || c.phoneNumber) && (
              <Section title="Contact">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {c.email       && <DetailItem label="Email" value={c.email} />}
                  {c.phoneNumber && <DetailItem label="Phone" value={c.phoneNumber} />}
                </div>
              </Section>
            )}

            {d.listedBy && (
              <Section title="Listed By">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%',
                                background: '#eef2ff',
                                border: '1px solid #c7d2fe',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, color: '#4f46e5' }}>
                    {d.listedBy.firstname?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>
                    {d.listedBy.firstname} {d.listedBy.lastname}
                  </div>
                </div>
              </Section>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem',
                          flexWrap: 'wrap', alignItems: 'center' }}>
              {!isOwner && (
                isAuction ? (
                  auctionLive ? (
                    <button
                      onClick={onViewAuction}
                      style={{ padding: '0.5rem 1.25rem', borderRadius: 8,
                               fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                               background: 'rgba(160,110,200,0.15)',
                               border: '1px solid rgba(160,110,200,0.4)', color: '#a06ec8' }}>
                      🔨 Go to Auction →
                    </button>
                  ) : null
                ) : d.domainStatus === 'AVAILABLE' ? (
                  isHighValue ? (
                    <button
                      onClick={onEnquire}
                      style={{ padding: '0.5rem 1.25rem', borderRadius: 8,
                               fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                               background: 'rgba(200,169,110,0.12)',
                               border: '1px solid rgba(200,169,110,0.35)', color: '#c8a96e' }}>
                      Enquire Now →
                    </button>
                  ) : (
                    <button className="btn-primary" onClick={onBuy}>Buy Now →</button>
                  )
                ) : null
              )}
              <LikeButton liked={likeState?.liked} count={likeState?.count}
                          onToggle={onLike} size="md" />
              <button className="btn-ghost" onClick={onClose}>Close</button>
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
    email:    user?.email || '',
    phone:    user?.phoneNumber || '',
    message:  '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Correct signature: (domainId, { fullName, email, phone, message })
      await domainEnquiryAPI.submit(domain.id, {
        fullName: form.fullName,
        email:    form.email,
        phone:    form.phone,
        message:  form.message,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit enquiry.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 500 }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-badge">Domain Enquiry</div>
          <h2>{domain.domainName}{domain.domainExtension}</h2>
          <p>₹{Number(domain.askingPrice).toLocaleString('en-IN')} · {domain.pricingDemand}</p>
        </div>
        <div style={{ padding: '0.875rem 1rem', background: 'rgba(200,169,110,0.08)',
                      border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8,
                      marginBottom: '1.5rem', fontSize: '0.83rem', color: '#c8a96e' }}>
          ⚡ For high-value domains, our team will facilitate the transaction.
          Fill in your details and we'll be in touch shortly.
        </div>
        <form onSubmit={handleSubmit} className="venture-form">
          <div className="form-group">
            <label>Full Name <span className="required">*</span></label>
            <input value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Your full name" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label>Phone <span className="required">*</span></label>
              <input value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit number" maxLength={10} required />
            </div>
          </div>
          <div className="form-group">
            <label>Message / Reason for Enquiry <span className="required">*</span></label>
            <textarea value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Tell us why you're interested and any specific requirements…"
              rows={4} style={{ resize: 'vertical' }} required />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? <span className="btn-spinner" /> : 'Submit Enquiry →'}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#888',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    marginBottom: '0.6rem' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="domain-detail-item">
      <div className="domain-detail-item-label">{label}</div>
      <div className="domain-detail-item-value">{value}</div>
    </div>
  );
}