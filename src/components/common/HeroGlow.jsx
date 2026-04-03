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
<<<<<<< HEAD
            Don't Just Start, Dissrupt.
          </h2>
          <p className="text-xl max-md:text-sm text-gray-700 m-0 leading-relaxed max-w-[600px]">
            Discover A Brand Name And Get Ventured In Auctions with CoBrother Community
=======
           Don't Just Start, Dissrupt. 
          </h2>
          <p className="text-xl max-md:text-sm text-gray-700 m-0 leading-relaxed max-w-[600px]">
            Discover A Brand Name And Get Ventured In Auctions with CoBrother Community 
>>>>>>> ccb880983aa72dbe35b4783830b4f1f3fc9b3d23
          </p>
          <button
            className="bg-white text-[#232F3E] border-2 border-[#232F3E] py-3.5 px-7 rounded-full text-base font-semibold cursor-pointer transition-all duration-200 self-start max-md:self-stretch max-md:text-center font-body hover:bg-[#232F3E] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
            onClick={() => navigate('/login')}
          >
            Create a Free Account
          </button>
        </div>

        {/* Secondary Section */}
        <div className="flex flex-col gap-4 pt-8 max-md:pt-4 border-t border-purple/15">
          <h3 className="font-display text-[1.75rem] max-md:text-lg font-bold text-gray-900 m-0 leading-snug">
            Buy sell and Auction premium domains
          </h3>
          <p className="text-base max-md:text-sm text-gray-600 m-0 leading-[1.7] max-w-[900px]">
            Join CoBrother's premium domain marketplace where you can buy, sell, and auction high-value domains.
            Get access to exclusive premium domains with competitive bidding and secure transactions.
            Start trading today and expand your digital portfolio with CoBrother's trusted platform.
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