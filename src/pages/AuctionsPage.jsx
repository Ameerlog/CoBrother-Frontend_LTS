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
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 m-0">Live Auctions</h1>
            <p className="text-gray-600 mt-1">
              {auctions.length > 0
                ? `${auctions.length} auction${auctions.length !== 1 ? 's' : ''} live right now`
                : 'No live auctions at the moment'}
            </p>
          </div>
          <button className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-purple hover:bg-purple-50" onClick={() => navigate('/domains')}>
            ◇ Browse Domains
          </button>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all',          label: `All (${auctions.length})`     },
            { id: 'ending_soon',  label: '⚡ Ending Soon'               },
            { id: 'no_bids',      label: '🆕 No Bids Yet'               },
          ].map(t => (
            <button key={t.id}
              className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${filter === t.id ? 'bg-purple text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-purple hover:bg-purple-50'}`}
              onClick={() => setFilter(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <AuctionSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔨</div>
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
              {filter === 'all'
                ? 'No live auctions right now'
                : filter === 'ending_soon'
                ? 'No auctions ending in the next 24 hours'
                : 'All auctions have at least one bid'}
            </h3>
            <p className="text-gray-600 mb-6">Check back soon — new domains go live regularly.</p>
            {filter !== 'all' && (
              <button className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-purple hover:bg-purple-50" onClick={() => setFilter('all')}>
                View All Auctions
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-purple cursor-pointer relative"
      onClick={onClick}
    >
      {/* Status pill */}
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold" style={{
        color: isExtended ? '#c8a96e' : '#6ec896',
        background: isExtended ? 'rgba(200,169,110,0.15)' : 'rgba(110,200,150,0.15)',
        border: `1px solid ${isExtended ? 'rgba(200,169,110,0.35)' : 'rgba(110,200,150,0.35)'}`,
      }}>
        {isExtended ? '⚡ EXTENDED' : '🟢 LIVE'}
      </div>

      {/* Domain info */}
      <div className="flex items-center gap-3 mb-4 pr-20">
        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-bold text-purple-600 bg-purple-100 border border-purple-200">
          {domain.domainExtension || '.?'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 m-0 truncate">{domain.domainName}{domain.domainExtension}</h3>
          <span className="text-xs text-purple-600 font-semibold">
            🔨 Auction
          </span>
        </div>
      </div>

      {/* Verified badge */}
      {domain.verified && (
        <div className="mb-2">
          <span className="text-xs font-bold text-green-600 bg-green-100 border border-green-300 px-2 py-0.5 rounded">
            ✓ Verified
          </span>
        </div>
      )}

      {/* Bid stats */}
      <div className="grid grid-cols-2 gap-3 my-3">
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-700 uppercase tracking-wider mb-1 font-bold">
            {auction.currentHighestBid > 0 ? 'Highest Bid' : 'Starting Bid'}
          </div>
          <div className={`font-display text-xl font-bold ${auction.currentHighestBid > 0 ? 'text-green-600' : 'text-amber-500'}`}>
            ₹{Number(
                auction.currentHighestBid > 0
                  ? auction.currentHighestBid
                  : auction.minBidPrice
              ).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-700 uppercase tracking-wider mb-1 font-bold">
            Total Bids
          </div>
          <div className="font-display text-xl font-bold text-gray-900">
            {auction.totalBids}
          </div>
        </div>
      </div>

      {/* Next bid minimum */}
      {auction.currentHighestBid > 0 && (
        <div className="text-sm text-gray-700 mb-3 font-semibold">
          Next bid: ≥ ₹{Number(auction.currentHighestBid * 1.05).toLocaleString('en-IN',
            { maximumFractionDigits: 0 })}
        </div>
      )}

      {/* Countdown */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200">
        <div>
          <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold">
            Ends in
          </div>
          <div className={`font-display font-bold text-lg ${isUrgent ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
            {timeLeft}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClick(); }}
          className="px-5 py-2 bg-transparent border-2 border-purple text-purple rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple hover:text-white">
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm pointer-events-none">
      <div className="flex gap-3 mb-4">
        <div className="w-11 h-11 rounded-[10px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 w-[55%] rounded-md bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          <div className="h-2.5 w-[35%] rounded-md bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="h-[52px] rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        <div className="h-[52px] rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-7 w-[40%] rounded-md bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        <div className="h-8 w-[30%] rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
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