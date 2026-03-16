import { useState } from 'react';
import { domainEnquiryAPI } from '../api/services';

export default function DomainEnquiryModal({ domain, user, onClose, onSuccess }) {
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
      await domainEnquiryAPI.submit(domain.id, form);
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
              placeholder="Tell us why you're interested in this domain and any specific requirements…"
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