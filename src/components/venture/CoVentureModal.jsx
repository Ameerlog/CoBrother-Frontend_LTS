import { useState, useEffect } from 'react';
import { coVentureAPI } from '../../api/services';

const STATUS_LABEL = {
  PENDING:  { text: 'Application Pending',  color: '#c8a96e', bg: 'rgba(200,169,110,0.1)',  border: 'rgba(200,169,110,0.3)',  icon: '⏳' },
  APPROVED: { text: 'Application Approved', color: '#6ec896', bg: 'rgba(110,200,150,0.1)',  border: 'rgba(110,200,150,0.3)',  icon: '✓'  },
  REJECTED: { text: 'Application Rejected', color: '#c86e6e', bg: 'rgba(200,110,110,0.1)',  border: 'rgba(200,110,110,0.3)',  icon: '✕'  },
};

export default function CoVentureModal({ venture, onClose }) {
  const [form, setForm]       = useState({ fullName: '', phone: '', location: '', gstNo: '' });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // checking prior application on mount
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  // null = not applied, 'PENDING'|'APPROVED'|'REJECTED' = already applied
  const [existingStatus, setExistingStatus] = useState(null);

  // ── Check if user already applied when modal opens ─────────────────────
  useEffect(() => {
    if (!venture?.id) return;
    setChecking(true);
    coVentureAPI.checkApplied(venture.id)
      .then(({ data }) => {
        const payload = data?.data ?? data;
        if (payload?.applied) {
          setExistingStatus(payload.status || 'PENDING');
        }
      })
      .catch(() => {
        // If endpoint doesn't exist yet or errors, allow form to show
        // The backend will still reject duplicates
      })
      .finally(() => setChecking(false));
  }, [venture?.id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await coVentureAPI.apply(venture.id, form);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || '';
      // Catch backend duplicate rejection gracefully
      if (err.response?.status === 409 || msg.toLowerCase().includes('already')) {
        setExistingStatus('PENDING');
      } else {
        setError(msg || 'Application failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const b = venture?.brandDetails || {};
  const typeLabel = b.ventureType
    ?.replace('FIFTY_FIFTY','50:50').replace('SIXTY_FORTY','60:40')
    .replace('SEVENTY_THIRTY','70:30').replace('EIGHTY_TWENTY','80:20')
    .replace('NINETY_TEN','90:10').replace('NEGOTIABLE','Negotiable') || '';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* ── Checking state ─────────────────────────────────────────────── */}
        {checking && (
          <div className="modal-checking">
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <p>Checking your application status…</p>
          </div>
        )}

        {/* ── Already applied ────────────────────────────────────────────── */}
        {!checking && existingStatus && (
          <AlreadyApplied
            venture={venture}
            status={existingStatus}
            typeLabel={typeLabel}
            onClose={onClose}
          />
        )}

        {/* ── Success after submitting ───────────────────────────────────── */}
        {!checking && !existingStatus && success && (
          <div className="modal-success">
            <div className="success-icon">✓</div>
            <h3>Application Submitted!</h3>
            <p>
              Your co-venture application for{' '}
              <strong>{b.brandName}</strong> is under review.
              We'll notify you once a decision is made.
            </p>
            <button className="btn-primary" onClick={onClose}>Done</button>
          </div>
        )}

        {/* ── Application form ───────────────────────────────────────────── */}
        {!checking && !existingStatus && !success && (
          <>
            <div className="modal-header">
              <div className="modal-badge">Co-Venture Application</div>
              <h2>Apply to {b.brandName}</h2>
              <p>{typeLabel}{typeLabel && b.industry ? ' · ' : ''}{b.industry?.replace(/_/g, ' ')}</p>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your legal name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone <span className="required">*</span></label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    title="Enter a valid 10-digit phone number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>GST Number <span className="optional">(optional)</span></label>
                <input
                  name="gstNo"
                  value={form.gstNo}
                  onChange={handleChange}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="btn-primary full-width" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Submit Application →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Already Applied sub-component ─────────────────────────────────────────
function AlreadyApplied({ venture, status, typeLabel, onClose }) {
  const s = STATUS_LABEL[status] || STATUS_LABEL.PENDING;
  const b = venture?.brandDetails || {};

  return (
    <div className="already-applied">
      <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
        <div className="modal-badge">Co-Venture Application</div>
        <h2>{b.brandName}</h2>
        <p>{typeLabel}{typeLabel && b.industry ? ' · ' : ''}{b.industry?.replace(/_/g, ' ')}</p>
      </div>

      <div
        className="applied-status-box"
        style={{ '--status-color': s.color, '--status-bg': s.bg, '--status-border': s.border }}
      >
        <div className="applied-status-icon">{s.icon}</div>
        <div>
          <div className="applied-status-title">{s.text}</div>
          <div className="applied-status-sub">
            {status === 'PENDING'  && 'The venture owner is reviewing your application.'}
            {status === 'APPROVED' && 'Congratulations! Your application has been accepted.'}
            {status === 'REJECTED' && 'Your application was not accepted for this venture.'}
          </div>
        </div>
      </div>

      <p className="applied-notice">
        You have already applied to this venture. Each venture allows only one application per user.
      </p>

      <button className="btn-primary full-width" onClick={onClose} style={{ marginTop: '0.5rem' }}>
        Close
      </button>
    </div>
  );
}
