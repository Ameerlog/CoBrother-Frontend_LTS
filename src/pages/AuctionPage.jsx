import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../hooks/useAuction';
import { auctionAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

// FIX #12: countdown uses ISO string with Z suffix (normalized in useAuction)
function useCountdown(endTime) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const tick = () => {
      const end  = new Date(endTime); // endTime already has Z suffix from hook
      const diff = end - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); setIsUrgent(false); return; }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setIsUrgent(diff < 300000); // last 5 mins
      if (d > 0)      setTimeLeft(`${d}d ${h}h ${m}m`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m ${s}s`);
      else            setTimeLeft(`${m}m ${s}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return { timeLeft, isUrgent };
}

export default function AuctionPage() {
  const { auctionId }  = useParams();
  const { user }       = useAuth();
  const navigate       = useNavigate();
  const { auction, bids, minNextBid, connected, loading, lastUpdate, placeBid }
                       = useAuction(auctionId);
  const { timeLeft, isUrgent } = useCountdown(auction?.endTime);

  const [bidAmount, setBidAmount]         = useState('');
  const [bidLoading, setBidLoading]       = useState(false);
  const [bidError, setBidError]           = useState('');
  const [bidSuccess, setBidSuccess]       = useState('');
  const [flashBid, setFlashBid]           = useState(false);
  const [reAuctionModal, setReAuctionModal] = useState(false);
  const bidListRef = useRef(null);

  // FIX #13: access domain.listedBy safely — it comes through because
  // @JsonIgnoreProperties on domain only strips {"auction","hibernateLazyInitializer"}
  const isOwner  = auction?.domain?.listedBy?.id === user?.id;
  const isActive = auction?.status === 'ACTIVE' || auction?.status === 'EXTENDED';
  const isEnded  = auction?.status === 'ENDED'  || auction?.status === 'UNSOLD';

  // Flash on new bid
  useEffect(() => {
    if (lastUpdate?.type === 'BID_PLACED') {
      setFlashBid(true);
      setTimeout(() => setFlashBid(false), 600);
      setBidSuccess('');
      setBidError('');
    }
  }, [lastUpdate]);

  // Scroll bid list to top on new bid
  useEffect(() => {
    if (bidListRef.current) bidListRef.current.scrollTop = 0;
  }, [bids.length]);

  const handleBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!amount || amount < minNextBid) {
      setBidError(`Minimum bid is ₹${Number(minNextBid).toLocaleString('en-IN')}`);
      return;
    }
    setBidLoading(true); setBidError(''); setBidSuccess('');
    try {
      await placeBid(amount);
      setBidSuccess(`Bid of ₹${Number(amount).toLocaleString('en-IN')} placed!`);
      setBidAmount('');
    } catch (err) {
      setBidError(err.response?.data?.error || 'Failed to place bid.');
    } finally { setBidLoading(false); }
  };

  if (loading) return (
    <AppLayout>
      <div className="page-loading"><div className="spinner" /></div>
    </AppLayout>
  );

  if (!auction) return (
    <AppLayout>
      <div className="empty-state"><h3>Auction not found</h3></div>
    </AppLayout>
  );

  const domain = auction.domain || {};

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1rem' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <button className="btn-ghost btn-sm auction-back-btn" onClick={() => navigate('/domains')}
            style={{ marginBottom: '1rem' }}>
            ← Back to Domains
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-start',
                        justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
                            flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem',
                             fontWeight: 700, color: '#111827', margin: 0 }}>
                  {domain.domainName}{domain.domainExtension}
                </h1>
                {domain.verified && (
                  <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6,
                                 fontSize: '0.75rem', fontWeight: 700, color: '#6ec896',
                                 background: 'rgba(110,200,150,0.1)',
                                 border: '1px solid rgba(110,200,150,0.3)' }}>
                    ✓ Verified
                  </span>
                )}
                <StatusBadge status={auction.status} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%',
                               background: connected ? '#6ec896' : '#c86e6e',
                               display: 'inline-block' }} />
                <span style={{ fontSize: '0.78rem',
                               color: connected ? '#6ec896' : '#c86e6e' }}>
                  {connected ? 'Live' : 'Reconnecting…'}
                </span>
              </div>
            </div>

            {/* Countdown */}
            {isActive && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.25rem',
                              textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {auction.status === 'EXTENDED' ? '⚡ Extended — Ends in' : 'Ends in'}
                </div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '2rem', fontWeight: 700,
                  color: isUrgent ? '#c86e6e' : '#c8a96e',
                  animation: isUrgent ? 'pulse 1s infinite' : 'none',
                }}>
                  {timeLeft}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px',
                      gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Left: Bid info + history ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Current bid stats card */}
            <div style={{
              padding: '1.5rem',
              background: flashBid ? 'rgba(110,200,150,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${flashBid
                ? 'rgba(110,200,150,0.4)'
                : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 14,
              transition: 'all 0.3s',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={statLabel}>Current Highest Bid</div>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '2rem', fontWeight: 700,
                    color: auction.currentHighestBid > 0 ? '#6ec896' : '#888',
                  }}>
                    {auction.currentHighestBid > 0
                      ? `₹${Number(auction.currentHighestBid).toLocaleString('en-IN')}`
                      : 'No bids yet'}
                  </div>
                  {auction.currentWinnerName && (
                    <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.25rem' }}>
                      Leading: {auction.currentWinnerName}
                    </div>
                  )}
                </div>
                <div>
                  <div style={statLabel}>Starting Bid</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif',
                                fontSize: '1.5rem', fontWeight: 700, color: '#c8a96e' }}>
                    ₹{Number(auction.minBidPrice).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={statLabel}>Total Bids</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif',
                                fontSize: '2rem', fontWeight: 700, color: '#111827' }}>
                    {auction.totalBids}
                  </div>
                </div>
              </div>

              {isActive && auction.currentHighestBid > 0 && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem',
                              background: 'rgba(200,169,110,0.08)',
                              border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8,
                              fontSize: '0.82rem', color: '#c8a96e' }}>
                  Next minimum bid:{' '}
                  <strong>₹{Number(minNextBid).toLocaleString('en-IN')}</strong>
                  <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                    (5% above current)
                  </span>
                </div>
              )}
            </div>

            {/* Bid History */}
            <div style={{ background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem',
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                            fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>
                Bid History
                <span style={{ color: '#6b7280', fontWeight: 400,
                               marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                  ({bids.length} bids)
                </span>
              </div>
              <div ref={bidListRef}
                   style={{ maxHeight: 360, overflowY: 'auto', padding: '0.5rem 0' }}>
                {bids.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center',
                                color: '#666', fontSize: '0.875rem' }}>
                    No bids yet. Be the first to bid!
                  </div>
                ) : (
                  bids.map((bid, i) => (
                    <BidRow key={i} bid={bid} isLatest={i === 0}
                            isWinner={bid.isWinningBid || bid.winningBid} />
                  ))
                )}
              </div>
            </div>

            {/* UNSOLD — lister options */}
            {isOwner && auction.status === 'UNSOLD' && (
              <div style={{ padding: '1.25rem',
                            background: 'rgba(200,169,110,0.06)',
                            border: '1px solid rgba(200,169,110,0.2)', borderRadius: 12 }}>
                <div style={{ fontWeight: 600, color: '#c8a96e', marginBottom: '0.5rem' }}>
                  Auction ended with no bids
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  You can re-auction with new settings, or take the listing down.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-primary"
                    onClick={() => setReAuctionModal(true)}>
                    ↺ Re-Auction
                  </button>
                  <button className="btn-danger"
                    onClick={async () => {
                      try {
                        await auctionAPI.close(auction.id);
                        navigate('/domains/dashboard');
                      } catch (e) {
                        alert('Failed to close auction.');
                      }
                    }}>
                    Take Down
                  </button>
                </div>
              </div>
            )}

            {/* ENDED — winner announcement */}
            {auction.status === 'ENDED' && (
              <div style={{ padding: '1.5rem', textAlign: 'center',
                            background: 'rgba(110,200,150,0.06)',
                            border: '1px solid rgba(110,200,150,0.2)', borderRadius: 14 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem',
                             color: '#6ec896', marginBottom: '0.5rem' }}>
                  Auction Won!
                </h3>
                <p style={{ color: '#6b7280' }}>
                  <strong style={{ color: '#111827' }}>
                    {auction.currentWinnerName || 'A bidder'}
                  </strong>
                  {' '}won with a bid of{' '}
                  <strong style={{ color: '#6ec896' }}>
                    ₹{Number(auction.currentHighestBid).toLocaleString('en-IN')}
                  </strong>
                </p>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Our admin team will coordinate the transfer.
                </p>
              </div>
            )}
          </div>

          {/* ── Right: Bid placement + info ── */}
          <div style={{ position: 'sticky', top: '1.5rem',
                        display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Bid form — only for non-owner, active auction */}
            {isActive && !isOwner && (
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14 }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem',
                             marginBottom: '1.25rem', color: '#0f172a' }}>
                  Place Your Bid
                </h3>

                {/* Quick bid buttons */}
                {minNextBid > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={statLabel}>Quick Bid</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
                                  marginTop: '0.5rem' }}>
                      {[1, 1.1, 1.25].map(mult => {
                        const quickAmount = Math.ceil(minNextBid * mult / 100) * 100;
                        const selected = bidAmount === String(quickAmount);
                        return (
                          <button key={mult}
                            onClick={() => setBidAmount(String(quickAmount))}
                            style={{
                              padding: '0.4rem 0.75rem', borderRadius: 8,
                              fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600,
                              background: selected ? 'rgba(200,169,110,0.2)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${selected ? 'rgba(200,169,110,0.5)' : 'rgba(255,255,255,0.1)'}`,
                              color: selected ? '#c8a96e' : '#6b7280',
                              transition: 'all 0.15s',
                            }}>
                            ₹{Number(quickAmount).toLocaleString('en-IN')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.78rem', color: '#6b7280',
                                  marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>
                    YOUR BID AMOUNT (₹)
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => { setBidAmount(e.target.value); setBidError(''); }}
                    placeholder={`Min ₹${Number(minNextBid).toLocaleString('en-IN')}`}
                    min={minNextBid}
                    style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 600,
                      background: '#f3f4f6',
                      color: '#111827',
                      border: '2px solid #e5e7eb',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px'
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleBid()}
                  />
                </div>

                {bidError && (
                  <div style={{ padding: '0.75rem', background: 'rgba(200,110,110,0.08)',
                                border: '1px solid rgba(200,110,110,0.25)', borderRadius: 8,
                                marginBottom: '1rem', fontSize: '0.82rem', color: '#c86e6e' }}>
                    {bidError}
                  </div>
                )}

                {bidSuccess && (
                  <div style={{ padding: '0.75rem', background: 'rgba(110,200,150,0.08)',
                                border: '1px solid rgba(110,200,150,0.25)', borderRadius: 8,
                                marginBottom: '1rem', fontSize: '0.82rem', color: '#6ec896' }}>
                    ✓ {bidSuccess}
                  </div>
                )}

                <button className="btn-primary auction-bid-btn" onClick={handleBid}
                  disabled={bidLoading || !bidAmount}
                  style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}>
                  {bidLoading ? <span className="btn-spinner" /> :
                    `Place Bid${bidAmount
                      ? ` — ₹${Number(bidAmount).toLocaleString('en-IN')}`
                      : ''} →`}
                </button>

                <p style={{ fontSize: '0.72rem', color: '#374151', marginTop: '0.75rem',
                            textAlign: 'center', lineHeight: 1.5 }}>
                  By bidding you commit to purchasing this domain if you win.
                  Each bid must be at least 5% above the current highest bid.
                </p>
              </div>
            )}

            {/* Owner — can't bid on own listing */}
            {isOwner && isActive && (
              <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
                            textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👑</div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  This is your auction. You cannot bid on your own listing.
                </p>
              </div>
            )}

            {/* Auction info card */}
            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
              <div style={{ ...statLabel, color: '#111827' }}>Auction Info</div>
              <div style={{ display: 'flex', flexDirection: 'column',
                            gap: '0.6rem', marginTop: '0.75rem' }}>
                <InfoRow label="Duration"
                  value={auction.duration?.replace(/_/g, ' ')} />
                <InfoRow label="Started"
                  value={auction.startTime
                    ? new Date(
                        auction.startTime.endsWith('Z')
                          ? auction.startTime
                          : auction.startTime + 'Z'
                      ).toLocaleDateString('en-IN',
                        { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'} />
                <InfoRow label="Ends"
                  value={auction.endTime
                    ? new Date(
                        auction.endTime.endsWith('Z')
                          ? auction.endTime
                          : auction.endTime + 'Z'
                      ).toLocaleDateString('en-IN',
                        { day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit' })
                    : '—'} />
                {auction.status === 'EXTENDED' && (
                  <div style={{ padding: '0.5rem 0.75rem',
                                background: 'rgba(200,169,110,0.08)',
                                border: '1px solid rgba(200,169,110,0.25)',
                                borderRadius: 6, fontSize: '0.75rem', color: '#c8a96e' }}>
                    ⚡ Extended due to last-minute bid
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {reAuctionModal && (
        <ReAuctionModal
          auctionId={auction.id}
          onClose={() => setReAuctionModal(false)}
          onSuccess={() => { setReAuctionModal(false); window.location.reload(); }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </AppLayout>
  );
}

// ─── Bid Row ──────────────────────────────────────────────────────────────────
function BidRow({ bid, isLatest, isWinner }) {
  // FIX #12: normalize bidTime
  const bidTimeStr = bid.bidTime
    ? new Date(bid.bidTime.endsWith('Z') ? bid.bidTime : bid.bidTime + 'Z')
        .toLocaleTimeString('en-IN',
          { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '0.75rem 1.25rem',
      background: isLatest ? 'rgba(110,200,150,0.04)' : 'transparent',
      borderLeft: isLatest ? '3px solid #6ec896' : '3px solid transparent',
      transition: 'all 0.3s',
    }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isWinner ? 'rgba(200,169,110,0.15)' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700,
                    color: isWinner ? '#c8a96e' : '#374151' }}>
        {isWinner ? '🏆' : bid.bidderName?.[0]?.toUpperCase() || '?'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
          {bid.bidderName || 'Anonymous'}
          {isWinner && (
            <span style={{ marginLeft: '0.4rem', fontSize: '0.68rem',
                           color: '#c8a96e', fontWeight: 700 }}>
              WINNER
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{bidTimeStr}</div>
      </div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
                    fontWeight: 700, color: isLatest ? '#6ec896' : '#c8a96e',
                    flexShrink: 0 }}>
        ₹{Number(bid.amount).toLocaleString('en-IN')}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    DRAFT:    { color: '#888',    label: 'Draft'       },
    ACTIVE:   { color: '#6ec896', label: '🟢 Live'     },
    EXTENDED: { color: '#c8a96e', label: '⚡ Extended' },
    ENDED:    { color: '#a06ec8', label: 'Ended'       },
    UNSOLD:   { color: '#c86e6e', label: 'Unsold'      },
    CLOSED:   { color: '#666',    label: 'Closed'      },
  }[status] || { color: '#888', label: status };

  return (
    <span style={{
      padding: '0.3rem 0.75rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
      color: config.color, background: config.color + '18',
      border: `1px solid ${config.color}33`,
    }}>
      {config.label}
    </span>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
      <span style={{ color: '#4b5563' }}>{label}</span>
      <span style={{ color: '#111827', fontWeight: 600 }}>{value || '—'}</span>
    </div>
  );
}

// ─── Re-Auction Modal ─────────────────────────────────────────────────────────
function ReAuctionModal({ auctionId, onClose, onSuccess }) {
  const [form, setForm]       = useState({ minBidPrice: '', duration: 'SEVEN_DAYS' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.minBidPrice || parseFloat(form.minBidPrice) <= 0) {
      setError('Please enter a valid minimum bid.');
      return;
    }
    setLoading(true); setError('');
    try {
      await auctionAPI.reAuction(auctionId, {
        minBidPrice: parseFloat(form.minBidPrice),
        duration:    form.duration,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to re-auction.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 440 }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-badge">Re-Auction</div>
          <h2>Start a New Auction</h2>
          <p>Set new parameters for your re-auction.</p>
        </div>
        <form onSubmit={handleSubmit} className="venture-form" style={{ marginTop: '1.25rem' }}>
          <div className="form-group">
            <label>New Minimum Bid (₹) <span className="required">*</span></label>
            <input type="number" min="1" value={form.minBidPrice}
              onChange={e => setForm(f => ({ ...f, minBidPrice: e.target.value }))}
              placeholder="e.g. 5000" required />
          </div>
          <div className="form-group">
            <label>Auction Duration <span className="required">*</span></label>
            <select value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
              <option value="ONE_DAY">1 Day</option>
              <option value="SEVEN_DAYS">7 Days</option>
              <option value="FIFTEEN_DAYS">15 Days</option>
              <option value="THIRTY_DAYS">30 Days</option>
            </select>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ flex: 1 }}>
              {loading ? <span className="btn-spinner" /> : 'Start Re-Auction →'}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const statLabel = {
  fontSize: '0.72rem', fontWeight: 600, color: '#888',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem',
};