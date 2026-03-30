import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Boxes, IndianRupee, ShoppingCart, CreditCard, Clock3 } from 'lucide-react';
import { cocreationAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

export default function CoCreationDashboardPage() {
  const navigate                        = useNavigate();
  const [tab, setTab]                   = useState('listings');
  const [listings, setListings]         = useState([]);   // Software[]  (with purchaseCount)
  const [purchases, setPurchases]       = useState([]);   // SoftwarePurchase[]
  const [loading, setLoading]           = useState(true);
  const [confirmingId, setConfirmingId] = useState(null); // purchaseId being confirmed
  const [githubModal, setGithubModal]   = useState(null); // { link, softwareName }

  const load = () => {
    setLoading(true);
    Promise.all([
      cocreationAPI.getMyListings(),
      cocreationAPI.getMyPurchases(),
    ]).then(([l, p]) => {
      setListings(Array.isArray(l.data) ? l.data : (l.data?.data ?? []));
      setPurchases(Array.isArray(p.data) ? p.data : (p.data?.data ?? []));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (purchaseId, softwareName) => {
    setConfirmingId(purchaseId);
    try {
      const { data } = await cocreationAPI.confirmPurchase(purchaseId);
      if (data.githubLink) {
        setGithubModal({ link: data.githubLink, softwareName });
      }
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to confirm. Please try again.');
    } finally { setConfirmingId(null); }
  };

  // Stats
  const completedPurchases = purchases.filter(p => p.paymentStatus === 'COMPLETED');
  const totalRevenue = listings.reduce((sum, s) => sum + (s.price * (s.purchaseCount || 0)), 0);
  const totalSpent   = completedPurchases.reduce((sum, p) => sum + (p.software?.price || 0), 0);
  const pendingConfirm = completedPurchases.filter(p => p.completionStatus === 'PENDING').length;

  return (
    <AppLayout>
      <div className="ventures-page cocreation-dashboard-page">
        <div className="page-header cocreation-dashboard-header">
          <div>
            <h1>CoCreation Dashboard</h1>
            <p>Manage your software listings and purchases.</p>
          </div>
          <button className="btn-secondary cocreation-btn" onClick={() => navigate('/cocreation')}>
            <ArrowLeft size={16} /> Back to CoCreation
          </button>
        </div>

        <div className="cocreation-stats-grid">
          <StatCard label="Total Listings" value={listings.length} icon={<Boxes size={18} />} />
          <StatCard label="Total Sales" value={listings.reduce((s, x) => s + (x.purchaseCount || 0), 0)}
                    icon={<IndianRupee size={18} />} color="#047857" />
          <StatCard label="Revenue" value={`₹${Number(totalRevenue).toLocaleString('en-IN')}`}
                    icon={<IndianRupee size={18} />} color="#047857" />
          <StatCard label="My Purchases" value={completedPurchases.length} icon={<ShoppingCart size={18} />} color="#6d28d9" />
          <StatCard label="Total Spent" value={`₹${Number(totalSpent).toLocaleString('en-IN')}`}
                    icon={<CreditCard size={18} />} color="#1d4ed8" />
          {pendingConfirm > 0 && (
            <StatCard label="Awaiting Confirm" value={pendingConfirm}
                      icon={<Clock3 size={18} />} color="#7e22ce" />
          )}
        </div>

        {/* Tabs */}
        <div className="filter-tabs cocreation-filter-tabs">
          <button className={`filter-tab ${tab === 'listings'  ? 'active' : ''}`}
            onClick={() => setTab('listings')}>
            My Listings ({listings.length})
          </button>
          <button className={`filter-tab ${tab === 'purchases' ? 'active' : ''}`}
            onClick={() => setTab('purchases')}>
            My Purchases ({completedPurchases.length})
            {pendingConfirm > 0 && (
              <span className="cocreation-tab-badge">
                {pendingConfirm}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : tab === 'listings' ? (
          listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⟁</div>
              <h3>No listings yet</h3>
              <button className="btn-primary" onClick={() => navigate('/cocreation')}>
                List Software
              </button>
            </div>
          ) : (
            <div className="cocreation-row-list">
              {listings.map(s => (
                <ListingRow
                  key={s.id}
                  item={s}
                  onAnalytics={() => navigate(`/cocreation/${s.id}/analytics`)}
                />
              ))}
            </div>
          )
        ) : (
          completedPurchases.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>No purchases yet</h3>
              <button className="btn-primary" onClick={() => navigate('/cocreation')}>
                Browse Software
              </button>
            </div>
          ) : (
            <div className="cocreation-row-list">
              {completedPurchases.map(p => (
                <PurchaseRow
                  key={p.id}
                  purchase={p}
                  onConfirm={() => handleConfirm(p.id, p.software?.name)}
                  confirming={confirmingId === p.id}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* GitHub link reveal modal */}
      {githubModal && (
        <div className="modal-overlay" onClick={() => setGithubModal(null)}>
          <div className="modal-card cocreation-light-modal" style={{ maxWidth: 440, textAlign: 'center' }}
               onClick={e => e.stopPropagation()}>
            <div className="modal-glow" />
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔓</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', marginBottom: '0.5rem',
                         color: '#e0e0f0' }}>
              Purchase Confirmed!
            </h2>
            <p style={{ color: '#a0a0b0', marginBottom: '1.25rem' }}>
              Thanks for confirming <strong style={{ color: '#e0e0f0' }}>
                {githubModal.softwareName}</strong>.
            </p>
            <div style={{ padding: '0.875rem', background: 'rgba(110,200,150,0.08)',
                          border: '1px solid rgba(110,200,150,0.2)', borderRadius: 8,
                          marginBottom: '1.25rem', wordBreak: 'break-all' }}>
              <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.4rem' }}>
                🔗 GitHub Repository
              </div>
              <a href={githubModal.link} target="_blank" rel="noreferrer"
                 style={{ color: '#6ec896', fontWeight: 600, fontSize: '0.875rem' }}>
                {githubModal.link}
              </a>
            </div>
            <button className="btn-primary" onClick={() => setGithubModal(null)}
              style={{ width: '100%' }}>
              Done
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ─── Listing Row (seller view) ────────────────────────────────────────────────
function ListingRow({ item, onAnalytics }) {
  const [expanded, setExpanded] = useState(false);
  const sales = item.purchaseCount || 0;

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem', cursor: 'pointer' }}
           onClick={() => setExpanded(v => !v)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#e0e0f0', fontSize: '0.95rem' }}>
            {item.name}
            {item.official && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.68rem', color: '#c8a96e',
                             background: 'rgba(200,169,110,0.12)',
                             border: '1px solid rgba(200,169,110,0.3)',
                             padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>
                ✦ Official
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>
            {item.category?.replace(/_/g, ' ')} · {item.pricingDemand}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
                          fontWeight: 700, color: '#c8a96e' }}>
              ₹{Number(item.price).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#888' }}>per sale</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem',
                          fontWeight: 700, color: '#6ec896' }}>
              {sales}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#888' }}>
              {sales === 1 ? 'buyer' : 'buyers'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
                          fontWeight: 700, color: '#6ec896' }}>
              ₹{Number(item.price * sales).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#888' }}>revenue</div>
          </div>
          <span style={{ color: '#666', fontSize: '0.85rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)',
                      padding: '0.875rem 1.25rem',
                      display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
                      alignItems: 'center' }}>
          <button className="btn-ghost btn-sm" onClick={onAnalytics}
            style={{ fontSize: '0.78rem' }}>
            📊 Analytics
          </button>
          <span style={{ fontSize: '0.78rem', color: '#888' }}>
            👁 {item.views || 0} views · ✦ {sales} paid
            {sales > 0 && ` · Revenue: ₹${Number(item.price * sales).toLocaleString('en-IN')}`}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Purchase Row (buyer view) ────────────────────────────────────────────────
function PurchaseRow({ purchase, onConfirm, confirming }) {
  const [expanded, setExpanded] = useState(false);
  const sw           = purchase.software || {};
  const isConfirmed  = purchase.completionStatus === 'CONFIRMED';
  const isPending    = purchase.completionStatus === 'PENDING' &&
                       purchase.paymentStatus === 'COMPLETED';
  const helpPaid     = purchase.coBrotherHelpPaid;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${isConfirmed
        ? 'rgba(110,200,150,0.2)'
        : isPending
        ? 'rgba(160,110,200,0.2)'
        : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem', cursor: 'pointer' }}
           onClick={() => setExpanded(v => !v)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#e0e0f0', fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        flexWrap: 'wrap' }}>
            {sw.name || '—'}
            {isConfirmed && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ec896',
                             background: 'rgba(110,200,150,0.1)',
                             border: '1px solid rgba(110,200,150,0.3)',
                             padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                ✓ Confirmed
              </span>
            )}
            {isPending && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a06ec8',
                             background: 'rgba(160,110,200,0.1)',
                             border: '1px solid rgba(160,110,200,0.3)',
                             padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                ⏳ Awaiting Confirmation
              </span>
            )}
            {helpPaid && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ec896',
                             background: 'rgba(110,200,150,0.1)',
                             border: '1px solid rgba(110,200,150,0.3)',
                             padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                ◆ CoBrother Active
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>
            {sw.category?.replace(/_/g, ' ')} · Purchased{' '}
            {purchase.soldAt
              ? new Date(purchase.soldAt).toLocaleDateString('en-IN',
                  { day: 'numeric', month: 'short', year: 'numeric' })
              : ''}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
                          fontWeight: 700, color: '#a06ec8' }}>
              ₹{Number(sw.price || 0).toLocaleString('en-IN')}
            </div>
            {purchase.coBrotherOptIn && !helpPaid && (
              <div style={{ fontSize: '0.68rem', color: '#888' }}>+ ₹1,000 pending</div>
            )}
            {helpPaid && (
              <div style={{ fontSize: '0.68rem', color: '#888' }}>+ ₹1,000 CoBrother</div>
            )}
          </div>
          <span style={{ color: '#666', fontSize: '0.85rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)',
                      padding: '1rem 1.25rem' }}>

          {/* GitHub access */}
          {sw.githubLink && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                          marginBottom: '0.875rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: '#c0c0d0' }}>🔗 GitHub Repository</span>
              <a href={sw.githubLink} target="_blank" rel="noreferrer"
                 style={{ fontSize: '0.8rem', color: '#6ec896', fontWeight: 600,
                          textDecoration: 'none' }}>
                Open →
              </a>
            </div>
          )}

          {/* CoBrother status */}
          {helpPaid ? (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(110,200,150,0.07)',
                          border: '1px solid rgba(110,200,150,0.2)', borderRadius: 8,
                          marginBottom: '0.875rem', fontSize: '0.82rem', color: '#6ec896' }}>
              ◆ CoBrother assigned — check your email for introduction details.
            </div>
          ) : null}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isPending && (
              <button
                className="btn-primary btn-sm"
                onClick={onConfirm}
                disabled={confirming}
                style={{ fontSize: '0.78rem' }}>
                {confirming ? <span className="btn-spinner" /> : '✓ Mark as Complete'}
              </button>
            )}
            {isConfirmed && (
              <span style={{ fontSize: '0.78rem', color: '#6ec896', fontWeight: 600,
                             alignSelf: 'center' }}>
                ✓ Purchase confirmed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color = '#111827' }) {
  return (
    <div className="cocreation-stat-card">
      <div className="cocreation-stat-icon">{icon}</div>
      <div className="cocreation-stat-value" style={{ color }}>
        {value}
      </div>
      <div className="cocreation-stat-label">{label}</div>
    </div>
  );
}