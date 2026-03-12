import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { domainAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

const CATEGORIES = ['TECH','FINANCE','HEALTHCARE','EDUCATION','ECOMMERCE',
                    'MEDIA','REAL_ESTATE','FOOD','TRAVEL','GAMING','OTHER'];
const EXTENSIONS = ['.com','.in','.co','.io','.net','.org','.co.in','.tech','.store','Other'];

const STATUS_COLORS = {
  AVAILABLE: { color: '#6ec896', bg: 'rgba(110,200,150,0.1)', border: 'rgba(110,200,150,0.3)' },
  PENDING:   { color: '#c8a96e', bg: 'rgba(200,169,110,0.1)', border: 'rgba(200,169,110,0.3)' },
  SOLD:      { color: '#c86e6e', bg: 'rgba(200,110,110,0.1)', border: 'rgba(200,110,110,0.3)' },
};

export default function DomainsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [domains, setDomains]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [buyTarget, setBuyTarget]     = useState(null);
  const [successDomain, setSuccessDomain] = useState(null);
  const [filter, setFilter]           = useState('all');

  useEffect(() => {
    setLoading(true);
    domainAPI.getAll()
      .then(({ data }) => setDomains(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setDomains([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    await domainAPI.delete(id);
    setDomains(d => d.filter(x => x.id !== id));
  };

  const filtered = filter === 'mine'
    ? domains.filter(d => d.listedBy?.id === user?.id)
    : domains;

  return (
    <AppLayout>
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>Domains</h1>
            <p>Buy and sell premium domain names.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={() => navigate('/domains/dashboard')}>
              📊 Dashboard
            </button>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + List Domain
            </button>
          </div>
        </div>

        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Domains</button>
          <button className={`filter-tab ${filter === 'mine' ? 'active' : ''}`} onClick={() => setFilter('mine')}>My Listings</button>
        </div>

        {showForm && (
          <div className="community-form-section">
            <DomainForm
              onSaved={(d) => { setDomains(prev => [d, ...prev]); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◇</div>
            <h3>No domains listed yet</h3>
            <p>Be the first to list a domain for sale.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>List a Domain</button>
          </div>
        ) : (
          <div className="ventures-grid">
            {filtered.map(d => (
              <DomainCard
                key={d.id}
                domain={d}
                isOwner={d.listedBy?.id === user?.id}
                onBuy={() => setBuyTarget(d)}
                onDelete={() => handleDelete(d.id)}
              />
            ))}
          </div>
        )}
      </div>

      {buyTarget && (
        <BuyDomainModal
          domain={buyTarget}
          onClose={() => setBuyTarget(null)}
          onSuccess={(d) => {
            setSuccessDomain(d);
            setBuyTarget(null);
            setDomains(prev => prev.map(x => x.id === d.id ? d : x));
          }}
        />
      )}

      {successDomain && (
        <PurchaseSuccessModal
          domain={successDomain}
          onClose={() => setSuccessDomain(null)}
        />
      )}
    </AppLayout>
  );
}

// ─── Domain Card ──────────────────────────────────────────────────────────────
function DomainCard({ domain, isOwner, onBuy, onDelete }) {
  const s = STATUS_COLORS[domain.domainStatus] || STATUS_COLORS.AVAILABLE;
  return (
    <div className="venture-card">
      <div className="venture-card-top">
        <div className="venture-logo-placeholder" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c8a96e' }}>
          {domain.domainExtension || '.?'}
        </div>
        <div className="venture-card-meta">
          <span className="venture-industry">{domain.domainCategory?.replace(/_/g, ' ')}</span>
          {/* <span className="venture-type">{domain.pricingDemand}</span> */}
          
          <h3 className="venture-name">
            {domain.domainName}{domain.domainExtension}
          </h3>
        </div>
        {isOwner && <div className="owner-badge">Owner</div>}
      </div>


      <div style={{ margin: '0.5rem 0 0.75rem' }}>
        <span style={{
          padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
          color: s.color, background: s.bg, border: `1px solid ${s.border}`
        }}>
          {domain.domainStatus}
        </span>
      </div>

      <div className="venture-deal">
        ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
      </div>

      <div className="venture-card-footer">
        <div className="venture-stats">
          {/* <span title="Views">👁 {domain.views || 0}</span> */}
        </div>
        <div className="venture-card-actions">
          {isOwner ? (
            <button className="btn-danger btn-sm" onClick={onDelete}>Remove</button>
          ) : domain.domainStatus === 'AVAILABLE' ? (
            <button className="btn-primary btn-sm" onClick={onBuy}>Buy Now →</button>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#888' }}>
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
    contactInfo: { email: '', phoneNumber: '' },
    agreement: { terms: false },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const setContact = (k, v) => setForm(f => ({ ...f, contactInfo: { ...f.contactInfo, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await domainAPI.create(form);
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to list domain.');
    } finally { setLoading(false); }
  };

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
              const dotIndex = full.indexOf('.');
              if (dotIndex !== -1) {
                setForm(f => ({
                  ...f,
                  domainName: full.slice(0, dotIndex),
                  domainExtension: full.slice(dotIndex),
                }));
              } else {
                setForm(f => ({ ...f, domainName: full, domainExtension: '' }));
              }
            }}
            placeholder="e.g. mybrand.com"
            required
          />
          <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.3rem', display: 'block' }}>
            Include the extension (e.g. .com, .in, .io)
          </span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Asking Price (₹) <span className="required">*</span></label>
            <input
              type="number" min="0"
              value={form.askingPrice}
              onChange={e => setForm(f => ({ ...f, askingPrice: e.target.value }))}
              placeholder="e.g. 50000"
              required
            />
          </div>
          <div className="form-group">
            <label>Pricing Type <span className="required">*</span></label>
            <select value={form.pricingDemand} onChange={e => setForm(f => ({ ...f, pricingDemand: e.target.value }))} required>
              <option value="">Select pricing type</option>
              <option value="FIXED">Fixed Price</option>
              <option value="NEGOTIABLE">Negotiable</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Contact Email <span className="required">*</span></label>
            <input type="email" value={form.contactInfo.email} onChange={e => setContact('email', e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.contactInfo.phoneNumber} onChange={e => setContact('phoneNumber', e.target.value)} placeholder="10-digit number" maxLength={10} />
          </div>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.agreement.terms}
            onChange={e => setForm(f => ({ ...f, agreement: { terms: e.target.checked } }))}
            required
          />
          <span>I confirm I own this domain and agree to the Terms & Conditions.</span>
        </label>

        {error && <div className="form-error">{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'List Domain →'}
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
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'CoBrother',
        description: `Purchase ${domain.domainName}${domain.domainExtension}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            await domainAPI.verifyPayment(domain.id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId:   response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess({ ...domain, domainStatus: 'SOLD', paymentStatus: 'COMPLETED' });
          } catch {
            setError('Payment verification failed. Contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: async () => {
            await domainAPI.handleFailure(domain.id);
            setLoading(false);
          }
        },
        prefill: {},
        theme: { color: '#c8a96e' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async () => {
        await domainAPI.handleFailure(domain.id);
        setError('Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      setError(err.response?.data || 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 480 }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div className="modal-badge">Domain Purchase</div>
          <h2>{domain.domainName}{domain.domainExtension}</h2>
          <p>{domain.domainCategory?.replace(/_/g, ' ')} · {domain.pricingDemand}</p>
        </div>

        <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(110,200,150,0.08)', border: '1px solid rgba(110,200,150,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>Purchase Price</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#6ec896', fontFamily: 'Cormorant Garamond, serif' }}>
            ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ padding: '0.875rem 1rem', background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8, marginBottom: '1.5rem', fontSize: '0.875rem', color: '#c8a96e' }}>
          ⏳ After payment, you will be updated within <strong>24 hours</strong> with domain transfer details.
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={handleBuy} disabled={loading} style={{ flex: 1 }}>
            {loading ? <span className="btn-spinner" /> : `Pay ₹${Number(domain.askingPrice).toLocaleString('en-IN')} →`}
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
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Purchase Successful!
        </h2>
        <p style={{ color: '#a0a0b0', marginBottom: '1.5rem' }}>
          You've successfully purchased <strong style={{ color: '#e0e0f0' }}>{domain.domainName}{domain.domainExtension}</strong>
        </p>
        <div style={{ padding: '1rem', background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 10, marginBottom: '1.5rem', fontSize: '0.875rem', color: '#c8a96e' }}>
          ⏳ A confirmation email has been sent to you. The seller will initiate the domain transfer within <strong>24 hours</strong>.
        </div>
        <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>Done</button>
      </div>
    </div>
  );
}