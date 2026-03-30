import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network, Sparkles, Package, Store, Map, ShieldCheck,
  Smartphone, MessageCircle, Laptop, MapPin, Workflow,
  Bell, Settings, MonitorCheck, Rocket, BadgeIndianRupee,
  ChevronRight, HelpCircle, ChevronDown, Timer, BadgePercent,
  Quote, Check, AlertCircle, ArrowLeft
} from 'lucide-react';
import coBrotherLogo from '../assets/Cobrother_logo.png';

/* ─── Accordion Item ──────────────────────── */
const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="btc-accordion-item">
      <button type="button" className="btc-accordion-btn" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <ChevronDown size={16} className={`btc-accordion-chevron ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="btc-accordion-body">
          <p>{a}</p>
        </div>
      )}
    </div>
  );
};

/* ─── Detail Card ─────────────────────────── */
const DetailCard = ({ icon: Icon, title, items }) => (
  <div className="btc-detail-card">
    <div className="btc-detail-card-header">
      <div className="btc-detail-icon">
        <Icon size={18} />
      </div>
      <h4>{title}</h4>
    </div>
    <ul className="btc-detail-list">
      {items.map((item, i) => (
        <li key={i}>
          <span className="btc-dot" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

/* ─── Trust Badge ─────────────────────────── */
const TrustBadge = ({ icon: Icon, text }) => (
  <div className="btc-trust-badge">
    <div className="btc-trust-icon"><Icon size={14} /></div>
    <span>{text}</span>
  </div>
);

/* ─── Flow Step ───────────────────────────── */
const FlowStep = ({ icon: Icon, title, step, desc, isLast }) => (
  <div className="btc-flow-step">
    <div className="btc-flow-step-line">
      <div className="btc-flow-step-icon"><Icon size={17} /></div>
      {!isLast && <div className="btc-flow-step-connector" />}
    </div>
    <div className="btc-flow-step-content">
      <span className="btc-flow-step-num">Step {step}</span>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  </div>
);

/* ─── Page ────────────────────────────────── */
export default function BeTheCoBrother() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageVisible, setPageVisible] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    cityPincode: '',
    topSkill: 'CRM',
    hasEquipment: false,
  });
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setPageLoading(false);
      setTimeout(() => setPageVisible(true), 50);
    }, 1200);
    return () => clearTimeout(loaderTimer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.btc-custom-dropdown')) {
        setSkillDropdownOpen(false);
      }
    };
    if (skillDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [skillDropdownOpen]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email address';
    if (formData.whatsapp.trim().length < 10) errs.whatsapp = 'Enter a valid WhatsApp number';
    if (!formData.cityPincode.trim()) errs.cityPincode = 'City / Pincode is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitState({ status: 'loading', message: '' });
    try {
      // TODO: Replace with your email endpoint
      // Send form data to backend/email service
      const emailData = {
        fullName: formData.fullName,
        email: formData.email,
        whatsapp: formData.whatsapp,
        cityPincode: formData.cityPincode,
        topSkill: formData.topSkill,
        hasEquipment: formData.hasEquipment,
        timestamp: new Date().toISOString(),
      };
      
      // TODO: Uncomment and configure when backend is ready
      // const response = await fetch('YOUR_EMAIL_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(emailData),
      // });
      // if (!response.ok) throw new Error('Failed to send');
      
      console.log('Form data to be sent:', emailData);
      
      await new Promise(r => setTimeout(r, 900));
      setSubmitState({ status: 'success', message: 'Territory claimed. We\'ll notify you when leads are ready in your area.' });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      setFormData({ fullName: '', email: '', whatsapp: '', cityPincode: '', topSkill: 'CRM', hasEquipment: false });
    } catch {
      setSubmitState({ status: 'error', message: 'Submit failed. Please try again.' });
    }
  };

  const detailCards = [
    { icon: Package, title: 'What you install', items: ['Aultum CRM setup', 'AI Social Bots integration', 'Dashboard live + handover'] },
    { icon: Store, title: 'Who you help', items: ['Shops & local businesses', 'Owners buying AI tools', 'Teams needing setup support'] },
    { icon: Sparkles, title: 'What you get', items: ['Lead notifications by area', 'Clear setup workflow', 'Commission on go-live'] },
    { icon: Map, title: 'Territory logic', items: ['City / pincode based routing', 'Skill-based matching', 'Local-first opportunities'] },
  ];

  const requirements = [
    { icon: Smartphone, text: 'Phone + WhatsApp active' },
    { icon: MessageCircle, text: 'Basic communication skills' },
    { icon: Laptop, text: 'Laptop / Tablet recommended' },
    { icon: MapPin, text: 'Willing to do on-site setup' },
  ];

  const flowSteps = [
    { icon: Bell, title: 'Claim a Lead', desc: 'Get notified of a business in your area ready for AI.', step: '01' },
    { icon: MapPin, title: 'On-Site Setup', desc: 'Visit the shop. Install Aultum CRM and AI Social Bots.', step: '02' },
    { icon: MonitorCheck, title: 'Dashboard Handover', desc: 'Walk the owner through their new live dashboard.', step: '03' },
    { icon: BadgeIndianRupee, title: 'Instant Commission', desc: 'Your 60% commission clears the moment integration goes live.', step: '04' },
  ];

  const skillOptions = [
    { value: 'CRM', label: 'CRM Setup' },
    { value: 'AI Bots', label: 'AI Social Bots' },
    { value: 'SaaS Setup', label: 'SaaS Setup' },
  ];

  const faqs = [
    { q: 'Do I need years of experience?', a: 'No. Skill + execution mindset matters. Choose a top skill and start.' },
    { q: 'When do I get paid?', a: 'Commission clears when the integration goes live — post setup and dashboard handover.' },
    { q: 'How will I receive leads?', a: 'Based on your city/pincode and selected skill. You\'ll get a WhatsApp notification.' },
    { q: 'Is there a joining fee?', a: 'No joining fee. No hidden charges. You only earn — we take nothing upfront.' },
  ];

  if (pageLoading) {
    return (
      <div className="btc-loader-screen">
        <div className="btc-loader-content">
          <img src={coBrotherLogo} alt="CoBrother" className="btc-loader-logo" />
          <div className="btc-loader-spinner" />
          <p className="btc-loader-text">Loading CoBrother Elite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`btc-page ${pageVisible ? 'btc-page-visible' : 'btc-page-hidden'}`}>
      {/* Confetti Celebration */}
      {showConfetti && (
        <div className="btc-confetti-container">
          {[...Array(100)].map((_, i) => {
            const colors = ['#9440dd', '#7c3aed', '#00C3FF', '#fbbf24', '#ec4899', '#f97316', '#10b981'];
            const shapes = ['square', 'circle', 'rectangle'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const startX = Math.random() * 100; // Spread across full width
            const endX = startX + (Math.random() - 0.5) * 30; // Gentle drift
            
            return (
              <div
                key={i}
                className={`btc-confetti btc-confetti-${shape}`}
                style={{
                  left: `${startX}%`,
                  '--end-x': `${endX}%`,
                  '--rotation': `${Math.random() * 720 - 360}deg`,
                  animationDelay: `${Math.random() * 0.8}s`,
                  animationDuration: `${3.5 + Math.random() * 2.5}s`,
                  backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                  width: shape === 'rectangle' ? `${8 + Math.random() * 6}px` : `${6 + Math.random() * 8}px`,
                  height: shape === 'rectangle' ? `${4 + Math.random() * 4}px` : `${6 + Math.random() * 8}px`,
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Navbar */}
      <nav className="btc-navbar">
        <div className="btc-navbar-container">
          <div className="btc-navbar-left">
            <img src={coBrotherLogo} alt="CoBrother" className="btc-logo" />
          </div>
          <button className="btc-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Home
          </button>
        </div>
      </nav>

      <main className="btc-main">
        {/* Hero + Form Grid */}
        <div className="btc-hero-grid">
          {/* LEFT — Hero */}
          <div className="btc-hero-left">
            <div className="btc-badge-pill">
              <span className="btc-pulse" />
              Now open · Up to 60% commission
            </div>

            <h1 className="btc-hero-title">
              Join the <span className="btc-purple-text">CoBrother Elite</span>
            </h1>

            <p className="btc-hero-desc">
              Small businesses in India are buying <strong>AI and SaaS</strong>, but can't install it. We provide the software — <strong>you provide the deployment</strong> and earn up to 60%.
            </p>

            {/* Stats */}
            <div className="btc-stats-row">
              {[
                { val: '60%', label: 'COMMISSION' },
                { val: '48h', label: 'ONBOARDING' },
                { val: '₹0', label: 'JOINING FEE' },
              ].map(({ val, label }) => (
                <div key={label} className="btc-stat-card">
                  <span className="btc-stat-val">{val}</span>
                  <span className="btc-stat-label">{label}</span>
                </div>
              ))}
            </div>

            <div className="btc-cta-wrap">
              <p className="btc-tagline">
                CoBrother Elite<br />Setup · Deploy · Get paid
              </p>
            </div>

            {/* Workflow Timeline */}
            <div className="btc-workflow-card">
              <h3 className="btc-workflow-title">
                The <span className="btc-highlight">CoBrother</span> Workflow
              </h3>
              {flowSteps.map((s, i) => (
                <FlowStep key={s.title} {...s} isLast={i === flowSteps.length - 1} />
              ))}
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="btc-form-col" ref={formRef}>
            <div className="btc-form-card">
              <div className="btc-form-gradient-bar" />
              <div className="btc-form-header">
                <h3>Claim your territory</h3>
                <p>Fill once — we route leads to you by area & skill. <span className="btc-required">*</span> required.</p>
              </div>

              <form className="btc-form" onSubmit={handleSubmit}>
                <div className="btc-field">
                  <label>Full Name <span className="btc-required">*</span></label>
                  {errors.fullName && <span className="btc-field-error">{errors.fullName}</span>}
                  <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your full name" />
                </div>

                <div className="btc-field">
                  <label>Email <span className="btc-required">*</span></label>
                  {errors.email && <span className="btc-field-error">{errors.email}</span>}
                  <input name="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" />
                </div>

                <div className="btc-field">
                  <label>WhatsApp <span className="btc-required">*</span></label>
                  {errors.whatsapp && <span className="btc-field-error">{errors.whatsapp}</span>}
                  <div className="btc-phone-row">
                    <span className="btc-phone-prefix">+91</span>
                    <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="WhatsApp number" />
                  </div>
                </div>

                <div className="btc-field">
                  <label>City / Pincode <span className="btc-required">*</span></label>
                  {errors.cityPincode && <span className="btc-field-error">{errors.cityPincode}</span>}
                  <input name="cityPincode" value={formData.cityPincode} onChange={handleChange} placeholder="Hubballi / 5800xx" />
                </div>

                <div className="btc-field">
                  <label>Top Skill <span className="btc-required">*</span></label>
                  {errors.topSkill && <span className="btc-field-error">{errors.topSkill}</span>}
                  <div className="btc-custom-dropdown">
                    <button
                      type="button"
                      className={`btc-dropdown-trigger ${skillDropdownOpen ? 'open' : ''}`}
                      onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
                    >
                      {skillOptions.find(opt => opt.value === formData.topSkill)?.label || 'Select a skill'}
                      <ChevronDown size={16} className={`btc-dropdown-arrow ${skillDropdownOpen ? 'open' : ''}`} />
                    </button>
                    {skillDropdownOpen && (
                      <div className="btc-dropdown-menu">
                        {skillOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            className={`btc-dropdown-option ${formData.topSkill === option.value ? 'selected' : ''}`}
                            onClick={() => {
                              handleChange({ target: { name: 'topSkill', value: option.value } });
                              setSkillDropdownOpen(false);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="btc-equipment-toggle">
                  <div className="btc-equipment-info">
                    <div className="btc-equipment-icon">
                      {formData.hasEquipment ? <Laptop size={16} /> : <Smartphone size={16} />}
                    </div>
                    <div>
                      <span className="btc-equipment-title">Equipment</span>
                      <span className="btc-equipment-sub">Laptop / Tablet available</span>
                    </div>
                  </div>
                  <label className="btc-switch">
                    <input type="checkbox" name="hasEquipment" checked={formData.hasEquipment} onChange={handleChange} />
                    <span className="btc-slider" />
                  </label>
                </div>

                <button
                  type="submit"
                  className="btc-submit-btn"
                  disabled={submitState.status === 'loading'}
                >
                  {submitState.status === 'loading' ? 'Submitting…' : 'START EARNING 60% →'}
                </button>

                {submitState.status === 'success' && (
                  <div className="btc-alert btc-alert-success">
                    <Check size={16} />
                    <div>
                      <strong>Territory Claimed!</strong>
                      <p>{submitState.message}</p>
                    </div>
                  </div>
                )}
                {submitState.status === 'error' && (
                  <div className="btc-alert btc-alert-error">
                    <AlertCircle size={16} />
                    <div>
                      <strong>Error</strong>
                      <p>{submitState.message}</p>
                    </div>
                  </div>
                )}

                <p className="btc-form-footer">No spam · No joining fee · Get matched within 48h</p>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="btc-trust-grid">
              <TrustBadge icon={Timer} text="Zero wait time" />
              <TrustBadge icon={BadgePercent} text="Upto 60% cut" />
              <TrustBadge icon={ShieldCheck} text="No joining fee" />
              <TrustBadge icon={MapPin} text="Local territory" />
            </div>

            {/* Quote */}
            <div className="btc-quote-card">
              <Quote size={16} className="btc-quote-icon" />
              <div>
                <p className="btc-quote-text">"Smart hustlers don't chase — they build engines."</p>
                <p className="btc-quote-sub">This form is your doorway into that engine.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <section className="btc-details-section">
          <div className="btc-section-label">
            <div className="btc-section-icon"><Sparkles size={18} /></div>
            <div>
              <span className="btc-section-kicker">Details</span>
              <h2>Everything you should know</h2>
              <p>Scannable details — anyone can understand the workflow in one visit.</p>
            </div>
          </div>

          <div className="btc-details-grid">
            {detailCards.map(c => <DetailCard key={c.title} {...c} />)}
          </div>

          {/* Requirements */}
          <div className="btc-requirements-card">
            <div className="btc-requirements-header">
              <div className="btc-req-icon"><ShieldCheck size={17} /></div>
              <h4>Requirements</h4>
            </div>
            <div className="btc-requirements-grid">
              {requirements.map(r => (
                <div key={r.text} className="btc-req-item">
                  <div className="btc-req-item-icon"><r.icon size={14} /></div>
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="btc-faq-section">
          <div className="btc-section-label">
            <div className="btc-section-icon btc-section-icon-alt"><HelpCircle size={18} /></div>
            <div>
              <span className="btc-section-kicker">FAQ</span>
              <h2>Quick answers</h2>
              <p>Tap a question to expand instantly.</p>
            </div>
          </div>
          <div className="btc-faq-list">
            {faqs.map(f => <AccordionItem key={f.q} {...f} />)}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="btc-footer">
        <p>© 2026 CoBrother™ Aultum International. All rights reserved.</p>
        <p>Made with ❤️ in India.</p>
      </footer>
    </div>
  );
}
