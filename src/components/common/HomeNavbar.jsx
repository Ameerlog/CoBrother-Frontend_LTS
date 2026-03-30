import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../locales/translations';
import coBrotherLogo from '../../assets/Cobrother_logo.png';

export default function HomeNavbar({
  navRef,
  openDropdown,
  setOpenDropdown,
  navigate,
}) {
  const { language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="home-navbar" ref={navRef}>
      <div className="home-navbar-container">
        {/* Mobile Hamburger Menu */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="home-navbar-left">
          <div className="home-navbar-logo">
            <img src={coBrotherLogo} alt="CoBrother" className="home-logo-img" />
          </div>
          <div className="home-nav-links">
            <div className="home-nav-dropdown">
              <button
                className={`home-nav-link ${openDropdown === 'domains' ? 'active' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'domains' ? null : 'domains')}
              >
                {getTranslation(language, 'domains')} <ChevronDown size={14} />
              </button>
              {openDropdown === 'domains' && (
                <div className="home-dropdown-menu">
                  <button onClick={() => { navigate('/domains?type=premium'); setOpenDropdown(null); }}>{getTranslation(language, 'premiumDomains')}</button>
                </div>
              )}
            </div>

            <div className="home-nav-dropdown">
              <button
                className={`home-nav-link ${openDropdown === 'venture' ? 'active' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'venture' ? null : 'venture')}
              >
                {getTranslation(language, 'venture')} <ChevronDown size={14} />
              </button>
              {openDropdown === 'venture' && (
                <div className="home-dropdown-menu">
                  <button onClick={() => { navigate('/ventures'); setOpenDropdown(null); }}>{getTranslation(language, 'allVentures')}</button>
                  <button onClick={() => { navigate('/ventures/new'); setOpenDropdown(null); }}>{getTranslation(language, 'listVenture')}</button>
                </div>
              )}
            </div>

            <div className="home-nav-dropdown">
              <button
                className={`home-nav-link ${openDropdown === 'technology' ? 'active' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'technology' ? null : 'technology')}
              >
                {getTranslation(language, 'technology')} <ChevronDown size={14} />
              </button>
              {openDropdown === 'technology' && (
                <div className="home-dropdown-menu">
                  <button onClick={() => { navigate('/cocreation'); setOpenDropdown(null); }}>{getTranslation(language, 'exploreSoftware')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="home-navbar-actions">
          <button className="home-join-btn" onClick={() => navigate('/join-form')}>
            {getTranslation(language, 'joinUs')}
          </button>
          <button className="home-signin-btn" onClick={() => navigate('/login')}>
            {getTranslation(language, 'signIn')}
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="mobile-menu-overlay" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="mobile-menu-drawer">
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="mobile-menu-links">
              <button onClick={() => { navigate('/domains'); setMobileMenuOpen(false); }}>
                {getTranslation(language, 'domains')}
              </button>
              <button onClick={() => { navigate('/ventures'); setMobileMenuOpen(false); }}>
                {getTranslation(language, 'venture')}
              </button>
              <button onClick={() => { navigate('/cocreation'); setMobileMenuOpen(false); }}>
                {getTranslation(language, 'technology')}
              </button>
              <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}>
                Contact Us
              </button>
              <button onClick={() => { navigate('/account'); setMobileMenuOpen(false); }}>
                My Account
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
