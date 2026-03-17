import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { domainAPI, cocreationAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

export default function PurchasesPage() {
  const navigate                      = useNavigate();
  const [tab, setTab]                 = useState('all');
  const [domains, setDomains]         = useState([]);
  const [swPurchases, setSwPurchases] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [helpModal, setHelpModal]     = useState(null);
  const [helpSuccess, setHelpSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      domainAPI.getMyPurchases().catch(() => ({ data: [] })),
      cocreationAPI.getMyPurchases().catch(() => ({ data: [] })),
    ]).then(([d, s]) => {
      setDomains(Array.isArray(d.data) ? d.data : []);
      setSwPurchases(Array.isArray(s.data) ? s.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const completedDomains  = domains.filter(d => d.paymentStatus === 'COMPLETED');
  const completedSoftware = swPurchases.filter(p => p.paymentStatus === 'COMPLETED');
  const totalItems        = completedDomains.length + completedSoftware.length;

  const displayItems =
    tab === 'domains'  ? completedDomains.map(d => ({ ...d, _type: 'domain' }))
  : tab === 'software' ? completedSoftware.map(p => ({ ...p, _type: 'software' }))
  : [
      ...completedDomains.map(d => ({ ...d, _type: 'domain' })),
      ...completedSoftware.map(p => ({ ...p, _type: 'software' })),
    ];

  return (
    <AppLayout>
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>My Purchases</h1>
            <p>All your domain and software purchases in one place.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Total Purchases"  value={totalItems}                  icon="🛒" />
          <StatCard label="Domains"          value={completedDomains.length}     icon="◇" color="#6eadc8" />
          <StatCard label="Software"         value={completedSoftware.length}    icon="⟁" color="#a06ec8" />
          <StatCard label="CoBrother Active"
            value={completedSoftware.filter(p => p.coBrotherHelpPaid).length}
            icon="◆" color="#6ec896" />
        </div>

        <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
          {[
            { id: 'all',      label: `All (${totalItems})` },
            { id: 'domains',  label: `◇ Domains (${completedDomains.length})` },
            { id: 'software', label: `⟁ Software (${completedSoftware.length})` },
          ].map(t => (
            <button key={t.id}
              className={`filter-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : displayItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>No purchases yet</h3>
            <p>Browse domains and software to make your first purchase.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => navigate('/domains')}>Browse Domains</button>
              <button className="btn-secondary" onClick={() => navigate('/cocreation')}>Browse Software</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {displayItems.map((item) =>
              item._type === 'domain' ? (
                <DomainPurchaseRow key={'d-' + item.id} domain={item} />
              ) : (
                <SoftwarePurchaseRow key={'s-' + item.id} purchase={item} onGetHelp={() => setHelpModal(item)} />
              )
            )}
          </div>
        )}
      </div>

      {helpModal && (
        <CoBrotherHelpModal
          purchase={helpModal}
          onClose={() => setHelpModal(null)}
          onSuccess={(updated) => {
            setSwPurchases(prev => prev.map(p => p.id === updated.id ? updated : p));
            setHelpModal(null);
            setHelpSuccess(updated);
          }}
        />
      )}

      {helpSuccess && (
        <div className="modal-overlay" onClick={() => setHelpSuccess(null)}>
          <div className="modal-card" style={{ maxWidth: 440, textAlign: 'center' }}>
            <div className="modal-glow" />
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◆</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem',
                         marginBottom: '0.5rem', color: '#e0e0f0' }}>CoBrother Help Activated!</h2>
            <p style={{ color: '#a0a0b0', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              A CoBrother will reach out within <strong style={{ color: '#c8a96e' }}>24 hours</strong>{' '}
              to help with <strong style={{ color: '#e0e0f0' }}>{helpSuccess.software?.name}</strong>.
            </p>
            <div style={{ padding: '0.875rem', background: 'rgba(110,200,150,0.08)',
                          border: '1px solid rgba(110,200,150,0.2)', borderRadius: 10,
                          marginBottom: '1.5rem', fontSize: '0.82rem', color: '#6ec896' }}>
              ✓ ₹1,000 paid · CoBrother assigned · Expect contact via email
            </div>
            <button className="btn-primary" onClick={() => setHelpSuccess(null)} style={{ width: '100%' }}>Done</button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function DomainPurchaseRow({ domain }) {
  return (
    <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6eadc8',
                           background: 'rgba(110,173,200,0.12)', border: '1px solid rgba(110,173,200,0.25)',
                           padding: '0.15rem 0.45rem', borderRadius: 4 }}>◇ Domain</span>
            {domain.verified && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ec896' }}>✓ Verified</span>}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#e0e0f0' }}>
            {domain.domainName}{domain.domainExtension}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#888' }}>{domain.pricingDemand}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 700, color: '#6ec896' }}>
            ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#888' }}>✓ Payment Confirmed</div>
        </div>
      </div>
      <div style={{ marginTop: '0.875rem', padding: '0.75rem 1rem',
                    background: 'rgba(200,169,110,0.07)', border: '1px solid rgba(200,169,110,0.18)',
                    borderRadius: 8, fontSize: '0.82rem', color: '#c8a96e' }}>
        ⏳ Domain transfer in progress — seller will initiate within 24 hours.
      </div>
    </div>
  );
}

function SoftwarePurchaseRow({ purchase, onGetHelp }) {
  const sw        = purchase.software || {};
  const helpPaid  = purchase.coBrotherHelpPaid;
  const confirmed = purchase.completionStatus === 'CONFIRMED';

  return (
    <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${helpPaid ? 'rgba(110,200,150,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a06ec8',
                           background: 'rgba(160,110,200,0.12)', border: '1px solid rgba(160,110,200,0.25)',
                           padding: '0.15rem 0.45rem', borderRadius: 4 }}>⟁ Software</span>
            {confirmed && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ec896' }}>✓ Completed</span>}
            {helpPaid && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ec896',
                                        background: 'rgba(110,200,150,0.1)', border: '1px solid rgba(110,200,150,0.3)',
                                        padding: '0.15rem 0.45rem', borderRadius: 4 }}>◆ CoBrother Active</span>}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e0e0f0' }}>{sw.name || '—'}</div>
          {sw.description && (
            <div style={{ fontSize: '0.78rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap', maxWidth: 400 }}>{sw.description}</div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 700, color: '#a06ec8' }}>
            ₹{Number(sw.price || 0).toLocaleString('en-IN')}
          </div>
          {helpPaid && <div style={{ fontSize: '0.72rem', color: '#888' }}>+ ₹1,000 CoBrother</div>}
          <div style={{ fontSize: '0.72rem', color: '#888' }}>✓ Payment Confirmed</div>
        </div>
      </div>

      {sw.githubLink && (
        <div style={{ marginTop: '0.875rem', padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: '#c0c0d0' }}>🔗 GitHub Repository</span>
          <a href={sw.githubLink} target="_blank" rel="noreferrer"
             style={{ fontSize: '0.8rem', color: '#c8a96e', fontWeight: 600, textDecoration: 'none' }}>
            Open →
          </a>
        </div>
      )}

      <div style={{ marginTop: '0.875rem' }}>
        {helpPaid ? (
          <div style={{ padding: '0.875rem 1rem', background: 'rgba(110,200,150,0.07)',
                        border: '1px solid rgba(110,200,150,0.2)', borderRadius: 10 }}>
            <div style={{ fontWeight: 600, color: '#6ec896', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
              ◆ CoBrother Helper Assigned
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a0a0b0', lineHeight: 1.6 }}>
              Check your email for introduction details from your assigned CoBrother.
            </div>
          </div>
        ) : (
          <div style={{ padding: '0.875rem 1rem', background: 'rgba(160,110,200,0.06)',
                        border: '1px solid rgba(160,110,200,0.18)', borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#a06ec8', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                Need help getting started?
              </div>
              <div style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.5 }}>
                Get a dedicated CoBrother to guide you through setup and deployment.
              </div>
            </div>
            <button onClick={onGetHelp}
              style={{ padding: '0.5rem 1.1rem', borderRadius: 8, fontSize: '0.82rem',
                       fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                       background: 'rgba(160,110,200,0.15)', border: '1px solid rgba(160,110,200,0.35)',
                       color: '#a06ec8' }}>
              Get Help — ₹1,000
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CoBrotherHelpModal({ purchase, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const sw = purchase.software || {};

  const handlePay = async () => {
    setLoading(true); setError('');
    try {
      const { data: orderData } = await cocreationAPI.payCoBrotherHelp(purchase.id);
      const options = {
        key: orderData.keyId, amount: orderData.amount * 100, currency: orderData.currency,
        name: 'CoBrother', description: `CoBrother Help — ${sw.name}`, order_id: orderData.orderId,
        handler: async (response) => {
          try {
            await cocreationAPI.verifyCoBrotherHelp(purchase.id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId:   response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess({ ...purchase, coBrotherOptIn: true, coBrotherHelpPaid: true });
          } catch { setError('Payment verification failed.'); setLoading(false); }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: '#a06ec8' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { setError('Payment failed.'); setLoading(false); });
      rzp.open();
    } catch (err) { setError(err.response?.data?.error || 'Failed.'); setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 500 }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-badge" style={{ background: 'rgba(160,110,200,0.15)', color: '#a06ec8',
                                                border: '1px solid rgba(160,110,200,0.3)' }}>◆ CoBrother Help</div>
          <h2>{sw.name}</h2>
          <p>Get a dedicated expert to help you succeed with this software.</p>
        </div>
        <div style={{ margin: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {['Dedicated CoBrother assigned within 24 hours',
            'Personalised onboarding and setup guidance',
            'Help with deployment, configuration, and integration',
            'Direct communication channel with your helper'].map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#6ec896', fontSize: '0.875rem', marginTop: '0.1rem' }}>✓</span>
              <span style={{ fontSize: '0.83rem', color: '#c0c0d0', lineHeight: 1.5 }}>{line}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase',
                        letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Billing Summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.85rem' }}>
            <span style={{ color: '#666' }}>Software (already paid)</span>
            <span style={{ color: '#666' }}>₹{Number(sw.price || 0).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.85rem' }}>
            <span style={{ color: '#c0c0d0' }}>CoBrother Helper Fee</span>
            <span style={{ color: '#c0c0d0', fontWeight: 500 }}>₹1,000</span>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.625rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#e0e0f0', fontSize: '0.9rem' }}>Paying Today</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 700, color: '#c8a96e' }}>₹1,000</span>
          </div>
        </div>
        {error && <div style={{ padding: '0.75rem', background: 'rgba(200,110,110,0.08)',
                                border: '1px solid rgba(200,110,110,0.25)', borderRadius: 8,
                                marginBottom: '1rem', fontSize: '0.82rem', color: '#c86e6e' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={handlePay} disabled={loading}
            style={{ flex: 1, background: 'rgba(160,110,200,0.2)', border: '1px solid rgba(160,110,200,0.45)', color: '#c8a0f8' }}>
            {loading ? <span className="btn-spinner" /> : 'Pay ₹1,000 — Get Help →'}
          </button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = '#e0e0f0' }) {
  return (
    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color, fontFamily: 'Cormorant Garamond, serif' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>{label}</div>
    </div>
  );
}