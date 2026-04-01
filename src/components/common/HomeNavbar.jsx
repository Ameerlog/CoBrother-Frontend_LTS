import { useState } from 'react';
import { createPortal } from 'react-dom';
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
    <>
    <nav className="w-full bg-white border-b-0 sticky top-0 z-50" ref={navRef}>
      <div className="px-8 h-[70px] flex items-center justify-between max-md:px-3 max-md:h-[64px]">
        {/* Mobile Hamburger Menu */}
        <button 
          className="md:hidden flex items-center justify-center w-10 h-10 border-none cursor-pointer flex-shrink-0"
          style={{ background: 'transparent', color: '#111827' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={26} strokeWidth={2.5} color="#111827" /> : <Menu size={26} strokeWidth={2.5} color="#111827" />}
        </button>

        <div className="flex items-center gap-8 max-md:flex-1 max-md:justify-center max-md:mx-2">
          <div className="flex items-center">
            <img src={coBrotherLogo} alt="CoBrother" className="h-10 w-auto max-md:h-8" />
          </div>
          <div className="flex items-center gap-4 max-md:hidden">
            <div className="relative">
              <button
                className={`flex items-center gap-2 px-4 py-2 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                  openDropdown === 'domains' 
                    ? 'bg-purple-100 text-purple' 
                    : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-purple'
                }`}
                onClick={() => setOpenDropdown(openDropdown === 'domains' ? null : 'domains')}
              >
                {getTranslation(language, 'domains')} <ChevronDown size={14} />
              </button>
              {openDropdown === 'domains' && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-50 overflow-hidden">
                  <button 
                    className="block w-full px-4 py-3 border-none text-left text-sm text-gray-700 bg-transparent cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-purple"
                    onClick={() => { navigate('/domains?type=premium'); setOpenDropdown(null); }}
                  >{getTranslation(language, 'premiumDomains')}</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className={`flex items-center gap-2 px-4 py-2 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                  openDropdown === 'venture' 
                    ? 'bg-purple-100 text-purple' 
                    : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-purple'
                }`}
                onClick={() => setOpenDropdown(openDropdown === 'venture' ? null : 'venture')}
              >
                {getTranslation(language, 'venture')} <ChevronDown size={14} />
              </button>
              {openDropdown === 'venture' && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-50 overflow-hidden">
                  <button 
                    className="block w-full px-4 py-3 border-none text-left text-sm text-gray-700 bg-transparent cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-purple"
                    onClick={() => { navigate('/ventures'); setOpenDropdown(null); }}
                  >{getTranslation(language, 'allVentures')}</button>
                  <button 
                    className="block w-full px-4 py-3 border-none text-left text-sm text-gray-700 bg-transparent cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-purple"
                    onClick={() => { navigate('/ventures/new'); setOpenDropdown(null); }}
                  >{getTranslation(language, 'listVenture')}</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className={`flex items-center gap-2 px-4 py-2 border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                  openDropdown === 'technology' 
                    ? 'bg-purple-100 text-purple' 
                    : 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-purple'
                }`}
                onClick={() => setOpenDropdown(openDropdown === 'technology' ? null : 'technology')}
              >
                {getTranslation(language, 'technology')} <ChevronDown size={14} />
              </button>
              {openDropdown === 'technology' && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-50 overflow-hidden">
                  <button 
                    className="block w-full px-4 py-3 border-none text-left text-sm text-gray-700 bg-transparent cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-purple"
                    onClick={() => { navigate('/cocreation'); setOpenDropdown(null); }}
                  >{getTranslation(language, 'exploreSoftware')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 max-md:gap-1.5 flex-shrink-0">
          <button 
            className="px-5 py-2 bg-transparent border-2 border-purple text-purple rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple hover:text-white md:block hidden"
            onClick={() => navigate('/join-form')}
          >
            {getTranslation(language, 'joinUs')}
          </button>
          <button 
            className="px-5 py-2 bg-purple border-2 border-purple text-white rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_8px_20px_rgba(148,64,221,0.25)] max-md:px-3 max-md:py-1.5 max-md:text-[11px] max-md:whitespace-nowrap"
            onClick={() => navigate('/login')}
          >
            {getTranslation(language, 'signIn')}
          </button>
        </div>
      </div>

    </nav>

      {/* Mobile Slide-out Menu — rendered via portal so it's above everything */}
      {mobileMenuOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div 
            className="fixed top-0 left-0 w-[280px] h-full bg-white shadow-2xl animate-[slideInLeft_0.3s_ease-out]"
            style={{ zIndex: 9999 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 m-0">Menu</h3>
              <button 
                className="bg-transparent border-none cursor-pointer text-gray-600 transition-colors duration-200 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col py-4">
              <button 
                className="w-full px-6 py-4 border-none text-left text-base text-gray-700 bg-transparent cursor-pointer transition-all duration-200 border-l-[3px] border-l-transparent hover:bg-gray-50 hover:text-purple hover:border-l-purple"
                onClick={() => { navigate('/domains'); setMobileMenuOpen(false); }}
              >
                {getTranslation(language, 'domains')}
              </button>
              <button 
                className="w-full px-6 py-4 border-none text-left text-base text-gray-700 bg-transparent cursor-pointer transition-all duration-200 border-l-[3px] border-l-transparent hover:bg-gray-50 hover:text-purple hover:border-l-purple"
                onClick={() => { navigate('/ventures'); setMobileMenuOpen(false); }}
              >
                {getTranslation(language, 'venture')}
              </button>
              <button 
                className="w-full px-6 py-4 border-none text-left text-base text-gray-700 bg-transparent cursor-pointer transition-all duration-200 border-l-[3px] border-l-transparent hover:bg-gray-50 hover:text-purple hover:border-l-purple"
                onClick={() => { navigate('/cocreation'); setMobileMenuOpen(false); }}
              >
                {getTranslation(language, 'technology')}
              </button>
              <button 
                className="w-full px-6 py-4 border-none text-left text-base text-gray-700 bg-transparent cursor-pointer transition-all duration-200 border-l-[3px] border-l-transparent hover:bg-gray-50 hover:text-purple hover:border-l-purple"
                onClick={() => { navigate('/join-form'); setMobileMenuOpen(false); }}
              >
                {getTranslation(language, 'joinUs')}
              </button>
              <button 
                className="w-full px-6 py-4 border-none text-left text-base text-gray-700 bg-transparent cursor-pointer transition-all duration-200 border-l-[3px] border-l-transparent hover:bg-gray-50 hover:text-purple hover:border-l-purple"
                onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}
              >
                Contact Us
              </button>
              <button 
                className="w-full px-6 py-4 border-none text-left text-base text-gray-700 bg-transparent cursor-pointer transition-all duration-200 border-l-[3px] border-l-transparent hover:bg-gray-50 hover:text-purple hover:border-l-purple"
                onClick={() => { navigate('/account'); setMobileMenuOpen(false); }}
              >
                My Account
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
