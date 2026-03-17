import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { auctionAPI } from '../api/services';

export function useAuction(auctionId) {
  const [auction, setAuction]       = useState(null);
  const [bids, setBids]             = useState([]);
  const [minNextBid, setMinNextBid] = useState(0);
  const [connected, setConnected]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const clientRef                   = useRef(null);

  // FIX #11: define handleUpdate BEFORE the WebSocket useEffect
  // so the subscription callback always captures the latest version via ref
  const handleUpdateRef = useRef(null);

  const handleUpdate = useCallback((msg) => {
    setLastUpdate(msg);

    if (msg.type === 'BID_PLACED') {
      setAuction(prev => prev ? {
        ...prev,
        currentHighestBid: msg.currentHighestBid,
        totalBids:         msg.totalBids,
        // FIX #12: normalize endTime — append Z if missing so JS parses as UTC
        endTime:           msg.endTime
            ? (msg.endTime.endsWith('Z') ? msg.endTime : msg.endTime + 'Z')
            : prev.endTime,
        status:            msg.status,
        currentWinnerName: msg.currentWinnerName,
      } : prev);
      setMinNextBid(msg.currentHighestBid * 1.05);
      if (msg.latestBid) {
        setBids(prev => [msg.latestBid, ...prev]);
      }
    } else if (msg.type === 'AUCTION_ENDED' || msg.type === 'AUCTION_UNSOLD') {
      setAuction(prev => prev ? { ...prev, status: msg.status } : prev);
    } else if (msg.type === 'AUCTION_EXTENDED' || msg.type === 'BID_PLACED') {
      // endTime update already handled above — also handle standalone EXTENDED message
      if (msg.endTime) {
        setAuction(prev => prev ? {
          ...prev,
          endTime: msg.endTime.endsWith('Z') ? msg.endTime : msg.endTime + 'Z',
          status: msg.status,
        } : prev);
      }
    } else if (msg.type === 'AUCTION_STARTED') {
      setAuction(prev => prev ? { ...prev, status: 'ACTIVE' } : prev);
    }
  }, []);

  // Keep ref in sync so WebSocket callback is never stale
  handleUpdateRef.current = handleUpdate;

  // Initial data load
  useEffect(() => {
    if (!auctionId) return;
    setLoading(true);
    auctionAPI.get(auctionId)
      .then(({ data }) => {
        // FIX #12: normalize endTime from initial load too
        const a = data.auction;
        if (a?.endTime && !a.endTime.endsWith('Z')) a.endTime = a.endTime + 'Z';
        setAuction(a);
        setBids(data.bids || []);
        setMinNextBid(data.minNextBid || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [auctionId]);

  // WebSocket connection — uses ref so callback is never stale
  useEffect(() => {
    if (!auctionId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/auction/${auctionId}`, (frame) => {
          try {
            const msg = JSON.parse(frame.body);
            // Use ref so we always call the latest version of handleUpdate
            handleUpdateRef.current(msg);
          } catch (e) {
            console.error('Failed to parse auction message:', e);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [auctionId]);

  const placeBid = useCallback(async (amount) => {
    return auctionAPI.placeBid(auctionId, amount);
  }, [auctionId]);

  return { auction, bids, minNextBid, connected, loading, lastUpdate, placeBid };
}