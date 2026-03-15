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
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>CoBrother Fee Requests</h1>
            <p>Payment requests from admin for CoBrother services.</p>
          </div>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◆</div>
            <h3>No fee requests</h3>
            <p>No CoBrother service requests have been made for your listings.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {requests.map(r => {
              const s = STATUS_COLORS[r.status] || { color: '#888', label: r.status };
              return (
                <div key={r.id} style={{ padding: '1rem 1.25rem',
                                          background: 'rgba(255,255,255,0.03)',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                          borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                                flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#e0e0f0' }}>{r.entityTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: '#888' }}>{r.requestType}</div>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: s.color }}>
                      {s.label}
                    </span>
                  </div>

                  {r.coBrotherNote && (
                    <div style={{ fontSize: '0.82rem', color: '#a0a0b0', marginBottom: '0.75rem' }}>
                      <strong>CoBrother Note:</strong> {r.coBrotherNote}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {r.status === 'PAYMENT_PENDING' && (
                      <>
                        <button className="btn-primary btn-sm"
                          onClick={() => setPayTarget(r)}>
                          Pay ₹1,000 →
                        </button>
                        <button className="btn-ghost btn-sm"
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
      </div>

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
        theme: { color: '#c8a96e' },
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 440 }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-badge">CoBrother Service Fee</div>
          <h2>{request.entityTitle}</h2>
          <p>One-time fee to engage CoBrother services for this request.</p>
        </div>

        <div style={{ margin: '1.5rem 0', padding: '1rem',
                      background: 'rgba(110,200,150,0.08)',
                      border: '1px solid rgba(110,200,150,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>
            Service Fee
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#6ec896',
                        fontFamily: 'Cormorant Garamond, serif' }}>
            ₹1,000
          </div>
        </div>

        <div style={{ padding: '0.875rem', background: 'rgba(200,169,110,0.08)',
                      border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8,
                      marginBottom: '1.25rem', fontSize: '0.83rem', color: '#c8a96e' }}>
          ⚡ After payment, a CoBrother will be assigned to assist with your request.
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={handlePay}
            disabled={loading} style={{ flex: 1 }}>
            {loading ? <span className="btn-spinner" /> : 'Pay ₹1,000 →'}
          </button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}