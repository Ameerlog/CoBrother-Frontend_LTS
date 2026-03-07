import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { analyticsAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const COLORS = ['#c8a96e','#6e9ec8','#6ec896','#c86e6e','#9b6ec8','#c8b06e'];

const StatCard = ({ label, value, sub, color = '#c8a96e' }) => (
  <div style={{
    padding: '1.5rem', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
    display: 'flex', flexDirection: 'column', gap: '0.35rem'
  }}>
    <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: '2rem', fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.8rem', color: '#666' }}>{sub}</div>}
  </div>
);

const ChartCard = ({ title, children }) => (
  <div style={{
    padding: '1.5rem', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
  }}>
    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c0c0d0', marginBottom: '1.25rem' }}>{title}</div>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.82rem' }}>
      <div style={{ color: '#888', marginBottom: '0.25rem' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#c8a96e' }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

export default function VentureAnalyticsPage() {
  const navigate = useNavigate();
  const [ventures, setVentures]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    analyticsAPI.getMyVentures()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setVentures(list);
        if (list.length > 0) setSelected(list[0].id);
      })
      .catch(() => setError('Failed to load ventures.'))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true); setError('');
    analyticsAPI.getVentureAnalytics(selected)
      .then(({ data }) => setAnalytics(data))
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, [selected]);

  const viewsData = analytics
    ? Object.entries(analytics.viewsByDay).map(([date, count]) => ({ date, Views: count }))
    : [];

  const industryData = analytics
    ? Object.entries(analytics.byIndustry).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    : [];

  const roleData = analytics
    ? Object.entries(analytics.byRole).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    : [];

  const skillsData = analytics
    ? Object.entries(analytics.applicantSkills)
        .sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([name, value]) => ({ name, value }))
    : [];

  const statusData = analytics
    ? Object.entries(analytics.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100 }}>
        <div className="page-header">
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem' }}>Venture Analytics</h1>
            <p style={{ color: '#8a8099', marginTop: '0.3rem' }}>Track performance and applicant insights for your ventures.</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/ventures')}>← Back</button>
        </div>

        {/* Venture selector */}
        {!fetching && ventures.length > 0 && (
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {ventures.map(v => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                style={{
                  padding: '0.5rem 1.1rem', borderRadius: 8, fontSize: '0.875rem',
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                  background: selected === v.id ? '#c8a96e' : 'rgba(255,255,255,0.04)',
                  color: selected === v.id ? '#0a0a0f' : '#a0a0b0',
                  border: selected === v.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {v.brandDetails?.brandName || `Venture #${v.id}`}
              </button>
            ))}
          </div>
        )}

        {fetching || loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : !analytics ? null : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <StatCard label="Total Views" value={analytics.totalViews} sub="All time" />
              <StatCard label="Applications" value={analytics.totalApplications} sub="All time" color="#6ec896" />
              <StatCard label="Conversion Rate" value={`${analytics.conversionRate}%`} sub="Views → Applications" color="#6e9ec8" />
              <StatCard label="Avg Time to Apply" value={`${analytics.avgHoursToApply}h`} sub="After first view" color="#c86e6e" />
            </div>

            {/* Views over time */}
            <ChartCard title="👁 Views Over Last 30 Days">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }}
                    tickFormatter={v => v.split(' ')[1] ? v : v} interval={4} />
                  <YAxis tick={{ fill: '#666', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Views" stroke="#c8a96e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Two column: industry + role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <ChartCard title="🏭 Viewer Industries">
                {industryData.length === 0 ? (
                  <div style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={industryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {industryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="👤 Viewer Roles">
                {roleData.length === 0 ? (
                  <div style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={roleData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#a0a0b0', fontSize: 11 }} width={90} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#6e9ec8" radius={[0, 4, 4, 0]} name="Viewers" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Applicant skills */}
            <ChartCard title="🛠 Top Applicant Skills">
              {skillsData.length === 0 ? (
                <div style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No applicants yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={skillsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#a0a0b0', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#666', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Applicants" radius={[4, 4, 0, 0]}>
                      {skillsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Application status */}
            <ChartCard title="📋 Application Status Breakdown">
              {statusData.length === 0 ? (
                <div style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No applications yet</div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {statusData.map((s, i) => {
                    const meta = { PENDING: { color: '#c8a96e', bg: 'rgba(200,169,110,0.12)' }, APPROVED: { color: '#6ec896', bg: 'rgba(110,200,150,0.12)' }, REJECTED: { color: '#c86e6e', bg: 'rgba(200,110,110,0.12)' } };
                    const m = meta[s.name] || { color: '#c8a96e', bg: 'rgba(200,169,110,0.12)' };
                    return (
                      <div key={i} style={{ padding: '1rem 1.5rem', background: m.bg, borderRadius: 10, minWidth: 120, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{s.value}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{s.name}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ChartCard>

          </div>
        )}

        {!fetching && ventures.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No ventures listed yet</h3>
            <p>List a venture to start tracking analytics.</p>
            <button className="btn-primary" onClick={() => navigate('/ventures/new')}>List a Venture</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}