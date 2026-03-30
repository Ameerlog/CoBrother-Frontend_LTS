import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus } from 'lucide-react';
import { cocreationAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import { useLikes } from '../hooks/useLikes';
import LikeButton from '../components/common/LikeButton';
import { useFilterSort } from '../hooks/useFilterSort';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import SkeletonCard from '../components/common/Skeleton';
import ConfirmDialog from '../components/common/ConfirmDialog';

const COCREATION_CATEGORIES = [
  'SAAS','MOBILE_APP','DESKTOP','API_TOOL',
  'AUTOMATION','ECOMMERCE','EDUCATION','OTHER'
].map(v => ({ value: v, label: v.replace(/_/g, ' ') }));

const CATEGORIES = [
  'SAAS','MOBILE_APP','DESKTOP','API_TOOL','AUTOMATION','ECOMMERCE','EDUCATION','OTHER'
];

const STATUS_COLORS = {
  AVAILABLE: { color: '#6ec896', bg: 'rgba(110,200,150,0.1)', border: 'rgba(110,200,150,0.3)' },
  SOLD:      { color: '#c86e6e', bg: 'rgba(200,110,110,0.1)', border: 'rgba(200,110,110,0.3)' },
};

export default function CoCreationPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [allSoftware, setAllSoftware]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [buyTarget, setBuyTarget]           = useState(null);
  const [successItem, setSuccessItem]       = useState(null);
  const [detailTarget, setDetailTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [filterTab, setFilterTab]           = useState('all');

  const { toggle: toggleLike, get: getLike } = useLikes('SOFTWARE', allSoftware);

  const {
    paginated, totalCount,
    search, category, minPrice, maxPrice, sortBy,
    handleSearch, handleCategory, handleMinPrice, handleMaxPrice, handleSort,
    clearAll, activeFilterCount,
    page, totalPages, setPage,
  } = useFilterSort(
    filterTab === 'mine'
      ? allSoftware.filter(s => s.listedBy?.id === user?.id)
      : allSoftware,
    {
      searchFields:  ['name', 'description', 'techStack'],
      priceField:    'price',
      categoryField: 'category',
      dateField:     'createdAt',
    },
    20
  );

  useEffect(() => {
    setLoading(true);
    cocreationAPI.getAll()
      .then(({ data }) => setAllSoftware(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setAllSoftware([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await cocreationAPI.delete(deleteTarget);
      setAllSoftware(s => s.filter(x => x.id !== deleteTarget));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to remove listing.');
    } finally { setDeleteTarget(null); }
  };

  const refreshSoftware = () =>
    cocreationAPI.getAll()
      .then(({ data }) => setAllSoftware(Array.isArray(data) ? data : (data?.data ?? [])));

  return (
    <AppLayout>
      <div className="ventures-page cocreation-page">
        <div className="page-header cocreation-header">
          <div>
            <h1>CoCreation</h1>
            <p>Buy and sell software products built by the community.</p>
          </div>
          <div className="cocreation-header-actions">
            <button className="btn-secondary cocreation-btn" onClick={() => navigate('/cocreation/dashboard')}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
            {user?.role === 'ADMIN' && (
              <button className="btn-primary cocreation-btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={16} /> List Software
              </button>
            )}
          </div>
        </div>

        <div className="filter-tabs">
          <button className={`filter-tab ${filterTab === 'all'  ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}>All Software</button>
          <button className={`filter-tab ${filterTab === 'mine' ? 'active' : ''}`}
            onClick={() => setFilterTab('mine')}>My Listings</button>
        </div>

        {showForm && user?.role === 'ADMIN' && (
          <div className="community-form-section">
            <SoftwareForm
              onSaved={s => { setAllSoftware(prev => [s, ...prev]); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <FilterBar
          search={search}           onSearch={handleSearch}
          category={category}       onCategory={handleCategory}
          categoryOptions={COCREATION_CATEGORIES}
          minPrice={minPrice}       onMinPrice={handleMinPrice}
          maxPrice={maxPrice}       onMaxPrice={handleMaxPrice}
          sortBy={sortBy}           onSort={handleSort}
          onClear={clearAll}        activeFilterCount={activeFilterCount}
          placeholder="Search software by name, description or tech stack…"
          theme="light"
        />

        {!loading && allSoftware.length > 0 && (
          <div className="cocreation-result-count">
            {totalCount} software listing{totalCount !== 1 ? 's' : ''} found
          </div>
        )}

        {loading ? (
          <div className="ventures-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⟁</div>
            <h3>
              {activeFilterCount > 0 ? 'No software matches your filters' :
               filterTab === 'mine' ? 'You have no listings' :
               'No software listed yet'}
            </h3>
            <p>
              {activeFilterCount > 0
                ? 'Try adjusting your search or filters.'
                : 'Check back soon for new software listings.'}
            </p>
            {activeFilterCount > 0 && (
              <button className="btn-secondary cocreation-btn" onClick={clearAll}>Clear Filters</button>
            )}
          </div>
        ) : (
          <>
            <div className="ventures-grid">
              {paginated.map(s => (
                <SoftwareCard
                  key={s.id}
                  item={s}
                  isOwner={s.listedBy?.id === user?.id}
                  likeState={getLike(s.id)}
                  onLike={() => toggleLike(s.id)}
                  onView={() => setDetailTarget(s)}
                  onBuy={() => setBuyTarget(s)}
                  onDelete={() => setDeleteTarget(s.id)}
                />
              ))}
            </div>
            <Pagination
              page={page} totalPages={totalPages}
              onPage={setPage} totalCount={totalCount} pageSize={20}
            />
          </>
        )}
      </div>

      {buyTarget && (
        <BuySoftwareModal
          item={buyTarget}
          user={user}
          onClose={() => setBuyTarget(null)}
          onSuccess={item => {
            setSuccessItem(item);
            setBuyTarget(null);
            setAllSoftware(prev => prev.map(x => x.id === item.id ? item : x));
          }}
        />
      )}

      {successItem && (
        <PurchaseSuccessModal item={successItem} onClose={() => setSuccessItem(null)} />
      )}

      {detailTarget && (
        <SoftwareDetailModal
          item={detailTarget}
          isOwner={detailTarget.listedBy?.id === user?.id}
          likeState={getLike(detailTarget.id)}
          onLike={() => toggleLike(detailTarget.id)}
          onClose={() => { setDetailTarget(null); refreshSoftware(); }}
          onBuy={() => { setBuyTarget(detailTarget); setDetailTarget(null); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Software Listing?"
        message="This will remove your software from the marketplace."
        confirmLabel="Remove"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}

// ─── Software Card ────────────────────────────────────────────────────────────
function SoftwareCard({ item, isOwner, onView, onBuy, onDelete, likeState, onLike }) {
  const s = STATUS_COLORS[item.softwareStatus] || STATUS_COLORS.AVAILABLE;
  return (
    <div className="venture-card" onClick={onView} style={{ cursor: 'pointer' }}>
      <div className="venture-card-top">
        <div className="venture-logo-placeholder" style={{ fontSize: '1.1rem', color: '#c8a96e' }}>
          ⟁
        </div>
        <div className="venture-card-meta">
          <span className="venture-industry">{item.category?.replace(/_/g, ' ')}</span>
          <span className="venture-type">{item.pricingDemand}</span>
        </div>
        {isOwner && <div className="owner-badge">Owner</div>}
        {item.official && (
          <div style={{ padding: '0.2rem 0.5rem', background: 'rgba(200,169,110,0.15)',
                        border: '1px solid rgba(200,169,110,0.35)', borderRadius: 4,
                        fontSize: '0.68rem', fontWeight: 700, color: '#c8a96e' }}>
            ✦ Official
          </div>
        )}
      </div>

      <h3 className="venture-name">{item.name}</h3>

      <p style={{ fontSize: '0.82rem', color: '#a0a0b0', margin: '0.4rem 0 0.75rem',
                  lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.description}
      </p>

      {item.techStack && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
          {item.techStack.split(',').slice(0, 3).map(t => (
            <span key={t} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 4,
                                   background: 'rgba(200,169,110,0.1)', color: '#c8a96e',
                                   border: '1px solid rgba(200,169,110,0.2)' }}>
              {t.trim()}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem',
                       fontWeight: 600, color: s.color, background: s.bg,
                       border: `1px solid ${s.border}` }}>
          {item.softwareStatus}
        </span>
      </div>

      <div className="venture-deal">₹{Number(item.price).toLocaleString('en-IN')}</div>

      <div className="venture-card-footer">
        <div className="venture-stats">
          <span title="Views">👁 {item.views || 0}</span>
          <LikeButton liked={likeState?.liked} count={likeState?.count} onToggle={onLike} />
        </div>
        <div className="venture-card-actions" onClick={e => e.stopPropagation()}>
          {isOwner ? (
            <button className="btn-danger btn-sm"
              onClick={e => { e.stopPropagation(); onDelete(); }}>
              Remove
            </button>
          ) : item.softwareStatus === 'AVAILABLE' ? (
            <button className="btn-primary btn-sm cocreation-btn-primary"
              onClick={e => { e.stopPropagation(); onBuy(); }}>
              Buy Now →
            </button>
          ) : (
            <span className="cocreation-muted-status">Sold</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Software Form (admin only) ───────────────────────────────────────────────
function SoftwareForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: '', description: '', videoLink: '', whatItDoes: '', howItHelps: '',
    githubLink: '', liveDemoLink: '', techStack: '',
    category: '', pricingDemand: '', price: '',
    agreement: { terms: false },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await cocreationAPI.create(form);
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to list software.');
    } finally { setLoading(false); }
  };

  return (
    <div className="community-form-card">
      <h3>List Software</h3>
      <p className="form-subtext">Add a new software product to the CoCreation marketplace.</p>

      <form onSubmit={handleSubmit} className="venture-form" style={{ marginTop: '1.25rem' }}>
        <div className="form-group">
          <label>Software Name <span className="required">*</span></label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. InvoiceFlow" required />
        </div>

        <div className="form-group">
          <label>Description <span className="required">*</span></label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Brief overview of your software" rows={3} required
            style={{ resize: 'vertical' }} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>What It Does <span className="required">*</span></label>
            <textarea value={form.whatItDoes} onChange={e => set('whatItDoes', e.target.value)}
              placeholder="Core functionality" rows={3} required style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label>How It Helps <span className="required">*</span></label>
            <textarea value={form.howItHelps} onChange={e => set('howItHelps', e.target.value)}
              placeholder="The problem it solves" rows={3} required style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category <span className="required">*</span></label>
            <select value={form.category} onChange={e => set('category', e.target.value)} required>
              <option value="">Select category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tech Stack</label>
            <input value={form.techStack} onChange={e => set('techStack', e.target.value)}
              placeholder="React, Spring Boot, PostgreSQL" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (₹) <span className="required">*</span></label>
            <input type="number" min="0" value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="e.g. 25000" required />
          </div>
          <div className="form-group">
            <label>Pricing Type <span className="required">*</span></label>
            <select value={form.pricingDemand}
              onChange={e => set('pricingDemand', e.target.value)} required>
              <option value="">Select type</option>
              <option value="FIXED">Fixed Price</option>
              <option value="NEGOTIABLE">Negotiable</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Demo Video Link</label>
            <input value={form.videoLink} onChange={e => set('videoLink', e.target.value)}
              placeholder="YouTube / Loom URL" />
          </div>
          <div className="form-group">
            <label>Live Demo Link</label>
            <input value={form.liveDemoLink} onChange={e => set('liveDemoLink', e.target.value)}
              placeholder="https://yourdemo.com" />
          </div>
        </div>

        <div className="form-group">
          <label>
            GitHub Link <span className="required">*</span>
            <span style={{ fontSize: '0.72rem', color: '#c8a96e', marginLeft: '0.5rem',
                           fontWeight: 400 }}>
              🔒 Not shared until buyer confirms purchase
            </span>
          </label>
          <input value={form.githubLink} onChange={e => set('githubLink', e.target.value)}
            placeholder="https://github.com/you/repo" required />
        </div>

        <label className="checkbox-label">
          <input type="checkbox" checked={form.agreement.terms}
            onChange={e => setForm(f => ({ ...f, agreement: { terms: e.target.checked } }))}
            required />
          <span>I confirm this software is ready for sale and agree to the Terms & Conditions.</span>
        </label>

        {error && <div className="form-error">{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'List Software →'}
          </button>
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ─── Buy Software Modal ── UPGRADED with CoBrother opt-in + billing breakdown ─
function BuySoftwareModal({ item, user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    buyerFullName: `${user?.firstname || ''} ${user?.lastname || ''}`.trim(),
    buyerEmail:    user?.email || '',
    buyerPhone:    user?.phoneNumber || '',
  });
  const [coBrotherOptIn, setCoBrotherOptIn] = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  const basePrice    = item.price;
  const coBrotherFee = coBrotherOptIn ? 1000 : 0;
  const totalPrice   = basePrice + coBrotherFee;

  const handlePay = async () => {
    setLoading(true); setError('');
    try {
      // Pass both buyer info AND coBrotherOptIn to backend
      const { data: orderData } = await cocreationAPI.createOrder(item.id, {
        ...form,
        coBrotherOptIn,
      });

      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount * 100,
        currency:    orderData.currency,
        name:        'CoBrother',
        description: `${item.name}${coBrotherOptIn ? ' + CoBrother Help' : ''}`,
        order_id:    orderData.orderId,
        handler: async response => {
          try {
            const { data: verifyData } = await cocreationAPI.verifyPayment(item.id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId:   response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess({
              ...item,
              softwareStatus:   'SOLD',
              paymentStatus:    'COMPLETED',
              completionStatus: 'PENDING',
              githubLink:       verifyData.githubLink,
              coBrotherOptIn,
              coBrotherHelpPaid: coBrotherOptIn,
            });
          } catch {
            setError('Payment verification failed. Contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: async () => {
            await cocreationAPI.handleFailure(item.id);
            setLoading(false);
          },
        },
        prefill: { name: form.buyerFullName, email: form.buyerEmail, contact: form.buyerPhone },
        theme: { color: '#a06ec8' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async () => {
        await cocreationAPI.handleFailure(item.id);
        setError('Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 520 }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div className="modal-badge">Software Purchase</div>
          <h2>{item.name}</h2>
          <p>{item.category?.replace(/_/g, ' ')} · {item.pricingDemand}</p>
        </div>

        {/* Buyer details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem',
                      marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem',
                            display: 'block' }}>Full Name</label>
            <input value={form.buyerFullName}
              onChange={e => setForm(f => ({ ...f, buyerFullName: e.target.value }))}
              placeholder="Your full name" />
          </div>
          <div className="form-row" style={{ margin: 0 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem',
                              display: 'block' }}>Email</label>
              <input type="email" value={form.buyerEmail}
                onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))}
                placeholder="your@email.com" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem',
                              display: 'block' }}>Phone</label>
              <input value={form.buyerPhone}
                onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))}
                placeholder="10-digit number" maxLength={10} />
            </div>
          </div>
        </div>

        {/* ── CoBrother opt-in card ── */}
        <div
          onClick={() => setCoBrotherOptIn(v => !v)}
          style={{
            marginBottom: '1.25rem', padding: '1rem 1.25rem', borderRadius: 12,
            cursor: 'pointer',
            background: coBrotherOptIn ? 'rgba(160,110,200,0.1)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${coBrotherOptIn
              ? 'rgba(160,110,200,0.45)' : 'rgba(255,255,255,0.1)'}`,
            transition: 'all 0.2s',
          }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
            {/* Custom checkbox */}
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
              background: coBrotherOptIn ? '#a06ec8' : 'rgba(255,255,255,0.08)',
              border: `2px solid ${coBrotherOptIn ? '#a06ec8' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
              {coBrotherOptIn && (
                <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem',
                            color: coBrotherOptIn ? '#c8a0f8' : '#c0c0d0' }}>
                ◆ Add CoBrother Helper{' '}
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem',
                               color: coBrotherOptIn ? '#c8a0f8' : '#888' }}>
                  +₹1,000
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.5 }}>
                Get a dedicated CoBrother to help you set up, deploy, and get the most out of
                this software. They'll reach out within 24 hours.
              </div>
            </div>
          </div>
        </div>

        {/* ── Billing breakdown ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#888',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        marginBottom: '0.75rem' }}>
            Billing Breakdown
          </div>
          <BillingLine label={item.name}
                       value={`₹${Number(basePrice).toLocaleString('en-IN')}`} />
          {coBrotherOptIn && (
            <BillingLine label="◆ CoBrother Helper" value="₹1,000" accent />
          )}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.625rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#e0e0f0', fontSize: '0.9rem' }}>Total</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem',
                           fontWeight: 700, color: '#6ec896' }}>
              ₹{Number(totalPrice).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div style={{ padding: '0.875rem 1rem', background: 'rgba(200,169,110,0.08)',
                      border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8,
                      marginBottom: '1.25rem', fontSize: '0.875rem', color: '#c8a96e' }}>
          🔒 GitHub link will be shared after you confirm everything works.
          {coBrotherOptIn && ' Your CoBrother will reach out within 24 hours.'}
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={handlePay} disabled={loading} style={{ flex: 1 }}>
            {loading ? <span className="btn-spinner" /> :
              `Pay ₹${Number(totalPrice).toLocaleString('en-IN')} →`}
          </button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Billing line helper
function BillingLine({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '0.3rem 0', fontSize: '0.84rem' }}>
      <span style={{ color: accent ? '#a06ec8' : '#888' }}>{label}</span>
      <span style={{ color: accent ? '#c8a0f8' : '#c0c0d0', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ─── Purchase Success Modal ───────────────────────────────────────────────────
function PurchaseSuccessModal({ item, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 440, textAlign: 'center' }}>
        <div className="modal-glow" />
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem',
                     marginBottom: '0.5rem' }}>
          Purchase Successful!
        </h2>
        <p style={{ color: '#a0a0b0', marginBottom: '1.5rem' }}>
          You've purchased <strong style={{ color: '#e0e0f0' }}>{item.name}</strong>
        </p>

        {item.githubLink && (
          <div style={{ padding: '1rem', background: 'rgba(110,200,150,0.08)',
                        border: '1px solid rgba(110,200,150,0.2)', borderRadius: 10,
                        marginBottom: '1.25rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>
              🔓 GitHub Repository
            </div>
            <a href={item.githubLink} target="_blank" rel="noreferrer"
               style={{ color: '#6ec896', fontWeight: 600, wordBreak: 'break-all',
                        fontSize: '0.875rem' }}>
              {item.githubLink}
            </a>
          </div>
        )}

        {item.coBrotherOptIn && (
          <div style={{ padding: '0.875rem 1rem', background: 'rgba(160,110,200,0.08)',
                        border: '1px solid rgba(160,110,200,0.2)', borderRadius: 10,
                        marginBottom: '1.25rem', textAlign: 'left',
                        fontSize: '0.85rem', color: '#a06ec8' }}>
            ◆ CoBrother Helper activated — expect an introduction within 24 hours.
          </div>
        )}

        <div style={{ padding: '1rem', background: 'rgba(200,169,110,0.08)',
                      border: '1px solid rgba(200,169,110,0.2)', borderRadius: 10,
                      marginBottom: '1.5rem', fontSize: '0.875rem', color: '#c8a96e',
                      textAlign: 'left' }}>
          <p style={{ margin: '0 0 0.5rem' }}>✉️ A confirmation email has been sent to you.</p>
          <p style={{ margin: 0 }}>
            🔒 Once you verify everything works, mark it as complete from your dashboard.
          </p>
        </div>

        <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}

// ─── Software Detail Modal ────────────────────────────────────────────────────
function SoftwareDetailModal({ item, isOwner, onClose, onBuy, likeState, onLike }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched            = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    cocreationAPI.get(item.id)
      .then(({ data }) => setDetail(data?.data ?? data))
      .catch(() => setDetail(item))
      .finally(() => setLoading(false));
  }, [item.id]);

  const d = detail || item;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
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
                            marginBottom: '0.3rem' }}>
                <div className="modal-badge">{d.category?.replace(/_/g, ' ')}</div>
                {d.official && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c8a96e',
                                 background: 'rgba(200,169,110,0.12)', padding: '0.2rem 0.5rem',
                                 borderRadius: 4, border: '1px solid rgba(200,169,110,0.3)' }}>
                    ✦ Official
                  </span>
                )}
              </div>
              <h2>{d.name}</h2>
              <p>{d.pricingDemand}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(110,200,150,0.08)',
                            border: '1px solid rgba(110,200,150,0.2)', borderRadius: 8,
                            fontSize: '0.875rem', color: '#6ec896' }}>
                💰 ₹{Number(d.price).toLocaleString('en-IN')}
              </div>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                            fontSize: '0.875rem', color: '#a0a0b0' }}>
                👁 {d.views || 0} views
              </div>
            </div>

            {d.description && (
              <Section title="Description">
                <p style={{ color: '#c0c0d0', lineHeight: 1.7, fontSize: '0.9rem' }}>
                  {d.description}
                </p>
              </Section>
            )}

            {d.whatItDoes && (
              <Section title="What It Does">
                <p style={{ color: '#c0c0d0', lineHeight: 1.7, fontSize: '0.9rem' }}>
                  {d.whatItDoes}
                </p>
              </Section>
            )}

            {d.howItHelps && (
              <Section title="How It Helps">
                <p style={{ color: '#c0c0d0', lineHeight: 1.7, fontSize: '0.9rem' }}>
                  {d.howItHelps}
                </p>
              </Section>
            )}

            {d.techStack && (
              <Section title="Tech Stack">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {d.techStack.split(',').map(t => (
                    <span key={t} style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem',
                                           borderRadius: 6, background: 'rgba(200,169,110,0.1)',
                                           color: '#c8a96e',
                                           border: '1px solid rgba(200,169,110,0.2)' }}>
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {(d.videoLink || d.liveDemoLink) && (
              <Section title="Links">
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {d.videoLink && (
                    <a href={d.videoLink} target="_blank" rel="noreferrer"
                       className="btn-ghost btn-sm" onClick={e => e.stopPropagation()}>
                      🎬 Demo Video ↗
                    </a>
                  )}
                  {d.liveDemoLink && (
                    <a href={d.liveDemoLink} target="_blank" rel="noreferrer"
                       className="btn-ghost btn-sm" onClick={e => e.stopPropagation()}>
                      🌐 Live Demo ↗
                    </a>
                  )}
                </div>
              </Section>
            )}

            <Section title="GitHub">
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(200,110,110,0.06)',
                            border: '1px solid rgba(200,110,110,0.15)', borderRadius: 8,
                            fontSize: '0.82rem', color: '#a0a0b0' }}>
                🔒 GitHub link is shared after purchase is confirmed.
              </div>
            </Section>

            {d.listedBy && (
              <Section title="Listed By">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%',
                                background: 'rgba(200,169,110,0.15)',
                                border: '1px solid rgba(200,169,110,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, color: '#c8a96e' }}>
                    {d.listedBy.firstname?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ fontWeight: 500, color: '#e0e0f0', fontSize: '0.9rem' }}>
                    {d.listedBy.firstname} {d.listedBy.lastname}
                  </div>
                </div>
              </Section>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem',
                          flexWrap: 'wrap', alignItems: 'center' }}>
              {!isOwner && d.softwareStatus === 'AVAILABLE' && (
                <button className="btn-primary" onClick={onBuy}>Buy Now →</button>
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