import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { analyticsAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const COLORS = ['#c8a96e','#6e9ec8','#6ec896','#c86e6e','#9b6ec8','#c8b06e'];

const StatCard = ({ label, value, sub, color = '#c8a96e' }) => (
  <div style={{
    padding: '1.5rem', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
  }}>
    <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: '2rem', fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', marginTop: '0.35rem' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>{sub}</div>}
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

export default function ProfileAnalyticsPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    analyticsAPI.getProfileAnalytics()
      .then(({ data }) => setAnalytics(data))
      .catch(() => setError('No community profile found. Connect LinkedIn first.'))
      .finally(() => setLoading(false));
  }, []);

  const viewsData = analytics
    ? Object.entries(analytics.viewsByDay).map(([date, count]) => ({ date, Views: count }))
    : [];

  const industryData = analytics
    ? Object.entries(analytics.byIndustry).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    : [];

  const roleData = analytics
    ? Object.entries(analytics.byRole).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    : [];

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100 }}>
        <div className="page-header">
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem' }}>Profile Analytics</h1>
            <p style={{ color: '#8a8099', marginTop: '0.3rem' }}>See who's viewing your community profile.</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/community')}>← Back</button>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : !analytics ? null : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <StatCard label="Total Profile Views" value={analytics.totalViews/2} sub="All time" />
              <StatCard label="Views This Week" value={analytics.viewsThisWeek/2} sub="Last 7 days" color="#6ec896" />
            </div>

            {/* Views over time */}
            <ChartCard title="👁 Profile Views Over Last 30 Days">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} interval={4} />
                  <YAxis tick={{ fill: '#666', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Views" stroke="#c8a96e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Industry + Role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <ChartCard title="🏭 Viewer Industries">
                {industryData.length === 0 ? (
                  <div style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No data yet — get more profile views!</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={industryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
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

          </div>
        )}
      </div>
    </AppLayout>
  );
}