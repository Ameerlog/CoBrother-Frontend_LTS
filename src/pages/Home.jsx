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
    
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
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
      document.documentElement.style.scrollBehavior = 'auto';
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
    <div className="bg-white">
      <TopNavbar />
      <HomeNavbar
        navRef={navRef}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        navigate={navigate}
      />
      
      <HeroGlow />
      <ExploreSection />

      {/* Feature Cards */}
      <section className="py-20 px-8 bg-gray-50 max-md:py-12 max-md:px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-md:gap-4">
            {features.map((feature, index) => (
              <div key={index} className="p-8 bg-white border border-gray-200 rounded-[20px] shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-purple max-md:p-6">
                <div className="w-16 h-16 flex items-center justify-center text-purple mb-5 max-md:w-14 max-md:h-14 max-md:mb-4">{feature.icon}</div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-3 max-md:text-lg max-md:mb-2">{getTranslation(language, feature.titleKey)}</h3>
                <p className="text-sm text-gray-600 mb-6 flex-1 leading-relaxed max-md:text-xs max-md:mb-4">{getTranslation(language, feature.descKey)}</p>
                <button
                  className="px-6 py-2.5 bg-purple border border-purple text-white rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-dark hover:shadow-lg w-full max-md:py-2 max-md:text-xs active:scale-95"
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
