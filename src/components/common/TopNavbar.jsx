import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../locales/translations';
import cobrotherProfile from '../../assets/Community-profileicon.png';
import '../../styles/TopNavbar.css';

export default function TopNavbar() {
  const [languageOpen, setLanguageOpen] = useState(false);
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'kn', name: 'ಕನ್ನಡ' }
  ];

  const handleLanguageSelect = (lang) => {
    changeLanguage(lang.code);
    setLanguageOpen(false);
  };

  const currentLanguageName = languages.find(l => l.code === language)?.name || 'English';

  return (
    <div className="top-navbar">
      <div className="top-navbar-container">
        <div className="top-navbar-right">
          {/* Language Selector */}
          <div className="top-nav-item language-selector">
            <button 
              className="top-nav-link"
              onClick={() => setLanguageOpen(!languageOpen)}
            >
              {currentLanguageName} <ChevronDown size={14} />
            </button>
            {languageOpen && (
              <div className="language-dropdown">
                {languages.map((lang) => (
                  <button 
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang)}
                    className={language === lang.code ? 'active' : ''}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contact Us */}
          <div className="top-nav-item">
            <a href="/contact" className="top-nav-link">{getTranslation(language, 'contactUs')}</a>
          </div>

          {/* My Account */}
          <div className="top-nav-item">
            <a href="/account" className="top-nav-link">{getTranslation(language, 'myAccount')}</a>
          </div>

          {/* Profile Icon */}
          <div className="top-nav-item profile-icon-wrapper">
            <a href="/profile" className="profile-icon">
              <img src={cobrotherProfile} alt="Profile" className="profile-icon-img" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
