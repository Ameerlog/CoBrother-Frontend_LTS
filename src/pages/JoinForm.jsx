import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinUsAPI } from '../api/services';
import {
  Network, Sparkles, Package, Store, ShieldCheck,
  Smartphone, MessageCircle, Laptop, MapPin, Workflow,
  Bell, MonitorCheck, Rocket, BadgeIndianRupee,
  ChevronDown, Timer, BadgePercent, Check, AlertCircle, ArrowLeft
} from 'lucide-react';

const JoinForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    cityPincode: '',
    topSkill: 'CRM',
    hasEquipment: false
  });
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.whatsapp || formData.whatsapp.length < 10) {
      newErrors.whatsapp = 'Enter a valid WhatsApp number';
    }
    if (!formData.cityPincode || formData.cityPincode.length < 2) {
      newErrors.cityPincode = 'City / Pincode is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitState({ status: 'loading', message: '' });
      
      const requestData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.whatsapp,
        skills: formData.topSkill,
        city: formData.cityPincode,
        message: `Equipment available: ${formData.hasEquipment ? 'Yes (Laptop/Tablet)' : 'No'}`
      };
      
      const response = await joinUsAPI.submit(requestData);
      
      if (response.data && response.data.status === 'success') {
        setSubmitState({
          status: 'success',
          message: 'Thank you! Our team will contact you soon.'
        });
        setFormData({
          fullName: '',
          email: '',
          whatsapp: '',
          cityPincode: '',
          topSkill: 'CRM',
          hasEquipment: false
        });
      } else {
        setSubmitState({
          status: 'error',
          message: 'Failed to submit application. Please try again.'
        });
      }
    } catch (error) {
      console.error('Join Us error:', error);
      setSubmitState({
        status: 'error',
        message: 'Something went wrong. Please try again later.'
      });
    }
  };

  const faqs = [
    {
      q: "Do I need years of experience?",
      a: "No. Skill + execution mindset matters. Choose a top skill and start."
    },
    {
      q: "When do I get paid?",
      a: "Commission clears when the integration goes live — post setup and dashboard handover."
    },
    {
      q: "How will I receive leads?",
      a: "Based on your city/pincode and selected skill. You'll get a WhatsApp notification."
    },
    {
      q: "Is there a joining fee?",
      a: "No joining fee. No hidden charges. You only earn — we take nothing upfront."
    }
  ];

  return (
    <div className="join-form-page">
      {/* Header */}
      <header className="join-form-header">
        <div className="join-form-header-container">
          <button onClick={() => navigate('/')} className="join-form-back-btn">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>
          <div className="join-form-logo">
            <Network size={20} className="join-form-logo-icon" />
            <span>CoBrother Elite</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="join-form-hero">
        <div className="join-form-hero-container">
          <div className="join-form-badge">
            <span className="join-form-badge-dot"></span>
            Now open · Up to 60% commission
          </div>
          <h1 className="join-form-hero-title">
            Join the <span className="join-form-gradient-text">CoBrother Elite</span>
          </h1>
          <p className="join-form-hero-desc">
            Small businesses in India are buying <strong>AI and SaaS</strong>, but can't install it. 
            We provide the software — <strong>you provide the deployment</strong> and earn up to 60%.
          </p>

          {/* Stats */}
          <div className="join-form-stats">
            <div className="join-form-stat-card">
              <p className="join-form-stat-value">60%</p>
              <p className="join-form-stat-label">Commission</p>
            </div>
            <div className="join-form-stat-card">
              <p className="join-form-stat-value">48h</p>
              <p className="join-form-stat-label">Onboarding</p>
            </div>
            <div className="join-form-stat-card">
              <p className="join-form-stat-value">₹0</p>
              <p className="join-form-stat-label">Joining fee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="join-form-main">
        <div className="join-form-main-container">
          <div className="join-form-grid">
            {/* Left Column - Info */}
            <div className="join-form-info">
              {/* Workflow */}
              <div className="join-form-workflow">
                <h3 className="join-form-section-title">
                  <Workflow size={20} />
                  The CoBrother Workflow
                </h3>
                <div className="join-form-workflow-steps">
                  {[
                    { icon: Bell, title: 'Claim a Lead', desc: 'Get notified of a business in your area ready for AI.', color: '#9440dd' },
                    { icon: MapPin, title: 'On-Site Setup', desc: 'Visit the shop. Install Aultum CRM and AI Social Bots.', color: '#6366f1' },
                    { icon: MonitorCheck, title: 'Dashboard Handover', desc: 'Walk the owner through their new live dashboard.', color: '#0ea5e9' },
                    { icon: BadgeIndianRupee, title: 'Instant Commission', desc: 'Your 60% commission clears the moment integration goes live.', color: '#10b981' }
                  ].map((step, idx) => (
                    <div key={idx} className="join-form-workflow-step">
                      <div className="join-form-workflow-icon" style={{ backgroundColor: `${step.color}15`, borderColor: `${step.color}30` }}>
                        <step.icon size={18} style={{ color: step.color }} />
                      </div>
                      <div className="join-form-workflow-content">
                        <h4 style={{ color: step.color }}>{step.title}</h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Cards */}
              <div className="join-form-details">
                <h3 className="join-form-section-title">
                  <Sparkles size={20} />
                  Everything you should know
                </h3>
                <div className="join-form-details-grid">
                  <DetailCard
                    icon={Package}
                    title="What you install"
                    items={['Aultum CRM setup', 'AI Social Bots integration', 'Dashboard live + handover']}
                  />
                  <DetailCard
                    icon={Store}
                    title="Who you help"
                    items={['Shops & local businesses', 'Owners buying AI tools', 'Teams needing setup support']}
                  />
                  <DetailCard
                    icon={Sparkles}
                    title="What you get"
                    items={['Lead notifications by area', 'Clear setup workflow', 'Commission on go-live']}
                  />
                  <DetailCard
                    icon={ShieldCheck}
                    title="Requirements"
                    items={['Phone + WhatsApp active', 'Basic communication skills', 'Laptop/Tablet recommended']}
                  />
                </div>
              </div>

              {/* FAQ */}
              <div className="join-form-faq">
                <h3 className="join-form-section-title">
                  <MessageCircle size={20} />
                  Frequently Asked Questions
                </h3>
                <div className="join-form-faq-list">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="join-form-sidebar">
              <div className="join-form-card">
                <div className="join-form-card-header">
                  <h3>Claim your territory</h3>
                  <p>Fill once — we route leads to you by area & skill.</p>
                </div>

                <form onSubmit={handleSubmit} className="join-form-form">
                  <div className="join-form-field">
                    <label>Full Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={errors.fullName ? 'error' : ''}
                    />
                    {errors.fullName && <span className="join-form-error">{errors.fullName}</span>}
                  </div>

                  <div className="join-form-field">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="join-form-error">{errors.email}</span>}
                  </div>

                  <div className="join-form-field">
                    <label>WhatsApp <span className="required">*</span></label>
                    <div className="join-form-phone-input">
                      <span className="join-form-phone-prefix">+91</span>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="WhatsApp number"
                        className={errors.whatsapp ? 'error' : ''}
                      />
                    </div>
                    {errors.whatsapp && <span className="join-form-error">{errors.whatsapp}</span>}
                  </div>

                  <div className="join-form-field">
                    <label>City / Pincode <span className="required">*</span></label>
                    <input
                      type="text"
                      name="cityPincode"
                      value={formData.cityPincode}
                      onChange={handleChange}
                      placeholder="Hubballi / 580032"
                      className={errors.cityPincode ? 'error' : ''}
                    />
                    {errors.cityPincode && <span className="join-form-error">{errors.cityPincode}</span>}
                  </div>

                  <div className="join-form-field">
                    <label>Top Skill <span className="required">*</span></label>
                    <select name="topSkill" value={formData.topSkill} onChange={handleChange}>
                      <option value="CRM">CRM Setup</option>
                      <option value="AI Bots">AI Social Bots</option>
                      <option value="SaaS Setup">SaaS Setup</option>
                    </select>
                  </div>

                  <div className="join-form-equipment">
                    <div className="join-form-equipment-info">
                      <Laptop size={18} />
                      <div>
                        <p className="join-form-equipment-title">Equipment</p>
                        <p className="join-form-equipment-desc">Laptop / Tablet available</p>
                      </div>
                    </div>
                    <label className="join-form-toggle">
                      <input
                        type="checkbox"
                        name="hasEquipment"
                        checked={formData.hasEquipment}
                        onChange={handleChange}
                      />
                      <span className="join-form-toggle-slider"></span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="join-form-submit"
                    disabled={submitState.status === 'loading'}
                  >
                    {submitState.status === 'loading' ? 'Submitting...' : 'START EARNING 60% →'}
                  </button>

                  {submitState.status === 'success' && (
                    <div className="join-form-message success">
                      <Check size={16} />
                      <div>
                        <p className="join-form-message-title">Territory Claimed!</p>
                        <p className="join-form-message-text">{submitState.message}</p>
                      </div>
                    </div>
                  )}

                  {submitState.status === 'error' && (
                    <div className="join-form-message error">
                      <AlertCircle size={16} />
                      <div>
                        <p className="join-form-message-title">Error</p>
                        <p className="join-form-message-text">{submitState.message}</p>
                      </div>
                    </div>
                  )}

                  <p className="join-form-disclaimer">
                    No spam · No joining fee · Get matched within 48h
                  </p>
                </form>
              </div>

              {/* Trust Badges */}
              <div className="join-form-trust-badges">
                <TrustBadge icon={Timer} text="Zero wait time" />
                <TrustBadge icon={BadgePercent} text="Up to 60% cut" />
                <TrustBadge icon={ShieldCheck} text="No joining fee" />
                <TrustBadge icon={Rocket} text="Instant commission" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const DetailCard = ({ icon: Icon, title, items }) => (
  <div className="join-form-detail-card">
    <div className="join-form-detail-header">
      <div className="join-form-detail-icon">
        <Icon size={18} />
      </div>
      <h4>{title}</h4>
    </div>
    <ul className="join-form-detail-list">
      {items.map((item, i) => (
        <li key={i}>
          <span className="join-form-dot"></span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="join-form-accordion-item">
      <button type="button" onClick={() => setOpen(!open)} className="join-form-accordion-btn">
        <span>{q}</span>
        <ChevronDown size={16} className={`join-form-accordion-icon ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="join-form-accordion-body">
          <p>{a}</p>
        </div>
      )}
    </div>
  );
};

const TrustBadge = ({ icon: Icon, text }) => (
  <div className="join-form-trust-badge">
    <div className="join-form-trust-icon">
      <Icon size={14} />
    </div>
    <p>{text}</p>
  </div>
);

export default JoinForm;
