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

const STAGES = [
  { value: 'IDEA',               label: '💡 Idea — Concept stage, not yet built' },
  { value: 'MVP',                label: '🛠 MVP — Built, testing with early users' },
  { value: 'REVENUE_GENERATING', label: '💰 Revenue Generating — Paying customers' },
  { value: 'SCALING',            label: '🚀 Scaling — Growing fast, need fuel' },
];

const EMPTY = {
  brandDetails: {
    brandName: '', description: '', website: '', videoUrl: '',
    industry: '', dealValue: '', referenceImageUrl: '', ventureType: '',
  },
  contactInfo: { email: '', phoneNumber: '' },
  agreement: { terms: true },
  status: true,
  stage: '',
  lookingFor: '',
  currentProblem: '',
};


export default function VentureForm({ initialData, onSubmit, loading, error, submitLabel = 'Submit' }) {
  const [form, setForm] = useState(() => initialData || EMPTY);
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(form.brandDetails?.ventureImageUrl || null);
  const [imageUploading, setImageUploading] = useState(false);

  const setBrand = (key, value) =>
    setForm((f) => ({ ...f, brandDetails: { ...f.brandDetails, [key]: value } }));

  const setContact = (key, value) =>
    setForm((f) => ({ ...f, contactInfo: { ...f.contactInfo, [key]: value } }));

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0">
      <section className="p-7 bg-white border border-gray-200 rounded-[14px] shadow-sm mb-5 flex flex-col gap-4">
        <h3 className="font-display text-xl font-medium text-gray-900 mb-1">Brand Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Brand Name <span className="text-red-400">*</span></label>
            <input value={form.brandDetails.brandName} onChange={(e) => setBrand('brandName', e.target.value)} placeholder="e.g. LaunchPad" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Industry <span className="text-red-400">*</span></label>
            <select value={form.brandDetails.industry} onChange={(e) => setBrand('industry', e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm outline-none transition-all duration-200 cursor-pointer focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]">
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Description <span className="text-red-400">*</span></label>
          <textarea
            value={form.brandDetails.description}
            onChange={(e) => setBrand('description', e.target.value)}
            placeholder="Describe your venture..."
            rows={4}
            required
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 resize-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Website</label>
            <input value={form.brandDetails.website} onChange={(e) => setBrand('website', e.target.value)} placeholder="https://..." type="url" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Deal Value (₹)</label>
            <input value={form.brandDetails.dealValue} onChange={(e) => setBrand('dealValue', e.target.value)} placeholder="e.g. 500000" type="number" min="0" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Venture Type <span className="text-red-400">*</span></label>
            <select value={form.brandDetails.ventureType} onChange={(e) => setBrand('ventureType', e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm outline-none transition-all duration-200 cursor-pointer focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]">
              <option value="">Select type</option>
              {VENTURE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Venture Reference Image</label>
            <div className="flex items-center gap-4 flex-wrap">
                {imagePreview && (
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-14 h-14 rounded-[10px] object-cover border border-gray-200"
                    />
                )}
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple rounded-full text-sm font-medium cursor-pointer transition-all duration-200 hover:text-white hover:border-transparent hover:bg-gradient-to-br hover:from-purple-700 hover:to-purple-500 hover:shadow-lg">
                    📷 {imagePreview ? 'Change Image' : 'Upload Image'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                </label>
                {imagePreview && (
                    <button type="button" className="px-3 py-1.5 bg-transparent border border-gray-400 text-gray-600 rounded-full text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                        Remove
                    </button>
                )}
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
                JPG, PNG or WebP. Max 5MB. Uploaded on save.
            </p>
        </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Video URL</label>
          <input value={form.brandDetails.videoUrl} onChange={(e) => setBrand('videoUrl', e.target.value)} placeholder="YouTube / Loom link" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" />
        </div>
      </section>

      <section className="p-7 bg-white border border-gray-200 rounded-[14px] shadow-sm mb-5 flex flex-col gap-4">
        <h3 className="font-display text-xl font-medium text-gray-900 mb-1">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Contact Email <span className="text-red-400">*</span></label>
            <input type="email" value={form.contactInfo.email} onChange={(e) => setContact('email', e.target.value)} placeholder="contact@venture.com" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input value={form.contactInfo.phoneNumber} onChange={(e) => setContact('phoneNumber', e.target.value)} placeholder="10-digit number" maxLength={10} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" />
          </div>
        </div>
      </section>

      

      <section className="p-7 bg-white border border-gray-200 rounded-[14px] shadow-sm mb-5 flex flex-col gap-4">
        <h3 className="font-display text-xl font-medium text-gray-900 mb-1">Venture Status</h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Current Stage <span className="text-red-400">*</span></label>
          <select value={form.stage} onChange={e => setField('stage', e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm outline-none transition-all duration-200 cursor-pointer focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]">
            <option value="">Select stage</option>
            {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Looking For <span className="text-red-400">*</span></label>
          <input
            value={form.lookingFor}
            onChange={e => setField('lookingFor', e.target.value)}
            placeholder="e.g. Marketing co-founder, Angel investor, Tech lead"
            required
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Current Challenge <span className="text-gray-400 text-xs">(optional)</span></label>
          <textarea
            value={form.currentProblem}
            onChange={e => setField('currentProblem', e.target.value)}
            placeholder="What's the biggest problem you're facing right now? e.g. Struggling with user acquisition, need help with GTM strategy..."
            rows={3}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 resize-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
          />
        </div>
      </section>

      <section className="p-7 bg-white border border-gray-200 rounded-[14px] shadow-sm mb-5 flex flex-col gap-4">
        <h3 className="font-display text-xl font-medium text-gray-900 mb-1">Agreement</h3>
        <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
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
            className="mt-0.5 w-4 h-4 cursor-pointer"
          />
          <span>I agree to the Terms & Conditions and confirm the information provided is accurate.</span>
        </label>
      </section>

      {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[10px] text-red-400 text-sm mb-4">{error}</div>}

      <button type="submit" className="min-h-[46px] px-6 py-3 rounded-full text-sm font-semibold bg-blue-600 border border-blue-600 text-white cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" disabled={loading}>
        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : submitLabel}
      </button>
    </form>
  );
}
