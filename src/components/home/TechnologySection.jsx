import { useState, useEffect } from 'react';
import { publicAPI } from '../../api/services';

const STATUS_COLORS = {
  AVAILABLE: { color: '#6ec896', bg: 'rgba(110,200,150,0.1)', border: 'rgba(110,200,150,0.3)' },
  PENDING: { color: '#c8a96e', bg: 'rgba(200,169,110,0.1)', border: 'rgba(200,169,110,0.3)' },
  SOLD: { color: '#c86e6e', bg: 'rgba(200,110,110,0.1)', border: 'rgba(200,110,110,0.3)' },
};

export default function TechnologySection() {
  const [softwares, setSoftwares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSoftwares = async () => {
      try {
        setLoading(true);
        const response = await publicAPI.getSoftwares();
        setSoftwares(response.data || []);
      } catch (error) {
        console.error('Failed to fetch software:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSoftwares();
  }, []);

  const handleCardClick = (softwareId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('redirectAfterLogin', `/cocreation/${softwareId}`);
      window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
    } else {
      window.location.href = `/cocreation/${softwareId}`;
    }
  };

  if (loading) {
    return (
      <section className="bg-white py-10 px-8">
        <div className="max-w-[1200px] mx-auto">
          <h3 className="font-display text-[1.75rem] font-bold text-gray-900 mb-6">
            Technology & Software
          </h3>
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (softwares.length === 0) {
    return (
      <section className="bg-white py-10 px-8">
        <div className="max-w-[1200px] mx-auto">
          <h3 className="font-display text-[1.75rem] font-bold text-gray-900 mb-6">
            Technology & Software
          </h3>
          <p className="text-center text-gray-500 py-12">No software available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-10 px-8">
      <div className="max-w-[1200px] mx-auto">
        <h3 className="font-display text-[1.75rem] font-bold text-gray-900 mb-6">
          Technology & Software
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {softwares.slice(0, 8).map((item) => {
            const s = STATUS_COLORS[item.softwareStatus] || STATUS_COLORS.AVAILABLE;

            return (
              <div
                key={item.id}
                className="card-glow-hover p-5 bg-white border border-gray-200 rounded-[14px] flex flex-col gap-2 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-200"
                onClick={() => handleCardClick(item.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="w-[42px] h-[42px] bg-indigo-50 border border-indigo-200 rounded-[10px] flex items-center justify-center text-xl flex-shrink-0">
                    ⧁
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-[0.72rem] font-semibold text-amber-600 uppercase tracking-wider">
                      {item.category?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.pricingDemand}
                    </span>
                  </div>
                  {item.official && (
                    <div className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[0.68rem] font-bold text-amber-600 flex-shrink-0">
                      ✦ Official
                    </div>
                  )}
                </div>

                <h3 className="font-display text-[1.15rem] font-semibold text-gray-900 leading-tight mt-1">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-2 flex-1">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2.5 py-1 rounded-md text-xs font-semibold"
                    style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                  >
                    {item.softwareStatus}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded">
                    {item.purchaseType}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="font-display text-[1.6rem] font-bold text-green-600 leading-tight">
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span title="Views">👁 {item.views || 0}</span>
                  </div>
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
