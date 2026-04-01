import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../locales/translations';
import cobrotherProfile from '../../assets/Community-profileicon.png';

export default function TopNavbar() {
  const [languageOpen, setLanguageOpen] = useState(false);
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'kn', name: 'ಕನ्नడ' }
  ];

  const handleLanguageSelect = (lang) => {
    changeLanguage(lang.code);
    setLanguageOpen(false);
  };

  const currentLanguageName = languages.find(l => l.code === language)?.name || 'English';

  return (
    <div className="relative w-full h-[45px] z-[1000] border-b border-purple/[0.18] font-body" 
         style={{ background: 'linear-gradient(90deg, #0e0b1e 0%, #130d28 60%, #0f1225 100%)' }}>
      <div className="max-w-[1400px] mx-auto px-8 h-full flex items-center justify-end">
        <div className="flex items-center gap-5">
          {/* Language Selector */}
          <div className="relative">
            <button 
              className="text-white text-sm font-normal no-underline flex items-center gap-1 px-3 py-2 rounded transition-colors duration-200 cursor-pointer bg-transparent border-none font-body hover:bg-purple/15 hover:text-purple-light"
              onClick={() => setLanguageOpen(!languageOpen)}
            >
              {currentLanguageName} <ChevronDown size={14} />
            </button>
            {languageOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px] overflow-hidden z-[1001]">
                {languages.map((lang) => (
                  <button 
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang)}
                    className={`w-full px-4 py-2.5 bg-transparent border-none text-left text-sm cursor-pointer transition-colors duration-200 font-body ${
                      language === lang.code 
                        ? 'bg-purple-50 text-purple font-semibold' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contact Us */}
          <div className="relative md:block hidden">
            <a href="/contact" className="text-white text-sm font-normal no-underline flex items-center gap-1 px-3 py-2 rounded transition-colors duration-200 cursor-pointer bg-transparent border-none font-body hover:bg-purple/15 hover:text-purple-light">
              {getTranslation(language, 'contactUs')}
            </a>
          </div>

          {/* My Account */}
          <div className="relative md:block hidden">
            <a href="/account" className="text-white text-sm font-normal no-underline flex items-center gap-1 px-3 py-2 rounded transition-colors duration-200 cursor-pointer bg-transparent border-none font-body hover:bg-purple/15 hover:text-purple-light">
              {getTranslation(language, 'myAccount')}
            </a>
          </div>

          {/* Profile Icon */}
          <div className="relative ml-2">
            <a href="/profile" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer relative transition-all duration-300 no-underline hover:bg-white/20 hover:scale-105">
              <img src={cobrotherProfile} alt="Profile" className="w-6 h-6 object-contain" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .h-\[45px\] {
            height: 40px;
            position: sticky;
            top: 0;
            z-index: 101;
          }
          .px-8 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .gap-5 {
            gap: 8px;
          }
          .text-sm {
            font-size: 0.75rem;
          }
          .px-3 {
            padding-left: 8px;
            padding-right: 8px;
          }
          .py-2 {
            padding-top: 4px;
            padding-bottom: 4px;
          }
          .w-9 {
            width: 28px;
          }
          .h-9 {
            height: 28px;
          }
          .min-w-\[140px\] {
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  );
}
