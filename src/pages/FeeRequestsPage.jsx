import { useState, useEffect } from 'react';
import { feeAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const STATUS_COLORS = {
  PAYMENT_PENDING:   { color: '#c8a96e', label: 'Payment Required' },
  FORWARDED:         { color: '#a06ec8', label: 'Under Review'     },
  ACCEPTED:          { color: '#6ec896', label: 'Accepted'         },
  REJECTED:          { color: '#c86e6e', label: 'Rejected'         },
  CANCELLED:         { color: '#666',    label: 'Cancelled'        },
};

export default function FeeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [payTarget, setPayTarget] = useState(null);

  const load = () => {
    setLoading(true);
    feeAPI.getMyRequests()
      .then(({ data }) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this request?')) return;
    await feeAPI.cancel(id);
    load();
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 m-0">CoBrother Fee Requests</h1>
          <p className="text-gray-600 mt-1">Payment requests from admin for CoBrother services.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">◆</div>
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">No fee requests</h3>
          <p className="text-gray-600">No CoBrother service requests have been made for your listings.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map(r => {
            const s = STATUS_COLORS[r.status] || { color: '#888', label: r.status };
            return (
              <div key={r.id} className="p-4 bg-white border border-gray-200 rounded-[10px] shadow-sm">
                <div className="flex justify-between flex-wrap gap-2 mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{r.entityTitle}</div>
                    <div className="text-xs text-gray-500">{r.requestType}</div>
                  </div>
                  <span className="text-xs font-bold" style={{ color: s.color }}>
                    {s.label}
                  </span>
                </div>

                {r.coBrotherNote && (
                  <div className="text-xs text-gray-400 mb-3">
                    <strong>CoBrother Note:</strong> {r.coBrotherNote}
                  </div>
                )}

                <div className="flex gap-3 flex-wrap">
                  {r.status === 'PAYMENT_PENDING' && (
                    <>
                      <button className="px-4 py-2 bg-white border-2 border-purple-400 text-purple-600 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-50"
                        onClick={() => setPayTarget(r)}>
                        Pay ₹1,000 →
                      </button>
                      <button className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-600 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-50"
                        onClick={() => handleCancel(r.id)}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {payTarget && (
        <FeePaymentModal
          request={payTarget}
          onClose={() => setPayTarget(null)}
          onSuccess={() => { setPayTarget(null); load(); }}
        />
      )}
    </AppLayout>
  );
}

function FeePaymentModal({ request, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handlePay = async () => {
    setLoading(true); setError('');
    try {
      const { data: orderData } = await feeAPI.createOrder(request.id);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: 'INR',
        name: 'CoBrother',
        description: 'CoBrother Service Fee — ' + request.entityTitle,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            await feeAPI.verify(request.id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId:   response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess();
          } catch {
            setError('Payment verification failed. Contact support.');
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: '#a06ec8' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[440px] bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-slideUp">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-purple-100/30 blur-3xl pointer-events-none" />
        <button className="absolute top-4 right-4 z-20 bg-transparent border-none text-gray-400 text-xl cursor-pointer transition-colors duration-200 hover:text-gray-700" onClick={onClose}>✕</button>
        <div className="relative z-10 p-8 pb-6">
          <div className="inline-block px-2.5 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-md mb-4">CoBrother Service Fee</div>
          <h2 className="font-display text-2xl font-bold text-gray-900 m-0 mb-2">{request.entityTitle}</h2>
          <p className="text-gray-500 text-sm m-0 mb-6">One-time fee to engage CoBrother services for this request.</p>
        </div>

        <div className="relative z-10 mx-8 my-6 p-4 bg-green-500/8 border border-green-500/20 rounded-[10px]">
          <div className="text-xs text-gray-500 mb-1">
            Service Fee
          </div>
          <div className="text-[1.75rem] font-bold text-green-400 font-display">
            ₹1,000
          </div>
        </div>

        <div className="relative z-10 mx-8 px-3.5 py-3 bg-purple-50 border border-purple-200 rounded-lg mb-5 text-xs text-purple-700">
          ⚡ After payment, a CoBrother will be assigned to assist with your request.
        </div>

        {error && <div className="relative z-10 mx-8 mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[10px] text-red-400 text-sm">{error}</div>}

        <div className="relative z-10 px-8 pb-8 flex gap-3">
          <button onClick={handlePay} disabled={loading}
            className="flex-1 px-6 py-2.5 bg-white border-2 border-purple-400 text-purple-600 rounded-full font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" /> : 'Pay ₹1,000 →'}
          </button>
          <button onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-full font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}