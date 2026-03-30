import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Rocket, Terminal, Users } from 'lucide-react';
import coBrotherLogo from '../assets/Cobrother_logo.png';
import searchIcon from '../assets/Cobrother_Profile.png';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/domains?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    {
      icon: <Globe size={40} strokeWidth={1.5} />,
      title: 'Explore Domain',
      description: 'Find the perfect identity for your next big tech project',
      link: '/domains'
    },
    {
      icon: <Rocket size={40} strokeWidth={1.5} />,
      title: 'Explore Venture',
      description: 'Discover innovative ventures and investment opportunities',
      link: '/ventures'
    },
    {
      icon: <Terminal size={40} strokeWidth={1.5} />,
      title: 'Explore Technology',
      description: 'Access cutting-edge software development tools and resources',
      link: '/cocreation'
    },
    {
      icon: <Users size={40} strokeWidth={1.5} />,
      title: 'Explore Community',
      description: 'Connect with talented developers and creative professionals',
      link: '/community'
    }
  ];

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-navbar">
        <div className="home-navbar-container">
          <div className="home-navbar-logo">
            <img src={coBrotherLogo} alt="CoBrother" className="home-logo-img" />
          </div>
          <button className="home-signin-btn" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-container">
          <h1 className="home-hero-title">Let's Begin With Your Brand Name</h1>
          
          <form className="home-search-bar" onSubmit={handleSearch}>
            <img src={searchIcon} alt="Search" className="home-search-icon" />
            <input
              type="text"
              className="home-search-input"
              placeholder="Search your domain name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="home-search-btn">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="home-features">
        <div className="home-features-container">
          <div className="home-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="home-feature-card">
                <div className="home-feature-icon">{feature.icon}</div>
                <h3 className="home-feature-title">{feature.title}</h3>
                <p className="home-feature-description">{feature.description}</p>
                <button
                  className="home-feature-btn"
                  onClick={() => navigate(feature.link)}
                >
                  Explore →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-container">
          <p className="home-footer-text">
            © 2026 CoBrother™ Aultum International. All rights reserved.
            <br />
            Made with ❤️ in India.
          </p>
          <p className="home-footer-contact">
            Email: <a href="mailto:cobrother.com@gmail.com">cobrother.com@gmail.com</a> | Phone: 080 8575 8575
          </p>
        </div>
      </footer>
    </div>
  );
}
