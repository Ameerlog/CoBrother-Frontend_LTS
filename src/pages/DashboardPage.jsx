import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import VentureIcon from '../assets/Coventure_logo.png';
import CommunityIcon from '../assets/Community-profileicon.png';
import DomainsIcon from '../assets/CoBranding.png';
import TechnologyIcon from '../assets/CoCreation.png';
import AuctionIcon from '../assets/Auction.png';
import PurchaseIcon from '../assets/purchase.png';

export default function DashboardPage() {
  const { user } = useAuth();

  const cards = [
    {
      icon: VentureIcon,
      title: 'Venture',
      desc: 'List, manage and attract co-venturers for your ventures.',
      to: '/ventures',
      cta: 'Manage Ventures',
      accent: '#c8a96e',
    },
    {
      icon: CommunityIcon,
      title: 'Community',
      desc: 'Connect with founders, investors, and operators.',
      to: '/community',
      cta: 'Explore Community',
      accent: '#6e9ec8',
    },
    {
      icon: DomainsIcon,
      title: 'Domains',
      desc: 'List, manage and resell your domain',
      to: '/domains',
      cta: 'Manage Domains',
      accent: '#6e9ec8',
    },
    {
      icon: TechnologyIcon,
      title: 'Technology',
      desc: 'Buy and Manage your software',
      to: '/cocreation',
      cta: 'Distribute Software',
      accent: '#6e9ec8',
    }
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <header className="p-4 md:p-6 bg-white border border-gray-200 rounded-xl md:rounded-[14px] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-md mb-2 md:mb-3">Dashboard</span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 m-0">Hello, {user?.firstname || user?.email?.split('@')[0]}</h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">What are you building today?</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 rounded-full">
              <span className="text-xs text-gray-500 font-medium">Role</span>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">{user?.role || 'USER'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-green-50 rounded-full">
              <span className="text-xs text-gray-500 font-medium">Profile</span>
              <span className="text-xs md:text-sm text-green-600 font-semibold">Complete ✓</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {cards.map((c) => (
            <div key={c.to} className="card-glow-hover p-4 md:p-6 bg-white border border-gray-200 rounded-xl md:rounded-[14px] shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-3 md:mb-4">
                <img src={c.icon} alt={c.title} className="w-full h-full object-contain" />
              </div>
              <h3 className="font-display text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{c.title}</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 flex-1 leading-relaxed">{c.desc}</p>
              <Link to={c.to} className="btn-professional-sm w-full text-center text-xs md:text-sm">{c.cta} →</Link>
            </div>
          ))}
        </div>

        <div className="p-4 md:p-6 bg-white border border-gray-200 rounded-xl md:rounded-[14px] shadow-sm">
          <h2 className="font-display text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Link to="/ventures/new" className="btn-professional flex items-center justify-center gap-2 text-xs md:text-sm">
              <span>+</span> List Ventures
            </Link>
            <Link to="/community" className="btn-professional flex items-center justify-center gap-2 text-xs md:text-sm">
              <img src={CommunityIcon} alt="Community" style={{width: '18px', height: '18px'}} /> Communities
            </Link>
            <Link to="/domains" className="btn-professional flex items-center justify-center gap-2 text-xs md:text-sm">
              <img src={DomainsIcon} alt="Domains" style={{width: '18px', height: '18px'}} /> Domains
            </Link>
            <Link to="/cocreation" className="btn-professional flex items-center justify-center gap-2 text-xs md:text-sm">
              <img src={TechnologyIcon} alt="Technology" style={{width: '18px', height: '18px'}} /> Software
            </Link>
          </div>
        </div>
        <footer className="text-center py-3 md:py-4 text-xs md:text-sm text-gray-500">
          <p>CoBrother Dashboard - Built for focused execution.</p>
        </footer>
      </div>
    </AppLayout>
  );
}
