import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { feedbackAPI } from '../../api/services';
import DomainsSection from '../home/DomainsSection';
import VenturesSection from '../home/VenturesSection';
import TechnologySection from '../home/TechnologySection';

export default function ExploreSection() {
  const [feedbackType, setFeedbackType] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackTypeClick = (type) => {
    setFeedbackType(type);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim()) {
      alert('Please enter your feedback message.');
      return;
    }
    try {
      setFeedbackSubmitting(true);
      const response = await feedbackAPI.submit({
        feedbackType,
        message: feedbackMessage,
        pageUrl: window.location.href,
      });
      
      if (response.data && response.data.status === 'success') {
        setFeedbackSubmitted(true);
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


  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          DOMAINS SECTION (Separate Component)
      ═══════════════════════════════════════════════════════════════════ */}
      <DomainsSection />

      {/* ═══════════════════════════════════════════════════════════════════
          VENTURES SECTION (Separate Component)
      ═══════════════════════════════════════════════════════════════════ */}
      <VenturesSection />

      {/* ═══════════════════════════════════════════════════════════════════
          TECHNOLOGY SECTION (Separate Component)
      ═══════════════════════════════════════════════════════════════════ */}
      <TechnologySection />

      {/* ═══════════════════════════════════════════════════════════════════
          FEEDBACK WIDGET
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-10 px-8">
        <div className="max-w-[1200px] mx-auto p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-900 mb-1">Did you find what you were looking for today?</p>
            <p className="text-sm text-gray-600">Let us know so we can improve the quality of the content on our pages.</p>
          </div>
          <div className="flex items-center gap-3">
            {!feedbackSubmitted ? (
              !feedbackType ? (
                <>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 cursor-pointer transition-all duration-200 hover:border-purple hover:bg-purple-50 hover:text-purple"
                    onClick={() => handleFeedbackTypeClick('like')}
                  >
                    Yes <ThumbsUp size={15} />
                  </button>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 cursor-pointer transition-all duration-200 hover:border-purple hover:bg-purple-50 hover:text-purple"
                    onClick={() => handleFeedbackTypeClick('dislike')}
                  >
                    No <ThumbsDown size={15} />
                  </button>
                </>
              ) : null
            ) : (
              <p className="text-sm font-medium text-purple">
                {feedbackType === 'like' ? '🎉 Thanks for the positive feedback!' : '🙏 Thanks! We\'ll work to improve.'}
              </p>
            )}
          </div>
        </div>
        {feedbackType && !feedbackSubmitted && (
          <div className="mt-4">
            <textarea
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-purple focus:shadow-[0_0_0_3px_rgba(147,51,234,0.1)] resize-none"
              placeholder="Tell us more about your experience..."
              rows="2"
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
            />
            <div className="flex gap-3 mt-3">
              <button
                className="px-5 py-2.5 bg-purple text-white rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleFeedbackSubmit}
                disabled={feedbackSubmitting}
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-50"
                onClick={() => { setFeedbackType(null); setFeedbackMessage(''); }}
                disabled={feedbackSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        </div>
      </section>
    </>
  );
}
