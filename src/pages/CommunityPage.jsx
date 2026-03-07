import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { communityAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

const ROLES = [
  'FOUNDER','CO_FOUNDER','INVESTOR','MENTOR',
  'OPERATOR','FREELANCER','STUDENT','OTHER'
];
const INDUSTRIES = [
  'TECH','FINANCE','HEALTHCARE','EDUCATION','FOOD_AND_BEVERAGE','RETAIL',
  'REAL_ESTATE','MEDIA','MANUFACTURING','LOGISTICS','AGRICULTURE','OTHER'
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [detailProfile, setDetailProfile] = useState(null);

  
  const [profiles, setProfiles]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [myProfile, setMyProfile]           = useState(null);
  const [linkedInLoading, setLinkedInLoading] = useState(false);
  const [linkedInError, setLinkedInError]   = useState('');
  const [linkedInSuccess, setLinkedInSuccess] = useState('');

  // ── Handle LinkedIn redirect back: ?linkedin=success&profileId=42 ──────────
  // The BACKEND exchanges the code, saves the Community row, then redirects
  // the browser here with the saved profileId. We just load that profile.
  useEffect(() => {
    const status    = searchParams.get('linkedin');
    const profileId = searchParams.get('profileId');
    const errMsg    = searchParams.get('linkedin_error');

    // Clear params from URL immediately
    if (status || errMsg) {
      setSearchParams({}, { replace: true });
    }

    if (errMsg) {
      setLinkedInError(decodeURIComponent(errMsg));
      return;
    }

    if (status === 'success' && profileId) {
      setLinkedInLoading(true);
      communityAPI.getOne(profileId)
        .then(({ data }) => {
          const profile = data?.data ?? data;
          setMyProfile(profile);
          setLinkedInSuccess('LinkedIn connected! Your name and photo have been imported. Now complete your profile below.');
          setShowForm(true);
          // Insert into profiles list if not already there
          setProfiles(prev => {
            if (prev.find(p => p.id === profile.id)) return prev;
            return [profile, ...prev];
          });
        })
        .catch(() => {
          setLinkedInError('LinkedIn connected but failed to load profile. Please refresh.');
        })
        .finally(() => setLinkedInLoading(false));
    }
  }, []); // run once on mount


  // ── Load all community profiles ───────────────────────────────────────────
  useEffect(() => {
    communityAPI.getAll()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setProfiles(list);
        const mine = list.find(p => p.appUser?.id === user?.id);
        if (mine && !myProfile) setMyProfile(mine);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  // ── Click "Connect with LinkedIn" ─────────────────────────────────────────
  const handleConnectLinkedIn = async () => {
    setLinkedInError('');
    setLinkedInLoading(true);
    try {
      const { data } = await communityAPI.linkedInAuthUrl();
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const url    = parsed?.url ?? parsed?.authUrl ?? parsed;
      if (!url || typeof url !== 'string') throw new Error('Invalid auth URL');
      window.location.href = url;
    } catch (e) {
      setLinkedInLoading(false);
      setLinkedInError('Could not get LinkedIn auth URL. Please try again.');
    }
  };

// ─── Community Detail Modal ───────────────────────────────────────────────────

  if (linkedInLoading) {
    return (
      <AppLayout>
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <div className="spinner" style={{ width: 48, height: 48 }} />
          <p style={{ color: '#a0a0b0', fontSize: '0.95rem' }}>
            Connecting your LinkedIn profile…
          </p>
        </div>
      </AppLayout>
    );
  }
  
  

  const handleProfileSaved = (saved) => {
    setMyProfile(saved);
    setShowForm(false);
    setLinkedInSuccess('');
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
  };

  return (
    <AppLayout>
      <div className="community-page">
        <div className="page-header">
          <div>
            <h1>Community</h1>
            <p>Connect with founders, investors, and operators.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {myProfile ? (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => navigate('/profile/analytics')}>
                  📈 Analytics
                </button>
                <button className="btn-secondary" onClick={() => setShowForm(v => !v)}>
                  ✏ Edit Profile
                </button>
              </div>
            ) : (
              <button className="btn-linkedin" onClick={handleConnectLinkedIn} disabled={linkedInLoading}>
                {linkedInLoading
                  ? <><span className="btn-spinner" /> Connecting…</>
                  : <><LinkedInIcon /> Connect with LinkedIn</>
                }
              </button>
            )}
          </div>
        </div>

        {linkedInError && (
          <div className="form-error" style={{ marginBottom: '1.5rem' }}>
            {linkedInError}
          </div>
        )}
        {linkedInSuccess && (
          <div className="form-info linkedin-success" style={{ marginBottom: '1.5rem' }}>
            <LinkedInIcon size={16} /> {linkedInSuccess}
          </div>
        )}

        {showForm && myProfile && (
          <div className="community-form-section">
            <CommunityProfileForm
              initial={myProfile}
              onSaved={handleProfileSaved}
              onCancel={() => { setShowForm(false); setLinkedInSuccess(''); }}
            />
          </div>
        )}

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : profiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◉</div>
            <h3>No community members yet</h3>
            <p>Connect your LinkedIn to join the community and be discovered.</p>
            <button className="btn-linkedin" onClick={handleConnectLinkedIn}>
              <LinkedInIcon /> Connect with LinkedIn
            </button>
          </div>
        ) : (
          <div className="community-grid">
            {profiles.map(p => (
              <CommunityCard
                key={p.id}
                profile={p}
                isMe={p.appUser?.id === user?.id}
                onView={() => setDetailProfile(p)}        // ✅ add this
                onEdit={() => { setMyProfile(p); setShowForm(true); }}
              />
            ))}
          </div>
        )}
      </div>
      {detailProfile && (
        <CommunityDetailModal
          profile={detailProfile}
          isMe={detailProfile.appUser?.id === user?.id}
          onClose={() => setDetailProfile(null)}
          onEdit={() => { setMyProfile(detailProfile); setShowForm(true); setDetailProfile(null); }}
        />
      )}
    </AppLayout>
  );
}

function CommunityDetailModal({ profile, isMe, onClose, onEdit }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const p = detail || profile;
  const skills = p.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  // Fetch full profile + trigger view tracking
  useEffect(() => {
    communityAPI.getOne(profile.id)
      .then(({ data }) => setDetail(data?.data ?? data))
      .catch(() => setDetail(profile))
      .finally(() => setLoading(false));
  }, [profile.id]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-glow" />
        <button className="modal-close" onClick={onClose}>✕</button>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              {p.imageUrl
                ? <img src={p.imageUrl} alt={p.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(110,158,200,0.3)' }} />
                : <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(110,158,200,0.12)', border: '1px solid rgba(110,158,200,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 700, color: '#6e9ec8'
                  }}>{p.name?.[0]?.toUpperCase() || '?'}</div>
              }
              <div>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', fontWeight: 600 }}>{p.name || 'Anonymous'}</h2>
                {p.role && (
                  <div className="community-role-badge" style={{ marginTop: '0.3rem', display: 'inline-block' }}>
                    {p.role.replace(/_/g, ' ')}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {p.industry && <span className="community-tag industry-tag">{p.industry.replace(/_/g, ' ')}</span>}
              {p.location && <span className="community-tag location-tag">📍 {p.location}</span>}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
                </div>
              </div>
            )}

            {/* LinkedIn */}
            {p.linkedInProfileUrl && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>LinkedIn</div>
                <a href={p.linkedInProfileUrl} target="_blank" rel="noreferrer" className="community-linkedin" style={{ fontSize: '0.875rem' }}>
                  <LinkedInIcon size={14} /> View Profile ↗
                </a>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              {isMe && (
                <button className="btn-secondary" onClick={onEdit}>✏ Edit Profile</button>
              )}
              <button className="btn-ghost" onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ─── Community Profile Form ───────────────────────────────────────────────────
function CommunityProfileForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    role:     initial?.role     || '',
    skills:   initial?.skills   || '',
    industry: initial?.industry || '',
    location: initial?.location || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!initial?.id) { setError('Profile ID missing — please refresh.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await communityAPI.update(initial.id, form);
      onSaved(data?.data ?? data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="community-form-card">
      {/* Imported LinkedIn preview */}
      {initial?.name && (
        <div className="linkedin-imported">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {initial.imageUrl
              ? <img src={initial.imageUrl} alt={initial.name} className="community-avatar" />
              : <div className="community-avatar-placeholder">{initial.name[0]?.toUpperCase()}</div>
            }
            <div>
              <div style={{ fontWeight: 600 }}>{initial.name}</div>
              {initial.linkedInProfileUrl && (
                <a href={initial.linkedInProfileUrl} target="_blank" rel="noreferrer" className="community-linkedin">
                  <LinkedInIcon size={13} /> View LinkedIn profile
                </a>
              )}
            </div>
          </div>
          <div className="linkedin-imported-note">✓ Name and photo imported from LinkedIn</div>
        </div>
      )}

      <h3 style={{ marginTop: initial?.name ? '1.5rem' : 0 }}>
        Complete Your Community Profile
      </h3>
      <p className="form-subtext">Help others understand what you bring to the table.</p>

      <form onSubmit={handleSubmit} className="venture-form" style={{ marginTop: '1.25rem' }}>
        <div className="form-row">
          <div className="form-group">
            <label>Your Role <span className="required">*</span></label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select role</option>
              {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Industry <span className="required">*</span></label>
            <select name="industry" value={form.industry} onChange={handleChange} required>
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Skills <span className="optional">(comma-separated)</span></label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="e.g. Java, React, Marketing, Finance"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Bengaluru, India"
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Save Profile →'}
          </button>
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ─── Community Card ───────────────────────────────────────────────────────────
function CommunityCard({ profile, isMe, onView, onEdit }) {
  const skills = profile.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    
    <div
      className={`community-card${isMe ? ' is-me' : ''}`}
      onClick={onView}
      style={{ cursor: 'pointer' }}
    >
      {isMe && (
        <button className="me-edit-btn" onClick={e => { e.stopPropagation(); onEdit(); }} title="Edit profile">✏</button>
      )}
      <div className="community-card-top">
        {profile.imageUrl
          ? <img src={profile.imageUrl} alt={profile.name} className="community-avatar" />
          : <div className="community-avatar-placeholder">{profile.name?.[0]?.toUpperCase() || '?'}</div>
        }
        <div>
          <h4 className="community-name">{profile.name || 'Anonymous'}</h4>
          {profile.role && (
            <div className="community-role-badge">{profile.role.replace(/_/g, ' ')}</div>
          )}
        </div>
      </div>

      <div className="community-details">
        {profile.industry && (
          <span className="community-tag industry-tag">{profile.industry.replace(/_/g, ' ')}</span>
        )}
        {profile.location && (
          <span className="community-tag location-tag">📍 {profile.location}</span>
        )}
      </div>

      {skills.length > 0 && (
        <div className="community-skills">
          {skills.slice(0, 4).map(s => <span key={s} className="skill-chip">{s}</span>)}
          {skills.length > 4 && <span className="skill-chip more">+{skills.length - 4}</span>}
        </div>
      )}

      {profile.linkedInProfileUrl && (
        <a href={profile.linkedInProfileUrl} target="_blank" rel="noreferrer" className="community-linkedin">
          <LinkedInIcon size={13} /> LinkedIn ↗
        </a>
      )}
    </div>
  );
}

// ─── LinkedIn Icon ────────────────────────────────────────────────────────────
function LinkedInIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
