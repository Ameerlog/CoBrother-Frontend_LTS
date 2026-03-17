import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

// Live countdown per card
function useCountdown(endTime) {
  const [timeLeft, setTimeLeft]   = useState('');
  const [isUrgent, setIsUrgent]   = useState(false);
  const [pct, setPct]             = useState(0); // % of time elapsed

  useEffect(() => {
    if (!endTime) return;
    const end = new Date(endTime.endsWith('Z') ? endTime : endTime + 'Z');

    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); setIsUrgent(false); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setIsUrgent(diff < 300000);
      if (d > 0)      setTimeLeft(`${d}d ${h}h ${m}m`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m ${s}s`);
      else            setTimeLeft(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return { timeLeft, isUrgent };
}

export default function AuctionsPage() {
  const navigate              = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all'); // all | ending_soon | no_bids

  useEffect(() => {
    setLoading(true);
    auctionAPI.getActive()
      .then(({ data }) => setAuctions(Array.isArray(data) ? data : []))
      .catch(() => setAuctions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = auctions.filter(a => {
    if (filter === 'ending_soon') {
      const diff = new Date(a.endTime?.endsWith('Z') ? a.endTime : a.endTime + 'Z') - Date.now();
      return diff < 86400000; // < 24h
    }
    if (filter === 'no_bids') return a.totalBids === 0;
    return true;
  });

  return (
    <AppLayout>
      <div className="ventures-page">
        <div className="page-header">
          <div>
            <h1>Live Auctions</h1>
            <p>
              {auctions.length > 0
                ? `${auctions.length} auction${auctions.length !== 1 ? 's' : ''} live right now`
                : 'No live auctions at the moment'}
            </p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/domains')}>
            ◇ Browse Domains
          </button>
        </div>

        {/* ── Filter tabs ── */}
        <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
          {[
            { id: 'all',          label: `All (${auctions.length})`     },
            { id: 'ending_soon',  label: '⚡ Ending Soon'               },
            { id: 'no_bids',      label: '🆕 No Bids Yet'               },
          ].map(t => (
            <button key={t.id}
              className={`filter-tab ${filter === t.id ? 'active' : ''}`}
              onClick={() => setFilter(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ventures-grid">
            {Array.from({ length: 6 }).map((_, i) => <AuctionSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔨</div>
            <h3>
              {filter === 'all'
                ? 'No live auctions right now'
                : filter === 'ending_soon'
                ? 'No auctions ending in the next 24 hours'
                : 'All auctions have at least one bid'}
            </h3>
            <p>Check back soon — new domains go live regularly.</p>
            {filter !== 'all' && (
              <button className="btn-secondary" onClick={() => setFilter('all')}>
                View All Auctions
              </button>
            )}
          </div>
        ) : (
          <div className="ventures-grid">
            {filtered.map(auction => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onClick={() => navigate(`/auction/${auction.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ─── Auction Card ─────────────────────────────────────────────────────────────
function AuctionCard({ auction, onClick }) {
  const { timeLeft, isUrgent } = useCountdown(auction.endTime);
  const domain                  = auction.domain || {};
  const isExtended              = auction.status === 'EXTENDED';

  return (
    <div
      className="venture-card"
      onClick={onClick}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {/* Status pill */}
      <div style={{
        position: 'absolute', top: '0.75rem', right: '0.75rem',
        padding: '0.2rem 0.55rem', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700,
        color: isExtended ? '#c8a96e' : '#6ec896',
        background: isExtended ? 'rgba(200,169,110,0.15)' : 'rgba(110,200,150,0.15)',
        border: `1px solid ${isExtended ? 'rgba(200,169,110,0.35)' : 'rgba(110,200,150,0.35)'}`,
      }}>
        {isExtended ? '⚡ EXTENDED' : '🟢 LIVE'}
      </div>

      {/* Domain info */}
      <div className="venture-card-top" style={{ paddingRight: '5rem' }}>
        <div className="venture-logo-placeholder"
             style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a06ec8',
                      background: 'rgba(160,110,200,0.1)',
                      border: '1px solid rgba(160,110,200,0.2)' }}>
          {domain.domainExtension || '.?'}
        </div>
        <div className="venture-card-meta">
          <h3 className="venture-name">{domain.domainName}{domain.domainExtension}</h3>
          <span style={{ fontSize: '0.72rem', color: '#a06ec8', fontWeight: 600 }}>
            🔨 Auction
          </span>
        </div>
      </div>

      {/* Verified badge */}
      {domain.verified && (
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ec896',
                         background: 'rgba(110,200,150,0.1)',
                         border: '1px solid rgba(110,200,150,0.3)',
                         padding: '0.15rem 0.45rem', borderRadius: 4 }}>
            ✓ Verified
          </span>
        </div>
      )}

      {/* Bid stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem', margin: '0.75rem 0' }}>
        <div style={{ padding: '0.625rem 0.75rem', background: 'rgba(255,255,255,0.04)',
                      borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '0.65rem', color: '#666',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        marginBottom: '0.2rem' }}>
            {auction.currentHighestBid > 0 ? 'Highest Bid' : 'Starting Bid'}
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
                        fontWeight: 700,
                        color: auction.currentHighestBid > 0 ? '#6ec896' : '#c8a96e' }}>
            ₹{Number(
                auction.currentHighestBid > 0
                  ? auction.currentHighestBid
                  : auction.minBidPrice
              ).toLocaleString('en-IN')}
          </div>
        </div>
        <div style={{ padding: '0.625rem 0.75rem', background: 'rgba(255,255,255,0.04)',
                      borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '0.65rem', color: '#666',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        marginBottom: '0.2rem' }}>
            Total Bids
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
                        fontWeight: 700, color: '#e0e0f0' }}>
            {auction.totalBids}
          </div>
        </div>
      </div>

      {/* Next bid minimum */}
      {auction.currentHighestBid > 0 && (
        <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.75rem' }}>
          Next bid: ≥ ₹{Number(auction.currentHighestBid * 1.05).toLocaleString('en-IN',
            { maximumFractionDigits: 0 })}
        </div>
      )}

      {/* Countdown */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#666',
                        textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Ends in
          </div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, fontSize: '1rem',
            color: isUrgent ? '#c86e6e' : '#c8a96e',
            animation: isUrgent ? 'pulse 1s infinite' : 'none',
          }}>
            {timeLeft}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClick(); }}
          style={{
            padding: '0.4rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
            cursor: 'pointer', background: 'rgba(160,110,200,0.15)',
            border: '1px solid rgba(160,110,200,0.35)', color: '#a06ec8',
          }}>
          Bid Now →
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function AuctionSkeleton() {
  return (
    <div className="venture-card" style={{ pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={bone({ width: 44, height: 44, borderRadius: 10 })} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={bone({ height: 12, width: '55%', borderRadius: 6 })} />
          <div style={bone({ height: 10, width: '35%', borderRadius: 6 })} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                    marginBottom: '0.75rem' }}>
        <div style={bone({ height: 52, borderRadius: 8 })} />
        <div style={bone({ height: 52, borderRadius: 8 })} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={bone({ height: 28, width: '40%', borderRadius: 6 })} />
        <div style={bone({ height: 32, width: '30%', borderRadius: 8 })} />
      </div>
    </div>
  );
}

const bone = (style) => ({
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.5s infinite',
  ...style,
});