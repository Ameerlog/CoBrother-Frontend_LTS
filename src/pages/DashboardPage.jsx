import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import VentureIcon from '../assets/Coventure_logo.png';
import CommunityIcon from '../assets/CoCommunity.png';
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
      desc: 'List, manage and distribute your software',
      to: '/cocreation',
      cta: 'Distribute Software',
      accent: '#6e9ec8',
    }
  ];

  return (
    <AppLayout>
      <div className="dashboard-page">
        <header className="dashboard-header card">
          <div className="dashboard-greeting">
            <span className="greeting-badge">Dashboard</span>
            <h1>Hello, {user?.firstname || user?.email?.split('@')[0]}</h1>
            <p>What are you building today?</p>
          </div>
          <div className="dashboard-stats">
            <div className="stat-pill">
              <span className="stat-label">Role</span>
              <span className="stat-value">{user?.role || 'USER'}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Profile</span>
              <span className="stat-value complete">Complete ✓</span>
            </div>
          </div>
        </header>

        <div className="dashboard-cards">
          {cards.map((c) => (
            <div key={c.to} className="dash-card card" style={{ '--accent': c.accent }}>
              <div className="dash-card-icon">
                <img src={c.icon} alt={c.title} />
              </div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <Link to={c.to} className="dash-card-cta btn-outline-gradient">{c.cta} →</Link>
            </div>
          ))}
        </div>

        <div className="dashboard-quickstart card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/ventures/new" className="quick-action btn-primary-solid">
              <span>+</span> List Ventures
            </Link>
            <Link to="/community" className="quick-action btn-outline-gradient">
              <img src={CommunityIcon} alt="Community" style={{width: '20px', height: '20px'}} /> View Communities
            </Link>
            <Link to="/domains" className="quick-action btn-outline-gradient">
              <img src={DomainsIcon} alt="Domains" style={{width: '20px', height: '20px'}} /> Manage Domains
            </Link>
            <Link to="/cocreation" className="quick-action btn-outline-gradient">
              <img src={TechnologyIcon} alt="Technology" style={{width: '20px', height: '20px'}} /> Distribute Softwares
            </Link>
          </div>
        </div>
        <footer className="dashboard-footer">
          <p>CoBrother Dashboard - Built for focused execution.</p>
        </footer>
      </div>
    </AppLayout>
  );
}
