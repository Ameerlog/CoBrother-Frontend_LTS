import { useState, useEffect } from 'react';
import { publicAPI } from '../../api/services';

export default function DomainsSection() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        const response = await publicAPI.getDomains();
        const allDomains = response.data || [];
        // Only show AVAILABLE domains on homepage
        const availableDomains = allDomains.filter(d => d.domainStatus === 'AVAILABLE');
        setDomains(availableDomains);
      } catch (error) {
        console.error('Failed to fetch domains:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDomains();
  }, []);

  const handleCardClick = (domainId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('redirectAfterLogin', `/domains/${domainId}`);
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
    } else {
      window.location.href = `/domains/${domainId}`;
    }
  };

  if (loading) {
    return (
      <section className="bg-white py-10 px-8">
        <div className="max-w-[1200px] mx-auto">
          <h3 className="font-display text-[1.75rem] font-bold text-gray-900 mb-6">
            Premium Domains
          </h3>
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (domains.length === 0) {
    return (
      <section className="bg-white py-10 px-8">
        <div className="max-w-[1200px] mx-auto">
          <h3 className="font-display text-[1.75rem] font-bold text-gray-900 mb-6">
            Premium Domains
          </h3>
          <p className="text-center text-gray-500 py-12">No domains available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-10 px-8">
      <div className="max-w-[1200px] mx-auto">
        <h3 className="font-display text-[1.75rem] font-bold text-gray-900 mb-6">
          Premium Domains
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {domains.slice(0, 8).map((domain) => {
            const isAuction = domain.saleType === 'AUCTION';
            const domainInitials = (domain.domainName || '')
              .replace(/[^a-zA-Z0-9]/g, '')
              .slice(0, 2)
              .toUpperCase() || '?';

            return (
              <div
                key={domain.id}
                className="card-glow-hover p-5 bg-white border border-gray-200 rounded-[14px] flex flex-col gap-3 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-indigo-200"
                onClick={() => handleCardClick(domain.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-1">
                    <div className={`w-[42px] h-[42px] border rounded-[10px] flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                      isAuction 
                        ? 'bg-purple-50 border-purple-200 text-purple-500' 
                        : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    }`}>
                      {domainInitials}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <h3 className="font-display text-[1.05rem] font-bold text-gray-900 mb-0.5">
                        {domain.domainName}{domain.domainExtension}
                      </h3>
                      <span className="text-xs text-gray-500 truncate">{domain.pricingDemand}</span>
                    </div>
                  </div>

                  <div className="my-2 flex items-center gap-1.5 flex-wrap">
                    {domain.domainStatus && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                        {domain.domainStatus}
                      </span>
                    )}
                    {domain.verified && (
                      <span className="px-2.5 py-1 rounded-md text-[0.72rem] font-bold text-green-500 bg-green-50 border border-green-300">
                        ✓ Verified
                      </span>
                    )}
                    {domain.askingPrice >= 500000 && (
                      <span className="px-2 py-0.5 rounded text-[0.68rem] font-bold text-purple-600 bg-purple-50 border border-purple-200">
                        Premium
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="text-[0.65rem] text-gray-500">Asking Price</div>
                    <div className="font-display text-[1.85rem] font-bold text-indigo-600 leading-tight tracking-[-0.01em]">
                      ₹{Number(domain.askingPrice).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{domain.domainExtension}</span>
                  <button className="px-3 py-1.5 bg-white border-2 border-indigo-400 text-indigo-600 rounded-lg text-xs font-semibold transition-all duration-200 hover:bg-indigo-50">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
