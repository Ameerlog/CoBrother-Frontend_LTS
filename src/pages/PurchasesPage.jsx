import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { domainAPI, cocreationAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';
import PurchaseIcon from '../assets/purchase.png';
import DomainsIcon from '../assets/CoBranding.png';
import SoftwareIcon from '../assets/CoCreation.png';
import CoBrotherIcon from '../assets/Community-profileicon.png';

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
      <div>
        <div className="mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 m-0">My Purchases</h1>
            <p className="text-gray-600 mt-1">All your domain and software purchases in one place.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Purchases"  value={totalItems}                  iconSrc={PurchaseIcon} />
          <StatCard label="Domains"          value={completedDomains.length}     iconSrc={DomainsIcon} color="#6eadc8" />
          <StatCard label="Software"         value={completedSoftware.length}    iconSrc={SoftwareIcon} color="#a06ec8" />
          <StatCard label="CoBrother Active"
            value={completedSoftware.filter(p => p.coBrotherHelpPaid).length}
            iconSrc={CoBrotherIcon} color="#6ec896" />
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: 'all',      label: `All (${totalItems})` },
            { id: 'domains',  label: `Domains (${completedDomains.length})` },
            { id: 'software', label: `Software (${completedSoftware.length})` },
          ].map(t => (
            <button key={t.id}
              className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${tab === t.id ? 'bg-purple text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-purple hover:bg-purple-50'}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" /></div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600 mb-6">Browse domains and software to make your first purchase.</p>
            <div className="flex gap-3 justify-center">
              <button className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-purple hover:bg-purple-50" onClick={() => navigate('/domains')}>Browse Domains</button>
              <button className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-purple hover:bg-purple-50" onClick={() => navigate('/cocreation')}>Browse Software</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
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
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setHelpSuccess(null)}>
          <div className="relative w-full max-w-[440px] bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] text-center animate-slideUp">
            <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-purple-100/30 blur-3xl pointer-events-none" />
            <div className="relative z-10 p-8">
              <div className="text-5xl mb-4">◆</div>
              <h2 className="font-display text-[1.75rem] font-semibold text-gray-900 mb-2">CoBrother Help Activated!</h2>
              <p className="text-gray-500 mb-5 leading-relaxed">
                A CoBrother will reach out within <strong className="text-purple-600">24 hours</strong>{' '}
                to help with <strong className="text-gray-900">{helpSuccess.software?.name}</strong>.
              </p>
              <div className="px-3.5 py-3 bg-green-500/8 border border-green-500/20 rounded-[10px] mb-6 text-xs text-green-400">
                ✓ ₹1,000 paid · CoBrother assigned · Expect contact via email
              </div>
              <button className="w-full px-6 py-2.5 bg-white border-2 border-purple-400 text-purple-600 rounded-full font-semibold text-sm transition-all duration-200 hover:bg-purple-50" onClick={() => setHelpSuccess(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function DomainPurchaseRow({ domain }) {
  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-700 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded">◇ Domain</span>
            {domain.verified && <span className="text-xs font-bold text-green-600">✓ Verified</span>}
          </div>
          <div className="font-bold text-lg text-gray-900">
            {domain.domainName}{domain.domainExtension}
          </div>
          <div className="text-xs text-gray-600">{domain.pricingDemand}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-bold text-green-600">
            ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-600">✓ Payment Confirmed</div>
        </div>
      </div>
      <div className="mt-3.5 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-900">
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
    <div className={`p-5 bg-white rounded-xl shadow-sm ${helpPaid ? 'border border-green-300' : 'border border-gray-200'}`}>
      <div className="flex justify-between flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded">⟁ Software</span>
            {confirmed && <span className="text-xs font-bold text-green-600">✓ Completed</span>}
            {helpPaid && <span className="text-xs font-bold text-green-600 bg-green-100 border border-green-200 px-2 py-0.5 rounded">◆ CoBrother Active</span>}
          </div>
          <div className="font-bold text-lg text-gray-900">
            {sw.name || '—'}
          </div>
          {sw.description && (
            <div className="text-xs text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap max-w-[400px]">
              {sw.description}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-display text-xl font-bold text-purple-700">
            ₹{Number(sw.price || 0).toLocaleString('en-IN')}
          </div>
          {helpPaid && <div className="text-xs text-gray-600">+ ₹1,000 CoBrother</div>}
          <div className="text-xs text-gray-600">✓ Payment Confirmed</div>
        </div>
      </div>

      {sw.githubLink && (
        <div className="mt-3.5 p-4 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-between">
          <span className="text-xs text-gray-600">🔗 GitHub Repository</span>
          <a href={sw.githubLink} target="_blank" rel="noreferrer" className="text-xs text-purple-600 font-bold hover:text-purple-700 transition-all duration-200">
            Open →
          </a>
        </div>
      )}

      <div className="mt-3.5">
        {helpPaid ? (
          <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
            <div className="font-bold text-sm text-green-600 mb-1">
              ◆ CoBrother Helper Assigned
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              Check your email for introduction details from your assigned CoBrother.
            </div>
          </div>
        ) : (
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-bold text-sm text-purple-700 mb-1">
                Need help getting started?
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                Get a dedicated CoBrother to guide you through setup and deployment.
              </div>
            </div>
            <button onClick={onGetHelp} className="px-5 py-2 bg-purple-100 border border-purple-200 text-purple-700 rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:bg-purple-200">
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
        theme: { color: '#7c3aed' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { setError('Payment failed.'); setLoading(false); });
      rzp.open();
    } catch (err) { setError(err.response?.data?.error || 'Failed.'); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[500px] bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] text-center animate-slideUp">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-purple-100/30 blur-3xl pointer-events-none" />
        <div className="relative z-10 p-8">
          <div className="modal-badge" style={{ background: '#ede9fe', color: '#7c3aed', border: '1px solid #c4b5fd' }}>◆ CoBrother Help</div>
          <h2>{sw.name}</h2>
          <p>Get a dedicated expert to help you succeed with this software.</p>
        </div>
        <div className="p-8">
          <div className="mb-6">
            {['Dedicated CoBrother assigned within 24 hours',
              'Personalised onboarding and setup guidance',
              'Help with deployment, configuration, and integration',
              'Direct communication channel with your helper'].map((line, i) => (
              <div key={i} className="flex items-center gap-2 mb-3">
                <span className="text-green-600 text-sm">✓</span>
                <span className="text-gray-600 text-sm leading-relaxed">{line}</span>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="text-xs text-gray-600 font-bold uppercase mb-2">Billing Summary</div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 text-sm">Software (already paid)</span>
              <span className="text-gray-600 text-sm">₹{Number(sw.price || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 text-sm">CoBrother Helper Fee</span>
              <span className="text-gray-600 text-sm font-bold">₹1,000</span>
            </div>
            <div className="h-1 bg-gray-200 mb-2" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900 text-sm">Paying Today</span>
              <span className="font-display text-lg font-bold text-purple-700">₹1,000</span>
            </div>
          </div>
          {error && <div className="p-4 bg-red-100 border border-red-200 rounded-lg text-xs text-red-600 mb-6">{error}</div>}
          <div className="flex gap-3">
            <button className="w-full px-6 py-2.5 bg-purple-100 border border-purple-200 text-purple-700 rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:bg-purple-200" onClick={handlePay} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Pay ₹1,000 — Get Help →'}
            </button>
            <button className="w-full px-6 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-sm font-bold cursor-pointer transition-all duration-200 hover:bg-gray-200" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, iconSrc, color = '#111827' }) {
  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="w-8 h-8 mb-2">
        <img src={iconSrc} alt={label} className="w-full h-full object-contain" />
      </div>
      <div className="text-2xl font-bold font-display" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-600 font-semibold mt-1">{label}</div>
    </div>
  );
}