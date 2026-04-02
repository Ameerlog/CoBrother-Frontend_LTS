import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus } from 'lucide-react';
import { cocreationAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import TechnologyIcon from '../assets/CoCreation.png';
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
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="mb-1">
              <h1 className="font-display text-3xl font-bold text-gray-900 m-0">Technology</h1>
            </div>
            <p className="text-gray-600">Buy and sell software products built by the community.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-purple hover:bg-purple-50" onClick={() => navigate('/cocreation/dashboard')}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
            {user?.role === 'ADMIN' && (
              <button className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-purple-50" onClick={() => setShowForm(true)}>
                <Plus size={16} /> List Software
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${filterTab === 'all' ? 'bg-purple text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-purple hover:bg-purple-50'}`}
            onClick={() => setFilterTab('all')}>All Software</button>
          <button className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${filterTab === 'mine' ? 'bg-purple text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-purple hover:bg-purple-50'}`}
            onClick={() => setFilterTab('mine')}>My Listings</button>
        </div>

        {showForm && user?.role === 'ADMIN' && (
          <div className="mb-6">
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
          <div className="text-sm text-gray-600 mb-4">
            {totalCount} software listing{totalCount !== 1 ? 's' : ''} found
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-6">
              <img src={TechnologyIcon} alt="No software" className="w-20 h-20 object-contain opacity-30" />
            </div>
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
              {activeFilterCount > 0 ? 'No software matches your filters' :
               filterTab === 'mine' ? 'You have no listings' :
               'No software listed yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeFilterCount > 0
                ? 'Try adjusting your search or filters.'
                : 'Check back soon for new software listings.'}
            </p>
            {activeFilterCount > 0 && (
              <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-sm rounded-full cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50" onClick={clearAll}>Clear Filters</button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
function SoftwareCard({ item, isOwner, onView, onBuy, onDelete, likeState, onLike }) {
  const s = STATUS_COLORS[item.softwareStatus] || STATUS_COLORS.AVAILABLE;
  return (
    <div className="card-glow-hover p-5 bg-white border border-gray-200 rounded-[14px] flex flex-col gap-2 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-200" onClick={onView}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="w-[42px] h-[42px] bg-indigo-50 border border-indigo-200 rounded-[10px] flex items-center justify-center text-xl flex-shrink-0">
          ⧁
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-[0.72rem] font-semibold text-amber-600 uppercase tracking-wider">{item.category?.replace(/_/g, ' ')}</span>
          <span className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">{item.pricingDemand}</span>
        </div>
        {isOwner && <div className="ml-auto px-2 py-0.5 bg-green-50 border border-green-200 rounded text-[0.7rem] text-green-600 flex-shrink-0">Owner</div>}
        {item.official && (
          <div className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[0.68rem] font-bold text-amber-600 flex-shrink-0">
            ✦ Official
          </div>
        )}
      </div>

      <h3 className="font-display text-[1.15rem] font-semibold text-gray-900 leading-tight mt-1">{item.name}</h3>

      <p className="text-[0.82rem] text-gray-500 my-1 leading-relaxed line-clamp-2">
        {item.description}
      </p>

      {item.techStack && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {item.techStack.split(',').slice(0, 3).map(t => (
            <span key={t} className="text-[0.7rem] px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
              {t.trim()}
            </span>
          ))}
        </div>
      )}

      <div className="mb-1">
        <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem',
                       fontWeight: 600, color: s.color, background: s.bg,
                       border: `1px solid ${s.border}` }}>
          {item.softwareStatus}
        </span>
      </div>

      <div className="font-display text-[1.1rem] font-bold text-indigo-600 mt-1">₹{Number(item.price).toLocaleString('en-IN')}</div>

      <div className="flex items-center justify-between gap-2 flex-wrap mt-1">
        <div className="flex gap-3 text-xs text-gray-400">
          <span title="Views">👁 {item.views || 0}</span>
          <LikeButton liked={likeState?.liked} count={likeState?.count} onToggle={onLike} />
        </div>
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          {isOwner ? (
            <button className="inline-flex items-center justify-center px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 font-semibold text-xs rounded-lg cursor-pointer transition-colors hover:bg-red-100"
              onClick={e => { e.stopPropagation(); onDelete(); }}>
              Remove
            </button>
          ) : item.softwareStatus === 'AVAILABLE' ? (
            <button className="inline-flex items-center justify-center px-3 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors hover:bg-indigo-700"
              onClick={e => { e.stopPropagation(); onBuy(); }}>
              Buy Now →
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic">Sold</span>
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

  const inputCls = 'px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all w-full';
  const labelCls = 'text-sm font-medium text-gray-700';

  return (
    <div className="p-8 bg-white border border-gray-200 rounded-[18px] shadow-sm">
      <h3 className="font-display text-2xl text-gray-900 font-semibold">List Software</h3>
      <p className="text-gray-500 text-sm mt-1">Add a new software product to the CoCreation marketplace.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Software Name <span className="text-red-500">*</span></label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. InvoiceFlow" required />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Description <span className="text-red-500">*</span></label>
          <textarea className={`${inputCls} resize-vertical`} value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Brief overview of your software" rows={3} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>What It Does <span className="text-red-500">*</span></label>
            <textarea className={`${inputCls} resize-vertical`} value={form.whatItDoes} onChange={e => set('whatItDoes', e.target.value)}
              placeholder="Core functionality" rows={3} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>How It Helps <span className="text-red-500">*</span></label>
            <textarea className={`${inputCls} resize-vertical`} value={form.howItHelps} onChange={e => set('howItHelps', e.target.value)}
              placeholder="The problem it solves" rows={3} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Category <span className="text-red-500">*</span></label>
            <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)} required>
              <option value="">Select category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Tech Stack</label>
            <input className={inputCls} value={form.techStack} onChange={e => set('techStack', e.target.value)}
              placeholder="React, Spring Boot, PostgreSQL" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Price (₹) <span className="text-red-500">*</span></label>
            <input className={inputCls} type="number" min="0" value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="e.g. 25000" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Pricing Type <span className="text-red-500">*</span></label>
            <select className={inputCls} value={form.pricingDemand}
              onChange={e => set('pricingDemand', e.target.value)} required>
              <option value="">Select type</option>
              <option value="FIXED">Fixed Price</option>
              <option value="NEGOTIABLE">Negotiable</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Demo Video Link</label>
            <input className={inputCls} value={form.videoLink} onChange={e => set('videoLink', e.target.value)}
              placeholder="YouTube / Loom URL" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Live Demo Link</label>
            <input className={inputCls} value={form.liveDemoLink} onChange={e => set('liveDemoLink', e.target.value)}
              placeholder="https://yourdemo.com" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            GitHub Link <span className="text-red-500">*</span>
            <span className="text-[0.72rem] text-gray-400 ml-2 font-normal">
              🔒 Not shared until buyer confirms purchase
            </span>
          </label>
          <input className={inputCls} value={form.githubLink} onChange={e => set('githubLink', e.target.value)}
            placeholder="https://github.com/you/repo" required />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 mt-0.5 cursor-pointer accent-indigo-600 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0" checked={form.agreement.terms}
            onChange={e => setForm(f => ({ ...f, agreement: { terms: e.target.checked } }))}
            required />
          <span className="text-sm text-gray-700">I confirm this software is ready for sale and agree to the Terms & Conditions.</span>
        </label>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex gap-3 mt-2">
          <button type="submit" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : 'List Software →'}
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent text-gray-500 font-semibold text-sm rounded-[10px] border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100" onClick={onCancel}>Cancel</button>
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[520px] bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none" />
        <button className="absolute top-4 right-4 z-20 bg-transparent border-none text-gray-400 text-xl cursor-pointer transition-colors hover:text-gray-700" onClick={onClose}>✕</button>

        <div className="mb-6">
          <div className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-[0.72rem] font-semibold text-indigo-600 uppercase tracking-wide mb-2">Software Purchase</div>
          <h2 className="font-display text-[1.75rem] font-semibold text-gray-900 mb-1">{item.name}</h2>
          <p className="text-sm text-gray-500">{item.category?.replace(/_/g, ' ')} · {item.pricingDemand}</p>
        </div>

        {/* Buyer details */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium">Full Name</label>
            <input className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all" value={form.buyerFullName}
              onChange={e => setForm(f => ({ ...f, buyerFullName: e.target.value }))}
              placeholder="Your full name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">Email</label>
              <input className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all" type="email" value={form.buyerEmail}
                onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))}
                placeholder="your@email.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">Phone</label>
              <input className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all" value={form.buyerPhone}
                onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))}
                placeholder="10-digit number" maxLength={10} />
            </div>
          </div>
        </div>

        {/* ── CoBrother opt-in card ── */}
        <div
          onClick={() => setCoBrotherOptIn(v => !v)}
          className={`flex flex-col gap-3 p-4 mb-5 cursor-pointer rounded-[10px] border transition-all ${coBrotherOptIn ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
        >
          <div className="flex items-start gap-3.5">
            <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${coBrotherOptIn ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
              {coBrotherOptIn && (
                <span className="text-white text-[0.65rem] font-bold">✓</span>
              )}
            </div>
            <div>
              <div className={`font-semibold text-[0.9rem] mb-1 ${coBrotherOptIn ? 'text-purple-700' : 'text-gray-700'}`}>
                ◆ Add CoBrother Helper{' '}
                <span className={`font-display text-[1rem] font-bold ${coBrotherOptIn ? 'text-purple-600' : 'text-indigo-600'}`}>
                  +₹1,000
                </span>
              </div>
              <div className="text-gray-500 text-[0.78rem] leading-relaxed">
                Get a dedicated CoBrother to help you set up, deploy, and get the most out of
                this software. They'll reach out within 24 hours.
              </div>
            </div>
          </div>
        </div>

        {/* ── Billing breakdown ── */}
        <div className="bg-gray-50 border border-gray-200 rounded-[10px] p-4 mb-5">
          <div className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Billing Breakdown
          </div>
          <BillingLine label={item.name}
                       value={`₹${Number(basePrice).toLocaleString('en-IN')}`} />
          {coBrotherOptIn && (
            <BillingLine label="◆ CoBrother Helper" value="₹1,000" accent />
          )}
          <div className="h-px bg-gray-200 my-2.5" />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700 text-[0.9rem]">Total</span>
            <span className="font-display text-[1.5rem] font-bold text-green-600">
              ₹{Number(totalPrice).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg mb-5 text-sm text-amber-700">
          🔒 GitHub link will be shared after you confirm everything works.
          {coBrotherOptIn && ' Your CoBrother will reach out within 24 hours.'}
        </div>

        {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

        <div className="flex gap-3">
          <button className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handlePay} disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> :
              `Pay ₹${Number(totalPrice).toLocaleString('en-IN')} →`}
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent text-gray-500 font-semibold text-sm rounded-[10px] border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Billing line helper
function BillingLine({ label, value, accent }) {
  return (
    <div className="flex justify-between items-center py-1 text-[0.84rem]">
      <span className={accent ? 'text-purple-600' : 'text-gray-500'}>{label}</span>
      <span className={`font-medium ${accent ? 'text-purple-700' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}

// ─── Purchase Success Modal ───────────────────────────────────────────────────
function PurchaseSuccessModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[440px] text-center bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none" />
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="font-display text-[1.75rem] font-semibold text-gray-900 mb-2">
          Purchase Successful!
        </h2>
        <p className="text-gray-500 mb-6">
          You've purchased <strong className="text-gray-900">{item.name}</strong>
        </p>

        {item.githubLink && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-5 text-left">
            <div className="text-xs text-gray-500 mb-2">
              🔓 GitHub Repository
            </div>
            <a href={item.githubLink} target="_blank" rel="noreferrer"
               className="text-green-600 font-semibold break-all text-sm no-underline hover:underline">
              {item.githubLink}
            </a>
          </div>
        )}

        {item.coBrotherOptIn && (
          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl mb-5 text-left text-sm text-purple-700">
            ◆ CoBrother Helper activated — expect an introduction within 24 hours.
          </div>
        )}

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-sm text-amber-700 text-left">
          <p className="mb-2">✉️ A confirmation email has been sent to you.</p>
          <p className="m-0">
            🔒 Once you verify everything works, mark it as complete from your dashboard.
          </p>
        </div>

        <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700" onClick={onClose}>
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8">
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
                <div className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-[0.72rem] font-semibold text-indigo-600 uppercase tracking-wide">{d.category?.replace(/_/g, ' ')}</div>
                {d.official && (
                  <span className="text-[0.72rem] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ✦ Official
                  </span>
                )}
              </div>
              <h2 className="font-display text-[1.75rem] font-semibold text-gray-900 mb-1">{d.name}</h2>
              <p className="text-sm text-gray-500">{d.pricingDemand}</p>
            </div>

            <div className="flex gap-3 mb-6 flex-wrap">
              <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                💰 ₹{Number(d.price).toLocaleString('en-IN')}
              </div>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                👁 {d.views || 0} views
              </div>
            </div>

            {d.description && (
              <Section title="Description">
                <p className="text-gray-600 leading-relaxed text-[0.9rem]">
                  {d.description}
                </p>
              </Section>
            )}

            {d.whatItDoes && (
              <Section title="What It Does">
                <p className="text-gray-600 leading-relaxed text-[0.9rem]">
                  {d.whatItDoes}
                </p>
              </Section>
            )}

            {d.howItHelps && (
              <Section title="How It Helps">
                <p className="text-gray-600 leading-relaxed text-[0.9rem]">
                  {d.howItHelps}
                </p>
              </Section>
            )}

            {d.techStack && (
              <Section title="Tech Stack">
                <div className="flex flex-wrap gap-1.5">
                  {d.techStack.split(',').map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {(d.videoLink || d.liveDemoLink) && (
              <Section title="Links">
                <div className="flex gap-3 flex-wrap">
                  {d.videoLink && (
                    <a href={d.videoLink} target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent text-gray-500 font-semibold text-xs rounded-lg border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100 no-underline" onClick={e => e.stopPropagation()}>
                      � Demo Video ↗
                    </a>
                  )}
                  {d.liveDemoLink && (
                    <a href={d.liveDemoLink} target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent text-gray-500 font-semibold text-xs rounded-lg border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100 no-underline" onClick={e => e.stopPropagation()}>
                      🌐 Live Demo ↗
                    </a>
                  )}
                </div>
              </Section>
            )}

            <Section title="GitHub">
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-gray-500">
                🔒 GitHub link is shared after purchase is confirmed.
              </div>
            </Section>

            {d.listedBy && (
              <Section title="Listed By">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-600">
                    {d.listedBy.firstname?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="font-medium text-gray-800 text-[0.9rem]">
                    {d.listedBy.firstname} {d.listedBy.lastname}
                  </div>
                </div>
              </Section>
            )}

            <div className="flex gap-3 mt-6 flex-wrap items-center">
              {!isOwner && d.softwareStatus === 'AVAILABLE' && (
                <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700" onClick={onBuy}>Buy Now →</button>
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