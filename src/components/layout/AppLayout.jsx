import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import coBrotherLogo from '../../assets/Cobrother_logo.png';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../api/services';
import DashboardIcon from '../../assets/Dashboard.png';
import VentureIcon from '../../assets/Coventure_logo.png';
import CommunityIcon from '../../assets/Community-profileicon.png';
import DomainsIcon from '../../assets/CoBranding.png';
import TechnologyIcon from '../../assets/CoCreation.png';
import AuctionIcon from '../../assets/Auction.png';
import PurchaseIcon from '../../assets/purchase.png';
import NotificationIcon from '../../assets/notification.png';
import AdminIcon from '../../assets/Community-profileicon.png';

const TYPE_ICONS = {
  COVENTURE_APPLICATION_RECEIVED:      '📋',
  COVENTURE_APPLICATION_STATUS_CHANGED:'📣',
  DOMAIN_SOLD:                         '◇',
  SOFTWARE_PURCHASED:                  '⟁',
  SOFTWARE_MARKED_COMPLETE:            '✓',
  PROFILE_VIEWED:                      '👁',
  NEW_LISTING_IN_INDUSTRY:             '🆕',
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen]           = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const bellRef = useRef(null);

  
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/ventures', label: 'Venture', icon: VentureIcon },
    { to: '/domains',    label: 'Domains',   icon: DomainsIcon },
    { to: '/cocreation',  label: 'Technology',  icon: TechnologyIcon },
    { to: '/community', label: 'Community', icon: CommunityIcon },
    { to: '/auctions',  label: 'Auctions',  icon: AuctionIcon },
    { to: '/purchases', label: 'Purchases', icon: PurchaseIcon },
  ];

  // Add after existing navLinks:
  const coBrotherLinks = [
    { to: '/cobrother', label: 'CoBrother', icon: '◆' },
  ];
  
  // Admin sees everything + admin panel
  const adminLinks = [
    ...navLinks,
    { to: '/admin', label: 'Admin', icon: AdminIcon },
  ];
  
  const visibleLinks = user?.role === 'COBROTHER'
  ? coBrotherLinks
  : user?.role === 'ADMIN'
  ? adminLinks
  : navLinks;

  useEffect(() => {
    const fetchCount = () =>
      notificationAPI.getUnreadCount()
        .then(({ data }) => setUnreadCount(data.count))
        .catch(() => {});
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close bell when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellOpen = async () => {
    if (!bellOpen) {
      try {
        const { data } = await notificationAPI.getRecent();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {}
    }
    setBellOpen(v => !v);
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      await notificationAPI.markOneRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    }
    setBellOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-[100] flex items-center gap-8 px-8 h-16 bg-white border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center gap-0 no-underline">
          <img src={coBrotherLogo} alt="CoBrother" className="w-[140px] h-[42px] object-contain" />
        </Link>

        <div className={`flex items-center gap-1 flex-1 max-md:hidden max-md:fixed max-md:top-16 max-md:left-0 max-md:right-0 max-md:bg-white max-md:border-b max-md:border-gray-200 max-md:flex-col max-md:p-4 max-md:gap-1 ${
          mobileOpen ? 'max-md:flex' : 'max-md:hidden'
        }`}>
          {visibleLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-sm font-medium text-gray-600 no-underline transition-all duration-200 hover:text-gray-900 hover:bg-gray-100 ${
                location.pathname.startsWith(l.to) ? 'text-indigo-600 bg-[#eef2ff]' : ''
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="inline-flex items-center justify-center w-5 h-5">
                <img src={l.icon} alt="" className="w-full h-full object-contain" />
              </span>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">

        <div className="relative" ref={bellRef}>
            <button 
              className="relative bg-transparent border border-gray-200 cursor-pointer text-lg p-1.5 rounded-lg text-gray-600 transition-all duration-150 leading-none hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
              onClick={handleBellOpen} 
              title="Notifications"
            >
              <img src={NotificationIcon} alt="Notifications" style={{width: '20px', height: '20px'}} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#c86e6e] text-white text-[0.6rem] font-bold min-w-[16px] h-4 rounded-lg flex items-center justify-center px-[3px] pointer-events-none">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 w-[360px] bg-white border border-gray-200 rounded-[14px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3.5 border-b border-gray-100 font-semibold text-sm text-gray-900">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      className="bg-transparent border-none text-indigo-600 text-xs cursor-pointer p-0 hover:underline"
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[380px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center text-gray-500 text-sm">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id}
                        className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 cursor-pointer transition-colors duration-150 relative last:border-b-0 hover:bg-gray-50 ${
                          !n.read ? 'bg-[#f8faff]' : ''
                        }`}
                        onClick={() => handleNotificationClick(n)}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-indigo-50 flex-shrink-0">
                          {TYPE_ICONS[n.type] || '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.82rem] font-semibold text-gray-900 mb-0.5">{n.title}</div>
                          <div className="text-[0.77rem] text-gray-500 leading-snug whitespace-nowrap overflow-hidden text-ellipsis">{n.message}</div>
                          <div className="text-[0.7rem] text-gray-400 mt-1">{timeAgo(n.createdAt)}</div>
                        </div>
                        {!n.read && <div className="w-[7px] h-[7px] rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />}
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-3 border-t border-gray-100 text-center">
                  <Link 
                    to="/notifications" 
                    onClick={() => setBellOpen(false)}
                    className="text-[0.78rem] text-indigo-600 no-underline hover:underline"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm">
              {user?.firstname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-sm font-medium text-gray-700 max-md:hidden">{user?.firstname || user?.email?.split('@')[0]}</span>
            <button 
              className="bg-transparent border border-gray-200 text-gray-600 rounded-lg p-1.5 cursor-pointer transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              onClick={handleLogout} 
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
          <button 
            className="hidden max-md:flex bg-transparent border-none text-gray-900 text-xl cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-none m-0 w-full bg-gray-50 max-md:p-4">
        {children}
      </main>
    </div>
  );
}
