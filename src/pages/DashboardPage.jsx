import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

export default function DashboardPage() {
  const { user } = useAuth();

  const cards = [
    {
      icon: '◈',
      title: 'My Ventures',
      desc: 'List, manage and attract co-venturers for your ventures.',
      to: '/ventures',
      cta: 'Manage Ventures',
      accent: '#c8a96e',
    },
    {
      icon: '◉',
      title: 'Community',
      desc: 'Connect with founders, investors, and operators.',
      to: '/community',
      cta: 'Explore Community',
      accent: '#6e9ec8',
    },
  ];

  return (
    <AppLayout>
      <div className="dashboard-page">
        <div className="dashboard-hero">
          <div className="dashboard-greeting">
            <span className="greeting-badge">Welcome back</span>
            <h1>
              Hello, {user?.firstname || user?.email?.split('@')[0]} 
              <span className="wave">👋</span>
            </h1>
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
        </div>

        <div className="dashboard-cards">
          {cards.map((c) => (
            <div key={c.to} className="dash-card" style={{ '--accent': c.accent }}>
              <div className="dash-card-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <Link to={c.to} className="dash-card-cta">{c.cta} →</Link>
            </div>
          ))}
        </div>

        <div className="dashboard-quickstart">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/ventures/new" className="quick-action">
              <span>+</span> List a Venture
            </Link>
            <Link to="/community" className="quick-action">
              <span>◉</span> View Community
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
