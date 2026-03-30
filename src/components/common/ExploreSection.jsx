import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import '../../styles/ExploreSection.css';
import { searchDomainRedirect } from '../../pages/Home';
import { feedbackAPI } from '../../api/services';

export default function ExploreSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(9);
  const [feedback, setFeedback] = useState(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    setVisibleCount(9);
    setSearchError(''); // Clear error when search query changes
  }, [searchQuery, activeFilter]);

  const handleSearchRedirect = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      setSearchError('');
      
      try {
        const url = searchDomainRedirect(searchQuery, '.com');
        window.open(url, '_blank');
      } catch (error) {
        setSearchError(error.message);
      }
    }
  };

  const handleFeedbackSubmit = async (feedbackType) => {
    try {
      setFeedbackSubmitting(true);
      const response = await feedbackAPI.submit(feedbackType);
      
      if (response.data && response.data.status === 'success') {
        setFeedback(feedbackType);
      } else {
        alert('Failed to send feedback. Please try again.');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Something went wrong. Please try again later.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const filterOptions = [
    { key: 'all', label: 'All Domains' },
    { key: 'short', label: 'Short Names' },
    { key: 'brandable', label: 'Brandable' },
    { key: 'tech', label: 'Tech' },
  ];

  const allDomains = [
    { id: 1,  ext: '.com',  name: 'mybrand.com',      category: 'brandable', tag: 'Premium Domain', desc: 'Your perfect brand identity online.',            price: '₹999/yr'   },
    { id: 2,  ext: '.in',   name: 'startup.in',        category: 'short',     tag: 'Popular Choice', desc: 'Ideal for Indian startups and businesses.',     price: '₹599/yr'   },
    { id: 3,  ext: '.io',   name: 'techventure.io',    category: 'tech',      tag: 'Tech Favourite', desc: 'For the next big tech product or SaaS.',        price: '₹1,499/yr' },
    { id: 4,  ext: '.co',   name: 'shopnow.co',        category: 'brandable', tag: 'Premium Domain', desc: 'Launch your e-commerce store today.',           price: '₹799/yr'   },
    { id: 5,  ext: '.net',  name: 'creatives.net',     category: 'brandable', tag: 'Available',      desc: 'Built for creative professionals worldwide.',   price: '₹699/yr'   },
    { id: 6,  ext: '.in',   name: 'localstore.in',     category: 'short',     tag: 'Popular Choice', desc: 'Connect with your local customers easily.',     price: '₹499/yr'   },
    { id: 7,  ext: '.app',  name: 'appname.app',       category: 'tech',      tag: 'Tech Favourite', desc: 'Perfect for mobile apps and digital products.', price: '₹1,299/yr' },
    { id: 8,  ext: '.co',   name: 'freelancer.co',     category: 'short',     tag: 'Available',      desc: 'Your professional portfolio and services.',     price: '₹899/yr'   },
    { id: 9,  ext: '.org',  name: 'newbiz.org',        category: 'brandable', tag: 'Available',      desc: 'Establish your organisation or non-profit.',    price: '₹599/yr'   },
    { id: 10, ext: '.info', name: 'yourbrand.info',    category: 'short',     tag: 'Budget Pick',    desc: 'Share your story and information online.',      price: '₹399/yr'   },
  ];

  const filteredDomains = allDomains.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || d.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <section className="explore-section">
      <div className="explore-container">
        {/* Title */}
        <h3 className="explore-title">
          Explore premium domain names starting from <span>₹999</span>
        </h3>

        {/* Filter + Search */}
        <div className="explore-search-row">
          {/* Filter */}
          <div className="explore-filter-wrapper">
            <button
              className={`explore-filter-btn ${filterOpen ? 'active' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <SlidersHorizontal size={15} />
              Filter
              {activeFilter !== 'all' && (
                <span className="explore-filter-badge">1</span>
              )}
            </button>

            {filterOpen && (
              <div className="explore-filter-dropdown">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.key}
                    className={`explore-filter-option ${activeFilter === opt.key ? 'active' : ''}`}
                    onClick={() => { setActiveFilter(opt.key); setFilterOpen(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="explore-search-bar">
            <Search size={16} className="explore-search-icon" />
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search domain names (Press Enter to check availability)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchRedirect}
            />
            {searchQuery && (
              <button className="explore-search-clear" onClick={() => { setSearchQuery(''); setSearchError(''); }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {searchError && (
          <div className="explore-search-error">
            {searchError}
          </div>
        )}

        {/* Count */}
        <p className="explore-count">
          Displaying 1–{Math.min(visibleCount, filteredDomains.length)} ({filteredDomains.length})
        </p>

        {/* Cards Grid */}
        <div className="explore-cards-grid">
          {filteredDomains.slice(0, visibleCount).map((domain) => (
            <div key={domain.id} className="explore-card">
              <div className="explore-card-top">
                <span className="explore-card-ext">{domain.ext}</span>
                <span className="explore-card-tag">◇ {domain.tag}</span>
              </div>
              <h4 className="explore-card-name">{domain.name}</h4>
              <p className="explore-card-desc">{domain.desc}</p>
              <div className="explore-card-footer">
                <span className="explore-card-price">{domain.price}</span>
                <div className="explore-card-actions">
                  <button className="explore-card-arrow">Learn more →</button>
                  <button className="explore-card-plus">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDomains.length === 0 && (
          <p className="explore-empty">No domains match your search.</p>
        )}

        {/* Show More */}
        {visibleCount < filteredDomains.length && (
          <div className="explore-show-more">
            <button
              className="explore-show-more-btn"
              onClick={() => setVisibleCount((prev) => prev + 9)}
            >
              Show more ({filteredDomains.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Feedback Widget */}
      <div className="explore-feedback">
        <div className="explore-feedback-inner">
          <div className="explore-feedback-text">
            <p className="explore-feedback-question">Did you find what you were looking for today?</p>
            <p className="explore-feedback-sub">Let us know so we can improve the quality of the content on our pages.</p>
          </div>
          <div className="explore-feedback-actions">
            {feedback === null ? (
              <>
                <button
                  className="explore-feedback-btn"
                  onClick={() => handleFeedbackSubmit('like')}
                  disabled={feedbackSubmitting}
                >
                  Yes <ThumbsUp size={15} />
                </button>
                <button
                  className="explore-feedback-btn"
                  onClick={() => handleFeedbackSubmit('dislike')}
                  disabled={feedbackSubmitting}
                >
                  No <ThumbsDown size={15} />
                </button>
              </>
            ) : (
              <p className="explore-feedback-thanks">
                {feedback === 'like' ? '🎉 Thanks for the positive feedback!' : '🙏 Thanks! We\'ll work to improve.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
