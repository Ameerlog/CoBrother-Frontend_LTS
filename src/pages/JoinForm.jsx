import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinUsAPI } from '../api/services';
import Confetti from '../components/common/Confetti';
import {
  Network, Sparkles, Package, Store, ShieldCheck,
  Smartphone, MessageCircle, Laptop, MapPin, Workflow,
  Bell, MonitorCheck, Rocket, BadgeIndianRupee,
  ChevronDown, Timer, BadgePercent, Check, AlertCircle, ArrowLeft
} from 'lucide-react';

const SKILL_ENUM_MAP = {
  CRM: 'CRM_SETUP',
  'AI Bots': 'AI_SOCIAL_BOTS',
  'SaaS Setup': 'SAAS_SETUP',
};

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
  const [showConfetti, setShowConfetti] = useState(false);

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
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.whatsapp,
        pinCode: formData.cityPincode,
        skill: SKILL_ENUM_MAP[formData.topSkill],
        equipment: formData.hasEquipment,
      };
      
      await joinUsAPI.submit(requestData);

      setSubmitState({
        status: 'success',
        message: 'Thank you! Our team will contact you soon.'
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setFormData({
        fullName: '',
        email: '',
        whatsapp: '',
        cityPincode: '',
        topSkill: 'CRM',
        hasEquipment: false
      });
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <Confetti show={showConfetti} />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50">
            <ArrowLeft size={18} />
            <span className="font-semibold">Back to Home</span>
          </button>
          <div className="flex items-center gap-2 text-purple-600 font-bold text-lg">
            <Network size={20} />
            <span>CoBrother Elite</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-full text-sm font-semibold text-green-700 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Now open · Up to 60% commission
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Join the <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">CoBrother Elite</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Small businesses in India are buying <strong className="text-gray-900">AI and SaaS</strong>, but can't install it. 
            We provide the software — <strong className="text-gray-900">you provide the deployment</strong> and earn up to 60%.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
              <p className="text-4xl font-bold font-display text-purple-600 mb-2">60%</p>
              <p className="text-sm text-gray-600 font-semibold">Commission</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
              <p className="text-4xl font-bold font-display text-indigo-600 mb-2">48h</p>
              <p className="text-sm text-gray-600 font-semibold">Onboarding</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
              <p className="text-4xl font-bold font-display text-green-600 mb-2">₹0</p>
              <p className="text-sm text-gray-600 font-semibold">Joining fee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Workflow */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <Workflow size={20} className="text-purple-600" />
                  The CoBrother Workflow
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Bell, title: 'Claim a Lead', desc: 'Get notified of a business in your area ready for AI.', color: '#9440dd' },
                    { icon: MapPin, title: 'On-Site Setup', desc: 'Visit the shop. Install Aultum CRM and AI Social Bots.', color: '#6366f1' },
                    { icon: MonitorCheck, title: 'Dashboard Handover', desc: 'Walk the owner through their new live dashboard.', color: '#0ea5e9' },
                    { icon: BadgeIndianRupee, title: 'Instant Commission', desc: 'Your 60% commission clears the moment integration goes live.', color: '#10b981' }
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${step.color}15`, borderWidth: '2px', borderStyle: 'solid', borderColor: `${step.color}30` }}>
                        <step.icon size={18} style={{ color: step.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1" style={{ color: step.color }}>{step.title}</h4>
                        <p className="text-gray-600 text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Cards */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <Sparkles size={20} className="text-purple-600" />
                  Everything you should know
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <MessageCircle size={20} className="text-purple-600" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-1 sticky top-24 self-start">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Claim your territory</h3>
                  <p className="text-gray-600 text-sm">Fill once — we route leads to you by area & skill.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`w-full px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                    />
                    {errors.fullName && <span className="text-xs text-red-500 mt-1 block">{errors.fullName}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={`w-full px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                    />
                    {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">+91</span>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="WhatsApp number"
                        className={`flex-1 px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.whatsapp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                      />
                    </div>
                    {errors.whatsapp && <span className="text-xs text-red-500 mt-1 block">{errors.whatsapp}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City / Pincode <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="cityPincode"
                      value={formData.cityPincode}
                      onChange={handleChange}
                      placeholder="Hubballi / 580032"
                      className={`w-full px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.cityPincode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                    />
                    {errors.cityPincode && <span className="text-xs text-red-500 mt-1 block">{errors.cityPincode}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Top Skill <span className="text-red-500">*</span></label>
                    <select name="topSkill" value={formData.topSkill} onChange={handleChange} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                      <option value="CRM">CRM Setup</option>
                      <option value="AI Bots">AI Social Bots</option>
                      <option value="SaaS Setup">SaaS Setup</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Laptop size={18} className="text-gray-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Equipment</p>
                        <p className="text-xs text-gray-600">Laptop / Tablet available</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasEquipment"
                        checked={formData.hasEquipment}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitState.status === 'loading'}
                  >
                    {submitState.status === 'loading' ? 'Submitting...' : 'START EARNING 60% →'}
                  </button>

                  {submitState.status === 'success' && (
                    <div className="flex items-start gap-3 p-4 bg-green-100 border border-green-300 rounded-lg">
                      <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-green-900">Territory Claimed!</p>
                        <p className="text-xs text-green-700 mt-1">{submitState.message}</p>
                      </div>
                    </div>
                  )}

                  {submitState.status === 'error' && (
                    <div className="flex items-start gap-3 p-4 bg-red-100 border border-red-300 rounded-lg">
                      <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-900">Error</p>
                        <p className="text-xs text-red-700 mt-1">{submitState.message}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-center text-gray-500">
                    No spam · No joining fee · Get matched within 48h
                  </p>
                </form>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mt-6">
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
  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
        <Icon size={18} className="text-purple-600" />
      </div>
      <h4 className="font-bold text-gray-900">{title}</h4>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900">{q}</span>
        <ChevronDown size={16} className={`text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-gray-600">{a}</p>
        </div>
      )}
    </div>
  );
};

const TrustBadge = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
    <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
      <Icon size={14} className="text-white" />
    </div>
    <p className="text-xs font-semibold text-gray-900">{text}</p>
  </div>
);

export default JoinForm;
