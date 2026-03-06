import { useState } from 'react';

const INDUSTRIES = ['SAAS', 'ECOMMERCE', 'SERVICES', 'AI_AUTOMATION', 'FINTECH', 'OTHER'];
const VENTURE_TYPES = [
  { value: 'FIFTY_FIFTY', label: '50:50 — Equal Synergy' },
  { value: 'SIXTY_FORTY', label: '60:40 — Majority Founder' },
  { value: 'SEVENTY_THIRTY', label: '70:30 — Strategic Growth' },
  { value: 'EIGHTY_TWENTY', label: '80:20 — Advisor / Investor Stake' },
  { value: 'NINETY_TEN', label: '90:10 — Minor Equity Placement' },
  { value: 'NEGOTIABLE', label: 'Negotiable — Custom Structure' },
];

const EMPTY = {
  brandDetails: {
    brandName: '', description: '', website: '', videoUrl: '',
    industry: '', dealValue: '', logoUrl: '', ventureType: '',
  },
  contactInfo: { email: '', phoneNumber: '' },
  agreement: { terms: true },
  status: true,
};

export default function VentureForm({ initialData, onSubmit, loading, error, submitLabel = 'Submit' }) {
  const [form, setForm] = useState(() => initialData || EMPTY);

  const setBrand = (key, value) =>
    setForm((f) => ({ ...f, brandDetails: { ...f.brandDetails, [key]: value } }));

  const setContact = (key, value) =>
    setForm((f) => ({ ...f, contactInfo: { ...f.contactInfo, [key]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="venture-form">
      <section className="form-section">
        <h3>Brand Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Brand Name <span className="required">*</span></label>
            <input value={form.brandDetails.brandName} onChange={(e) => setBrand('brandName', e.target.value)} placeholder="e.g. LaunchPad" required />
          </div>
          <div className="form-group">
            <label>Industry <span className="required">*</span></label>
            <select value={form.brandDetails.industry} onChange={(e) => setBrand('industry', e.target.value)} required>
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description <span className="required">*</span></label>
          <textarea
            value={form.brandDetails.description}
            onChange={(e) => setBrand('description', e.target.value)}
            placeholder="Describe your venture..."
            rows={4}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Website</label>
            <input value={form.brandDetails.website} onChange={(e) => setBrand('website', e.target.value)} placeholder="https://..." type="url" />
          </div>
          <div className="form-group">
            <label>Deal Value (₹)</label>
            <input value={form.brandDetails.dealValue} onChange={(e) => setBrand('dealValue', e.target.value)} placeholder="e.g. 500000" type="number" min="0" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Venture Type <span className="required">*</span></label>
            <select value={form.brandDetails.ventureType} onChange={(e) => setBrand('ventureType', e.target.value)} required>
              <option value="">Select type</option>
              {VENTURE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Logo URL</label>
            <input value={form.brandDetails.logoUrl} onChange={(e) => setBrand('logoUrl', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div className="form-group">
          <label>Video URL</label>
          <input value={form.brandDetails.videoUrl} onChange={(e) => setBrand('videoUrl', e.target.value)} placeholder="YouTube / Loom link" />
        </div>
      </section>

      <section className="form-section">
        <h3>Contact Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Contact Email <span className="required">*</span></label>
            <input type="email" value={form.contactInfo.email} onChange={(e) => setContact('email', e.target.value)} placeholder="contact@venture.com" required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={form.contactInfo.phoneNumber} onChange={(e) => setContact('phoneNumber', e.target.value)} placeholder="10-digit number" maxLength={10} />
          </div>
        </div>
      </section>

      <section className="form-section">
        <h3>Agreement</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.agreement.terms}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                agreement: { ...f.agreement, terms: e.target.checked }
              }))
            }
            required
          />
          <span>I agree to the Terms & Conditions and confirm the information provided is accurate.</span>
        </label>
      </section>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <span className="btn-spinner" /> : submitLabel}
      </button>
    </form>
  );
}
