import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      : allVentures,
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
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>Ventures</h1>
            <p>Discover and co-venture on exciting opportunities.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={() => navigate('/ventures/dashboard')}>
              📊 Dashboard
            </button>
            <button className="btn-secondary" onClick={() => navigate('/ventures/analytics')}>
              📈 Analytics
            </button>
            <Link to="/ventures/new" className="btn-primary">+ List Venture</Link>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="filter-tabs">
          <button className={`filter-tab ${filterTab === 'all'  ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}>All Ventures</button>
          <button className={`filter-tab ${filterTab === 'mine' ? 'active' : ''}`}
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
        />

        {/* ── Result count ── */}
        {!loading && allVentures.length > 0 && (
          <div style={{ fontSize: '0.78rem', color: '#666', marginBottom: '1rem' }}>
            {totalCount} venture{totalCount !== 1 ? 's' : ''} found
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="ventures-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <h3>
              {activeFilterCount > 0 ? 'No ventures match your filters' :
               filterTab === 'mine' ? "You haven't listed any ventures yet" :
               'No ventures listed yet'}
            </h3>
            <p>
              {activeFilterCount > 0
                ? 'Try adjusting your search or filters.'
                : 'Be the first to list a venture and attract co-venturers.'}
            </p>
            {activeFilterCount > 0
              ? <button className="btn-secondary" onClick={clearAll}>Clear Filters</button>
              : <Link to="/ventures/new" className="btn-primary">List Your Venture</Link>
            }
          </div>
        ) : (
          <>
            <div className="ventures-grid">
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
          isOwner={detailTarget.listedBy?.id === user?.id}
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
  return (
    <div className="venture-card" onClick={onView} style={{ cursor: 'pointer' }}>
      <div className="venture-card-top">
        {b.ventureImageUrl
          ? <img src={b.ventureImageUrl} alt={b.brandName} className="venture-logo" />
          : <div className="venture-logo-placeholder">{b.brandName?.[0] || '?'}</div>
        }
        <div className="venture-card-meta">
          <span className="venture-industry">{b.industry?.replace(/_/g, ' ')}</span>
          <span className="venture-type">{TYPE_LABELS[b.ventureType] || b.ventureType}</span>
        </div>
        {isOwner && <div className="owner-badge">Owner</div>}
      </div>

      <h3 className="venture-name">{b.brandName}</h3>
      <p className="venture-desc">
        {b.description?.slice(0, 130)}{b.description?.length > 130 ? '…' : ''}
      </p>

      {b.dealValue && (
        <div className="venture-deal">₹{Number(b.dealValue).toLocaleString('en-IN')}</div>
      )}

      <div className="venture-card-footer">
        <div className="venture-stats">
          <span title="Views">👁 {venture.views || 0}</span>
          <span title="Applications">📋 {venture.coVentureApplicationCount || 0}</span>
          <LikeButton liked={likeState?.liked} count={likeState?.count} onToggle={onLike} />
        </div>
        <div className="venture-card-actions" onClick={e => e.stopPropagation()}>
          {isOwner ? (
            <>
              <button className="btn-secondary btn-sm" onClick={onEdit}>Edit</button>
              <button className="btn-danger btn-sm" onClick={onDelete}>Delete</button>
            </>
          ) : (
            <button className="btn-primary btn-sm" onClick={onApply}>Co-Venture →</button>
          )}
          {b.website && (
            <a href={b.website} target="_blank" rel="noreferrer"
               className="btn-ghost btn-sm" onClick={e => e.stopPropagation()}>↗</a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Venture Detail Modal ─────────────────────────────────────────────────────
function VentureDetailModal({ venture, isOwner, onClose, onApply, onEdit, onDelete }) {
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem',
                          marginBottom: '1.5rem' }}>
              {b.ventureImageUrl
                ? <img src={b.ventureImageUrl} alt={b.brandName}
                       style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
                : <div style={{ width: 56, height: 56, borderRadius: 12,
                                background: 'rgba(200,169,110,0.12)',
                                border: '1px solid rgba(200,169,110,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem',
                                fontWeight: 700, color: '#c8a96e' }}>
                    {b.brandName?.[0] || '?'}
                  </div>
              }
              <div>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem',
                             fontWeight: 600 }}>{b.brandName}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
                              marginTop: '0.3rem' }}>
                  {b.industry && (
                    <span className="venture-industry">{b.industry.replace(/_/g, ' ')}</span>
                  )}
                  {b.ventureType && (
                    <span className="venture-type">
                      {TYPE_LABELS[b.ventureType] || b.ventureType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem',
                          flexWrap: 'wrap' }}>
              {b.dealValue && (
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(110,200,150,0.1)',
                              border: '1px solid rgba(110,200,150,0.2)', borderRadius: 8,
                              fontSize: '0.875rem', color: '#6ec896' }}>
                  💰 ₹{Number(b.dealValue).toLocaleString('en-IN')}
                </div>
              )}
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                            fontSize: '0.875rem', color: '#a0a0b0' }}>
                👁 {(detail?.views ?? venture.views) || 0} views
              </div>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                            fontSize: '0.875rem', color: '#a0a0b0' }}>
                📋 {(detail?.coVentureApplicationCount ??
                     venture.coVentureApplicationCount) || 0} applications
              </div>
            </div>

            {b.description && (
              <Section title="About">
                <p style={{ color: '#c0c0d0', lineHeight: 1.7, fontSize: '0.9rem' }}>
                  {b.description}
                </p>
              </Section>
            )}

            {(c.email || c.phoneNumber) && (
              <Section title="Contact">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {c.email       && <DetailItem label="Email" value={c.email} />}
                  {c.phoneNumber && <DetailItem label="Phone" value={c.phoneNumber} />}
                </div>
              </Section>
            )}

            {(b.website || b.videoUrl) && (
              <Section title="Links">
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {b.website && (
                    <a href={b.website} target="_blank" rel="noreferrer"
                       className="btn-ghost btn-sm">🌐 Website ↗</a>
                  )}
                  {b.videoUrl && (
                    <a href={b.videoUrl} target="_blank" rel="noreferrer"
                       className="btn-ghost btn-sm">🎬 Video ↗</a>
                  )}
                </div>
              </Section>
            )}

            {(detail || venture).stage && (
              <Section title="Current Stage">
                <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(200,169,110,0.1)',
                               border: '1px solid rgba(200,169,110,0.2)', borderRadius: 6,
                               fontSize: '0.8rem', color: '#c8a96e' }}>
                  {{ IDEA: '💡 Idea', MVP: '🛠 MVP',
                     REVENUE_GENERATING: '💰 Revenue Generating',
                     SCALING: '🚀 Scaling' }[(detail || venture).stage]}
                </span>
              </Section>
            )}

            {(detail || venture).lookingFor && (
              <Section title="Looking For">
                <p style={{ color: '#c0c0d0', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
                  {(detail || venture).lookingFor}
                </p>
              </Section>
            )}

            {(detail || venture).currentProblem && (
              <Section title="Current Challenge">
                <p style={{ color: '#c0c0d0', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
                  {(detail || venture).currentProblem}
                </p>
              </Section>
            )}

            {detail?.listedBy && (
              <Section title="Listed By">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%',
                                background: 'rgba(200,169,110,0.15)',
                                border: '1px solid rgba(200,169,110,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, color: '#c8a96e', fontSize: '0.9rem' }}>
                    {detail.listedBy.firstname?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: '#e0e0f0', fontSize: '0.9rem' }}>
                      {detail.listedBy.firstname} {detail.listedBy.lastname}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      {detail.listedBy.email}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem',
                          flexWrap: 'wrap' }}>
              {isOwner ? (
                <>
                  <button className="btn-secondary" onClick={onEdit}>✏ Edit</button>
                  <button className="btn-danger" onClick={onDelete}>Delete</button>
                </>
              ) : (
                <button className="btn-primary" onClick={onApply}>Co-Venture →</button>
              )}
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
                    marginBottom: '0.6rem' }}>{title}</div>
      {children}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', color: '#666', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', color: '#d0d0e0' }}>{value}</div>
    </div>
  );
}