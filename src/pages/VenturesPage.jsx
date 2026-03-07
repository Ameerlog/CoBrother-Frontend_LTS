import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ventureAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import CoVentureModal from '../components/venture/CoVentureModal';

const TYPE_LABELS = {
  FIFTY_FIFTY: '50:50', SIXTY_FORTY: '60:40', SEVENTY_THIRTY: '70:30',
  EIGHTY_TWENTY: '80:20', NINETY_TEN: '90:10', NEGOTIABLE: 'Negotiable',
};

export default function VenturesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyTarget, setApplyTarget] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'mine'

  useEffect(() => {
    setLoading(true);
    const req = filter === 'mine' ? ventureAPI.getMyVentures() : ventureAPI.getAll();
    req
      .then(({ data }) => setVentures(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => setVentures([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this venture? This cannot be undone.')) return;
    try {
      await ventureAPI.delete(id);
      setVentures(v => v.filter(x => x.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    }
  };

  return (
    <AppLayout>
      <div className="ventures-page">
      <div className="page-header">
      <div>
        <h1>Ventures</h1>
        <p>Discover and co-venture on exciting opportunities.</p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/ventures/dashboard')}>
          📊 Dashboard
        </button>
        <Link to="/ventures/new" className="btn-primary">+ List Venture</Link>
      </div>
    </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >All Ventures</button>
          <button
            className={`filter-tab ${filter === 'mine' ? 'active' : ''}`}
            onClick={() => setFilter('mine')}
          >My Ventures</button>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : ventures.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <h3>{filter === 'mine' ? "You haven't listed any ventures yet" : 'No ventures listed yet'}</h3>
            <p>Be the first to list a venture and attract co-venturers.</p>
            <Link to="/ventures/new" className="btn-primary">List Your Venture</Link>
          </div>
        ) : (
          <div className="ventures-grid">
            {ventures.map(v => (
              <VentureCard
                key={v.id}
                venture={v}
                isOwner={v.listedBy?.id === user?.id}
                onApply={() => setApplyTarget(v)}
                onEdit={() => navigate(`/ventures/${v.id}/edit`)}
                onDelete={() => handleDelete(v.id)}
              />
            ))}
          </div>
        )}
      </div>

      {applyTarget && (
        <CoVentureModal venture={applyTarget} onClose={() => setApplyTarget(null)} />
      )}
    </AppLayout>
  );
}

function VentureCard({ venture, isOwner, onApply, onEdit, onDelete }) {
  const b = venture.brandDetails || {};
  return (
    <div className="venture-card">
      <div className="venture-card-top">
        {b.logoUrl
          ? <img src={b.logoUrl} alt={b.brandName} className="venture-logo" />
          : <div className="venture-logo-placeholder">{b.brandName?.[0] || '?'}</div>
        }
        <div className="venture-card-meta">
          <span className="venture-industry">{b.industry?.replace(/_/g, ' ')}</span>
          <span className="venture-type">{TYPE_LABELS[b.ventureType] || b.ventureType}</span>
        </div>
        {isOwner && <div className="owner-badge">Owner</div>}
      </div>

      <h3 className="venture-name">{b.brandName}</h3>
      <p className="venture-desc">{b.description?.slice(0, 130)}{b.description?.length > 130 ? '…' : ''}</p>

      {b.dealValue && (
        <div className="venture-deal">₹{Number(b.dealValue).toLocaleString('en-IN')}</div>
      )}

      <div className="venture-card-footer">
        <div className="venture-stats">
          <span title="Views">👁 {venture.views || 0}</span>
          <span title="Applications">📋 {venture.coVentureApplicationCount || 0}</span>
        </div>
        <div className="venture-card-actions">
          {isOwner ? (
            <>
              <button className="btn-secondary btn-sm" onClick={onEdit}>Edit</button>
              <button className="btn-danger btn-sm" onClick={onDelete}>Delete</button>
            </>
          ) : (
            <button className="btn-primary btn-sm" onClick={onApply}>
              Co-Venture →
            </button>
          )}
          {b.website && (
            <a href={b.website} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">↗</a>
          )}
        </div>
      </div>
    </div>
  );
}
