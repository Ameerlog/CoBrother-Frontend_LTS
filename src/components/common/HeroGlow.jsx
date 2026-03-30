import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../locales/translations';
import '../../styles/HeroGlow.css';

export default function HeroGlow() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <section className="promo-banner">
      <div className="promo-banner-container">
        {/* Main Section */}
        <div className="promo-main">
          <h2 className="promo-title">CoBrother Free Tier</h2>
          <p className="promo-subtitle">
            Gain free, hands-on experience with CoBrother products and services
          </p>
          <button className="promo-btn" onClick={() => navigate('/login')}>
            Create a Free Account
          </button>
        </div>

        {/* Secondary Section */}
        <div className="promo-secondary">
          <h3 className="promo-secondary-title">New customers get up to ₹5000 in credits</h3>
          <p className="promo-secondary-text">
            New CoBrother customers can get started at no cost with the CoBrother Free Tier.
            Gain ₹2000 credits at sign-up and up to ₹3000 more to earn as you explore key CoBrother services.
            Test drive CoBrother services with the Free Plan for up to 6 months. You won't be charged unless
            you choose the Paid Plan, which allows you to scale your operations and gain access to over 150 CoBrother services.
          </p>
        </div>
      </div>
    </section>
  );
}
