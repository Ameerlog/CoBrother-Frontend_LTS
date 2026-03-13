import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cocreationAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

const CATEGORIES = ['SAAS','MOBILE_APP','DESKTOP','API_TOOL','AUTOMATION','ECOMMERCE','EDUCATION','OTHER'];

const STATUS_COLORS = {
  AVAILABLE: { color: '#6ec896', bg: 'rgba(110,200,150,0.1)', border: 'rgba(110,200,150,0.3)' },
  SOLD:      { color: '#c86e6e', bg: 'rgba(200,110,110,0.1)', border: 'rgba(200,110,110,0.3)' },
};

export default function CoCreationPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [software, setSoftware]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [buyTarget, setBuyTarget]         = useState(null);
  const [successItem, setSuccessItem]     = useState(null);
  const [filter, setFilter]               = useState('all');

  useEffect(() => {
    setLoading(true);
    cocreationAPI.getAll()
      .then(({ data }) => setSoftware(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setSoftware([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    await cocreationAPI.delete(id);
    setSoftware(s => s.filter(x => x.id !== id));
  };

  const filtered = filter === 'mine'
    ? software.filter(s => s.listedBy?.id === user?.id)
    : software;

  return (
    <AppLayout>
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>CoCreation</h1>
            <p>Buy and sell software products built by the community.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={() => navigate('/cocreation/dashboard')}>
              📊 Dashboard
            </button>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + List Software
            </button>
          </div>
        </div>

        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'all'  ? 'active' : ''}`} onClick={() => setFilter('all')}>All Software</button>
          <button className={`filter-tab ${filter === 'mine' ? 'active' : ''}`} onClick={() => setFilter('mine')}>My Listings</button>
        </div>

        {showForm && (
          <div className="community-form-section">
            <SoftwareForm
              onSaved={s => { setSoftware(prev => [s, ...prev]); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⟁</div>
            <h3>No software listed yet</h3>
            <p>Be the first to list a software product.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>List Software</button>
          </div>
        ) : (
          <div className="ventures-grid">
            {filtered.map(s => (
              <SoftwareCard
                key={s.id}
                item={s}
                isOwner={s.listedBy?.id === user?.id}
                onBuy={() => setBuyTarget(s)}
                onDelete={() => handleDelete(s.id)}
              />
            ))}
          </div>
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
            setSoftware(prev => prev.map(x => x.id === item.id ? item : x));
          }}
        />
      )}

      {successItem && (
        <PurchaseSuccessModal
          item={successItem}
          onClose={() => setSuccessItem(null)}
        />
      )}
    </AppLayout>
  );
}

// ─── Software Card ────────────────────────────────────────────────────────────
function SoftwareCard({ item, isOwner, onBuy, onDelete }) {
  const s = STATUS_COLORS[item.softwareStatus] || STATUS_COLORS.AVAILABLE;
  return (
    <div className="venture-card">
      <div className="venture-card-top">
        <div className="venture-logo-placeholder" style={{ fontSize: '1.1rem', color: '#c8a96e' }}>⟁</div>
        <div className="venture-card-meta">
          <span className="venture-industry">{item.category?.replace(/_/g, ' ')}</span>
          <span className="venture-type">{item.pricingDemand}</span>
        </div>
        {isOwner && <div className="owner-badge">Owner</div>}
      </div>

      <h3 className="venture-name">{item.name}</h3>

      <p style={{ fontSize: '0.82rem', color: '#a0a0b0', margin: '0.4rem 0 0.75rem', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
        <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                       color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
          {item.softwareStatus}
        </span>
      </div>

      <div className="venture-deal">₹{Number(item.price).toLocaleString('en-IN')}</div>

      <div className="venture-card-footer">
        <div className="venture-stats"><span title="Views">👁 {item.views || 0}</span></div>
        <div className="venture-card-actions">
          {isOwner ? (
            <button className="btn-danger btn-sm" onClick={onDelete}>Remove</button>
          ) : item.softwareStatus === 'AVAILABLE' ? (
            <button className="btn-primary btn-sm" onClick={onBuy}>Buy Now →</button>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#888' }}>Sold</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Software Form ────────────────────────────────────────────────────────────
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

  const handleSubmit = async (e) => {
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
      <h3>List Your Software</h3>
      <p className="form-subtext">Share what you've built with the CoBrother community.</p>

      <form onSubmit={handleSubmit} className="venture-form" style={{ marginTop: '1.25rem' }}>
        <div className="form-group">
          <label>Software Name <span className="required">*</span></label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. InvoiceFlow" required />
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
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
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
            <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)}
              placeholder="e.g. 25000" required />
          </div>
          <div className="form-group">
            <label>Pricing Type <span className="required">*</span></label>
            <select value={form.pricingDemand} onChange={e => set('pricingDemand', e.target.value)} required>
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
            <span style={{ fontSize: '0.72rem', color: '#c8a96e', marginLeft: '0.5rem', fontWeight: 400 }}>
              🔒 Will not be shared until buyer confirms purchase
            </span>
          </label>
          <input value={form.githubLink} onChange={e => set('githubLink', e.target.value)}
            placeholder="https://github.com/you/repo" required />
        </div>

        <label className="checkbox-label">
          <input type="checkbox" checked={form.agreement.terms}
            onChange={e => setForm(f => ({ ...f, agreement: { terms: e.target.checked } }))} required />
          <span>I confirm I own this software and agree to the Terms & Conditions.</span>
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

// ─── Buy Software Modal ───────────────────────────────────────────────────────
function BuySoftwareModal({ item, user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    buyerFullName: `${user?.firstname || ''} ${user?.lastname || ''}`.trim(),
    buyerEmail:    user?.email || '',
    buyerPhone:    user?.phoneNumber || '',
  });
  const [step, setStep]       = useState('details'); // 'details' | 'paying'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handlePay = async () => {
    setLoading(true); setError('');
    try {
      const { data: orderData } = await cocreationAPI.createOrder(item.id, form);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'CoBrother',
        description: `Purchase ${item.name}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const { data: verifyData } = await cocreationAPI.verifyPayment(item.id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId:   response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess({ ...item, softwareStatus: 'SOLD', paymentStatus: 'COMPLETED',
                        completionStatus: 'PENDING', githubLink: verifyData.githubLink});
          } catch {
            setError('Payment verification failed. Contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: async () => {
            await cocreationAPI.handleFailure(item.id);
            setLoading(false);
          }
        },
        prefill: { name: form.buyerFullName, email: form.buyerEmail, contact: form.buyerPhone },
        theme: { color: '#c8a96e' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async () => {
        await cocreationAPI.handleFailure(item.id);
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
      <div className="modal-card" style={{ maxWidth: 500 }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <div className="modal-badge">Software Purchase</div>
          <h2>{item.name}</h2>
          <p>{item.category?.replace(/_/g, ' ')} · {item.pricingDemand}</p>
        </div>

        <div style={{ margin: '1.25rem 0', padding: '1rem', background: 'rgba(110,200,150,0.08)',
                      border: '1px solid rgba(110,200,150,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>Purchase Price</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#6ec896', fontFamily: 'Cormorant Garamond, serif' }}>
            ₹{Number(item.price).toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem', display: 'block' }}>Full Name</label>
            <input value={form.buyerFullName}
              onChange={e => setForm(f => ({ ...f, buyerFullName: e.target.value }))}
              placeholder="Your full name" />
          </div>
          <div className="form-row" style={{ margin: 0 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem', display: 'block' }}>Email</label>
              <input type="email" value={form.buyerEmail}
                onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))}
                placeholder="your@email.com" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem', display: 'block' }}>Phone</label>
              <input value={form.buyerPhone}
                onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))}
                placeholder="10-digit number" maxLength={10} />
            </div>
          </div>
        </div>

        <div style={{ padding: '0.875rem 1rem', background: 'rgba(200,169,110,0.08)',
                      border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8,
                      marginBottom: '1.25rem', fontSize: '0.875rem', color: '#c8a96e' }}>
          🔒 GitHub link will be shared after you confirm everything works.
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={handlePay} disabled={loading} style={{ flex: 1 }}>
            {loading ? <span className="btn-spinner" /> : `Pay ₹${Number(item.price).toLocaleString('en-IN')} →`}
          </button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
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
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Purchase Successful!
        </h2>
        <p style={{ color: '#a0a0b0', marginBottom: '1.5rem' }}>
          You've purchased <strong style={{ color: '#e0e0f0' }}>{item.name}</strong>
        </p>

        {item.githubLink && (
          <div style={{ padding: '1rem', background: 'rgba(110,200,150,0.08)',
                        border: '1px solid rgba(110,200,150,0.2)', borderRadius: 10,
                        marginBottom: '1.25rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>🔓 GitHub Repository</div>
            <a href={item.githubLink} target="_blank" rel="noreferrer"
               style={{ color: '#6ec896', fontWeight: 600, wordBreak: 'break-all', fontSize: '0.875rem' }}>
              {item.githubLink}
            </a>
          </div>
        )}
        
        <div style={{ padding: '1rem', background: 'rgba(200,169,110,0.08)',
                      border: '1px solid rgba(200,169,110,0.2)', borderRadius: 10,
                      marginBottom: '1.5rem', fontSize: '0.875rem', color: '#c8a96e', textAlign: 'left' }}>
          <p style={{ margin: '0 0 0.5rem' }}>✉️ A confirmation email has been sent to you.</p>
          <p style={{ margin: 0 }}>🔒 Once you verify everything works, mark it as complete from your dashboard to receive the GitHub link.</p>
        </div>
        <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}