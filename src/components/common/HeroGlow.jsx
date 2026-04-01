import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../locales/translations';

export default function HeroGlow() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <section className="relative py-12 px-8 max-md:py-5 max-md:px-4 border-b-0 overflow-hidden bg-transparent">
      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none animate-[sunGlow_20s_ease-in-out_infinite_alternate]"
        style={{
          background: 'radial-gradient(ellipse 100% 90% at 45% 0%, rgba(147, 51, 234, 0.52) 0%, rgba(147, 51, 234, 0.28) 38%, rgba(147, 51, 234, 0.08) 62%, rgba(255, 255, 255, 0) 80%)'
        }}
      />

      <div className="max-w-[1200px] mx-auto flex flex-col gap-12 max-md:gap-5 relative z-10">
        {/* Main Section */}
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-[2.5rem] max-md:text-[22px] font-bold text-gray-900 m-0 leading-tight">
            CoBrother Free Tier
          </h2>
          <p className="text-lg max-md:text-sm text-gray-700 m-0 leading-relaxed max-w-[600px]">
            Gain free, hands-on experience with CoBrother products and services
          </p>
          <button 
            className="bg-[#232F3E] text-white border-none py-3.5 px-7 rounded-md text-base font-semibold cursor-pointer transition-all duration-200 self-start max-md:self-stretch max-md:text-center font-body hover:bg-white hover:text-gray-900 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
            onClick={() => navigate('/login')}
          >
            Create a Free Account
          </button>
        </div>

        {/* Secondary Section */}
        <div className="flex flex-col gap-4 pt-8 max-md:pt-4 border-t border-purple/15">
          <h3 className="font-display text-[1.75rem] max-md:text-lg font-bold text-gray-900 m-0 leading-snug">
            New customers get up to ₹5000 in credits
          </h3>
          <p className="text-base max-md:text-sm text-gray-600 m-0 leading-[1.7] max-w-[900px]">
            New CoBrother customers can get started at no cost with the CoBrother Free Tier.
            Gain ₹2000 credits at sign-up and up to ₹3000 more to earn as you explore key CoBrother services.
            Test drive CoBrother services with the Free Plan for up to 6 months. You won't be charged unless
            you choose the Paid Plan, which allows you to scale your operations and gain access to over 150 CoBrother services.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes sunGlow {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(90deg); }
        }
      `}</style>
    </section>
  );
}
