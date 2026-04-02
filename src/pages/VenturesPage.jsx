import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ventureAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import CoVentureModal from '../components/venture/CoVentureModal';
import { useLikes } from '../hooks/useLikes';
import LikeButton from '../components/common/LikeButton';
import { useFilterSort } from '../hooks/useFilterSort';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import SkeletonCard from '../components/common/Skeleton';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DashboardIcon from '../assets/Dashboard.png';

const TYPE_LABELS = {
  FIFTY_FIFTY: '50:50', SIXTY_FORTY: '60:40', SEVENTY_THIRTY: '70:30',
  EIGHTY_TWENTY: '80:20', NINETY_TEN: '90:10', NEGOTIABLE: 'Negotiable',
};

const VENTURE_INDUSTRIES = [
  'TECH','FINANCE','HEALTHCARE','EDUCATION','FOOD_AND_BEVERAGE',
  'RETAIL','REAL_ESTATE','MEDIA','MANUFACTURING','LOGISTICS',
  'AGRICULTURE','OTHER'
].map(v => ({ value: v, label: v.replace(/_/g, ' ') }));

export default function VenturesPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [allVentures, setAllVentures]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [applyTarget, setApplyTarget]       = useState(null);
  const [detailTarget, setDetailTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [filterTab, setFilterTab]           = useState('all');

  const { toggle: toggleLike, get: getLike } = useLikes('VENTURE', allVentures);

  // ── Filter / sort / paginate ───────────────────────────────────────────────
  const {
    paginated, totalCount,
    search, category, minPrice, maxPrice, sortBy,
    handleSearch, handleCategory, handleMinPrice, handleMaxPrice, handleSort,
    clearAll, activeFilterCount,
    page, totalPages, setPage,
  } = useFilterSort(
    filterTab === 'mine'
      ? allVentures.filter(v => v.listedBy?.id === user?.id)
      : allVentures.filter(v => !v.takenDown),
    {
      searchFields:  ['brandDetails.brandName', 'brandDetails.description'],
      priceField:    'brandDetails.dealValue',
      categoryField: 'brandDetails.industry',
      dateField:     'createdAt',
    },
    20
  );

  useEffect(() => {
    setLoading(true);
    ventureAPI.getAll()
      .then(({ data }) => setAllVentures(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setAllVentures([]))
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch when switching to 'mine' tab
  useEffect(() => {
    if (filterTab !== 'mine') return;
    setLoading(true);
    ventureAPI.getMyVentures()
      .then(({ data }) => setAllVentures(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterTab]);

  const handleDelete = async () => {
    try {
      await ventureAPI.delete(deleteTarget);
      setAllVentures(v => v.filter(x => x.id !== deleteTarget));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const refreshVentures = () => {
    const req = filterTab === 'mine' ? ventureAPI.getMyVentures() : ventureAPI.getAll();
    req.then(({ data }) =>
      setAllVentures(Array.isArray(data) ? data : (data?.data ?? [])));
  };

  return (
    <AppLayout>
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 m-0">Ventures</h1>
            <p className="text-gray-600 mt-1">Discover and co-venture on exciting opportunities.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50 flex items-center gap-2" onClick={() => navigate('/ventures/dashboard')}>
              <img src={DashboardIcon} alt="Dashboard" style={{width: '18px', height: '18px'}} /> Dashboard
            </button>
            <button className="px-4 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50" onClick={() => navigate('/ventures/analytics')}>
              📈 Analytics
            </button>
            <Link to="/ventures/new" className="px-5 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg border-none">+ List Venture</Link>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6">
          <button className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${filterTab === 'all' ? 'bg-purple-600 text-white border-2 border-purple-600' : 'bg-white border-2 border-purple-400 text-purple-600 hover:bg-purple-50'}`}
            onClick={() => setFilterTab('all')}>All Ventures</button>
          <button className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${filterTab === 'mine' ? 'bg-purple-600 text-white border-2 border-purple-600' : 'bg-white border-2 border-purple-400 text-purple-600 hover:bg-purple-50'}`}
            onClick={() => setFilterTab('mine')}>My Ventures</button>
        </div>

        {/* ── Filter bar ── */}
        <FilterBar
          search={search}           onSearch={handleSearch}
          category={category}       onCategory={handleCategory}
          categoryOptions={VENTURE_INDUSTRIES}
          minPrice={minPrice}       onMinPrice={handleMinPrice}
          maxPrice={maxPrice}       onMaxPrice={handleMaxPrice}
          sortBy={sortBy}           onSort={handleSort}
          onClear={clearAll}        activeFilterCount={activeFilterCount}
          placeholder="Search ventures by name or description…"
          theme="light"
        />

        {/* ── Result count ── */}
        {!loading && allVentures.length > 0 && (
          <div className="text-sm text-gray-600 mb-4">
            {totalCount} venture{totalCount !== 1 ? 's' : ''} found
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">◈</div>
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
              {activeFilterCount > 0 ? 'No ventures match your filters' :
               filterTab === 'mine' ? "You haven't listed any ventures yet" :
               'No ventures listed yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeFilterCount > 0
                ? 'Try adjusting your search or filters.'
                : 'Be the first to list a venture and attract co-venturers.'}
            </p>
            {activeFilterCount > 0
              ? <button className="px-4 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50" onClick={clearAll}>Clear Filters</button>
              : <Link to="/ventures/new" className="px-5 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-purple-50">+ List Venture</Link>
            }
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginated.map(v => (
                <VentureCard
                  key={v.id}
                  venture={v}
                  isOwner={v.listedBy?.id === user?.id}
                  likeState={getLike(v.id)}
                  onLike={() => toggleLike(v.id)}
                  onView={() => setDetailTarget(v)}
                  onApply={() => setApplyTarget(v)}
                  onEdit={() => navigate(`/ventures/${v.id}/edit`)}
                  onDelete={() => setDeleteTarget(v.id)}
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

      {/* ── Modals ── */}
      {detailTarget && (
        <VentureDetailModal
          venture={detailTarget}
          onClose={() => { setDetailTarget(null); refreshVentures(); }}
          onApply={() => { setApplyTarget(detailTarget); setDetailTarget(null); }}
          onEdit={() => { navigate(`/ventures/${detailTarget.id}/edit`); setDetailTarget(null); }}
          onDelete={() => { setDeleteTarget(detailTarget.id); setDetailTarget(null); }}
        />
      )}

      {applyTarget && (
        <CoVentureModal venture={applyTarget} onClose={() => setApplyTarget(null)} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Venture?"
        message="This will permanently delete the venture and all associated applications. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}

// ─── Venture Card ─────────────────────────────────────────────────────────────
function VentureCard({ venture, isOwner, onView, onApply, onEdit, onDelete,
                        likeState, onLike }) {
  const b = venture.brandDetails || {};
  const shortDesc = `${b.description?.slice(0, 130) || ''}${b.description?.length > 130 ? '…' : ''}`;
  return (
    <div className="card-glow-hover p-5 bg-white border border-gray-200 rounded-[14px] shadow-sm cursor-pointer flex flex-col" onClick={onView}>
      <div className="flex flex-col flex-1">
        <div className="flex items-start gap-3 mb-4">
          {b.ventureImageUrl
            ? <img src={b.ventureImageUrl} alt={b.brandName} className="w-12 h-12 rounded-[10px] object-cover" />
            : <div className="w-12 h-12 rounded-[10px] bg-indigo-50 border border-indigo-200 flex items-center justify-center font-display text-xl font-bold text-indigo-600 flex-shrink-0">{b.brandName?.[0] || '?'}</div>
          }
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 flex-wrap mb-1">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded">{b.industry?.replace(/_/g, ' ')}</span>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs font-semibold rounded">{TYPE_LABELS[b.ventureType] || b.ventureType}</span>
            </div>
            {(venture.canEdit ?? isOwner) && <div className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded">Owner</div>}
          </div>
        </div>
        <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{b.brandName}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-1">{shortDesc}</p>
        {b.dealValue && (
          <div className="text-lg font-bold text-green-600 mb-3">₹{Number(b.dealValue).toLocaleString('en-IN')}</div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-3 mb-3">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span title="Views" className="flex items-center gap-1">👁 {venture.views || 0}</span>
          <span title="Applications" className="flex items-center gap-1">📋 {venture.coVentureApplicationCount || 0}</span>
          <LikeButton liked={likeState?.liked} count={likeState?.count} onToggle={onLike} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
        {(venture.canEdit ?? isOwner) ? (
          <>
            <button className="px-3 py-1.5 bg-white border-2 border-purple-400 text-purple-600 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50" onClick={onEdit}>Edit</button>
            <button className="px-3 py-1.5 bg-red-500 border border-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-red-600" onClick={onDelete}>Delete</button>
          </>
        ) : (
          <button className="px-3 py-1.5 bg-white border-2 border-purple-400 text-purple-600 rounded-lg text-xs font-semibold transition-all duration-200 hover:bg-purple-50" onClick={onApply}>Co-Venture →</button>
        )}
        {b.website && (
          <a href={b.website} target="_blank" rel="noreferrer"
             className="px-3 py-1.5 bg-white border-2 border-purple-400 text-purple-600 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50 flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <ArrowUpRight size={17} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Venture Detail Modal ─────────────────────────────────────────────────────
function VentureDetailModal({ venture, onClose, onApply, onEdit, onDelete }) {
  const { user } = useAuth();
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched            = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    ventureAPI.get(venture.id)
      .then(({ data }) => setDetail(data?.data ?? data))
      .catch(() => setDetail(venture))
      .finally(() => setLoading(false));
  }, [venture.id]);

  const b = (detail || venture)?.brandDetails || {};
  const c = (detail || venture)?.contactInfo  || {};

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-slideUp">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-purple-100/30 blur-3xl pointer-events-none" />
        <button className="absolute top-4 right-4 z-20 bg-transparent border-none text-gray-400 text-xl cursor-pointer transition-colors duration-200 hover:text-gray-700" onClick={onClose}>✕</button>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="relative z-10 p-8 pb-6">
              <div className="flex items-center gap-4 mb-6">
                {b.ventureImageUrl
                  ? <img src={b.ventureImageUrl} alt={b.brandName}
                         className="w-14 h-14 rounded-xl object-cover" />
                  : <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-display text-2xl font-bold text-indigo-600">
                      {b.brandName?.[0] || '?'}
                    </div>
                }
                <div>
                  <h2 className="font-display text-[1.75rem] font-semibold text-gray-900 m-0">{b.brandName}</h2>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {b.industry && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded">{b.industry.replace(/_/g, ' ')}</span>
                    )}
                    {b.ventureType && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs font-semibold rounded">
                        {TYPE_LABELS[b.ventureType] || b.ventureType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mb-6 flex-wrap">
                {b.dealValue && (
                  <div className="px-4 py-2 bg-green-50 border border-green-300 rounded-lg text-sm text-green-700">
                    💰 ₹{Number(b.dealValue).toLocaleString('en-IN')}
                  </div>
                )}
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  👁 {(detail?.views ?? venture.views) || 0} views
                </div>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  📋 {(detail?.coVentureApplicationCount ??
                       venture.coVentureApplicationCount) || 0} applications
                </div>
              </div>
            </div>

            <div className="relative z-10 px-8">
              {b.description && (
                <Section title="About">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {b.description}
                  </p>
                </Section>
              )}

              {(c.email || c.phoneNumber) && (
                <Section title="Contact">
                  <div className="grid grid-cols-2 gap-3">
                    {c.email       && <DetailItem label="Email" value={c.email} />}
                    {c.phoneNumber && <DetailItem label="Phone" value={c.phoneNumber} />}
                  </div>
                </Section>
              )}

              {(b.website || b.videoUrl) && (
                <Section title="Links">
                  <div className="flex gap-3 flex-wrap">
                    {b.website && (
                      <a href={b.website} target="_blank" rel="noreferrer"
                         className="px-4 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50">🌐 Website ↗</a>
                    )}
                    {b.videoUrl && (
                      <a href={b.videoUrl} target="_blank" rel="noreferrer"
                         className="px-4 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50">🎬 Video ↗</a>
                    )}
                  </div>
                </Section>
              )}

              {(detail || venture).stage && (
                <Section title="Current Stage">
                  <span className="inline-block px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-xs text-indigo-600">
                    {{ IDEA: '💡 Idea', MVP: '🛠 MVP',
                       REVENUE_GENERATING: '💰 Revenue Generating',
                       SCALING: '🚀 Scaling' }[(detail || venture).stage]}
                  </span>
                </Section>
              )}

              {(detail || venture).lookingFor && (
                <Section title="Looking For">
                  <p className="text-gray-700 leading-relaxed text-sm m-0">
                    {(detail || venture).lookingFor}
                  </p>
                </Section>
              )}

              {(detail || venture).currentProblem && (
                <Section title="Current Challenge">
                  <p className="text-gray-700 leading-relaxed text-sm m-0">
                    {(detail || venture).currentProblem}
                  </p>
                </Section>
              )}

              {detail?.listedBy && (
                <Section title="Listed By">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-600 text-sm">
                      {detail.listedBy.firstname?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {detail.listedBy.firstname} {detail.listedBy.lastname}
                      </div>
                      <div className="text-xs text-gray-600">
                        {detail.listedBy.email}
                      </div>
                    </div>
                  </div>
                </Section>
              )}
            </div>

            {/* Actions */}
            <div className="relative z-10 px-8 pb-8 flex gap-3 flex-wrap">
              {(venture.canEdit ?? ((detail || venture).listedBy?.id === user?.id)) ? (
                <>
                  <button className="px-5 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50" onClick={onEdit}>✏ Edit</button>
                  <button className="px-5 py-2 bg-red-500 border border-red-500 text-white rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-red-600" onClick={onDelete}>Delete</button>
                </>
              ) : (
                <button className="px-5 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-purple-50" onClick={onApply}>Co-Venture →</button>
              )}
              <button className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-600 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-50" onClick={onClose}>Close</button>
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
      <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">{title}</div>
      {children}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}