import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Rocket, Terminal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../locales/translations';
import searchIcon from '../assets/Cobrother_Profile.png';
import communityIcon from '../assets/cobrother_community_profil.png';
import cobrotherProfile from '../assets/Community-profileicon.png';
import TopNavbar from '../components/common/TopNavbar';
import HomeNavbar from '../components/common/HomeNavbar';
import HeroGlow from '../components/common/HeroGlow';
import ExploreSection from '../components/common/ExploreSection';
import HomeFooter from '../components/common/HomeFooter';

export const searchDomainRedirect = (domainQuery, selectedExtension = '.com') => {
  const value = domainQuery.trim().toLowerCase();

  if (!value) {
    throw new Error('Please enter a domain name');
  }

  const fullDomainRegex = /^[a-z0-9-]+(\.(com|in|ai|io))?$/;
  let finalDomain = '';

  if (fullDomainRegex.test(value) && value.includes('.')) {
    finalDomain = value;
  } else {
    const nameRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

    if (!nameRegex.test(value)) {
      throw new Error('Invalid domain name. Use only letters, numbers, and hyphens');
    }

    finalDomain = value + selectedExtension;
  }

  return `https://www.secureserver.net/products/domain-registration/find?plid=600394&domainToCheck=${finalDomain}`;
};

export default function Home() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    // Set body class for Home page styling
    document.body.classList.add('home-page-body');
    
    // Handle scroll to show/hide navbar glow
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 0) {
          navRef.current.classList.add('scrolled');
        } else {
          navRef.current.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      // Clean up body class when component unmounts
      document.body.classList.remove('home-page-body');
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchError(''); // Clear previous errors

    try {
      const url = searchDomainRedirect(searchQuery, '.com');
      window.open(url, '_blank');
      setSearchQuery(''); // Clear search after successful redirect
    } catch (error) {
      setSearchError(error.message);
    }
  };

  
  const features = [
    {
      icon: <Globe size={40} strokeWidth={1.5} />,
      titleKey: 'domainTitle',
      descKey: 'domainDesc',
      link: '/domains'
    },
    {
      icon: <Rocket size={40} strokeWidth={1.5} />,
      titleKey: 'ventureTitle',
      descKey: 'ventureDesc',
      link: '/ventures'
    },
    {
      icon: <Terminal size={40} strokeWidth={1.5} />,
      titleKey: 'technologyTitle',
      descKey: 'technologyDesc',
      link: '/cocreation'
    },
    {
      icon: <img src={cobrotherProfile} alt="Community" className="community-profile-icon" />,
      titleKey: 'communityTitle',
      descKey: 'communityDesc',
      link: '/community'
    }
  ];

  return (
    <div className="home-page">
      <TopNavbar />
      <HomeNavbar
        navRef={navRef}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        navigate={navigate}
      />
      
      <HeroGlow />
      <ExploreSection />

      {/* Hero Section */}
      {/* <section className="home-hero">
      </section> */}

      {/* Feature Cards */}
      <section className="home-features">
        <div className="home-features-container">
          <div className="home-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="home-feature-card">
                <div className="home-feature-icon">{feature.icon}</div>
                <h3 className="home-feature-title">{getTranslation(language, feature.titleKey)}</h3>
                <p className="home-feature-description">{getTranslation(language, feature.descKey)}</p>
                <button
                  className="home-feature-btn"
                  onClick={() => navigate(feature.link)}
                >
                  {getTranslation(language, 'exploreBtn')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
