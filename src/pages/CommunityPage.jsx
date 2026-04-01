import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { communityAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import { useLikes } from '../hooks/useLikes';
import LikeButton from '../components/common/LikeButton';


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

  const { toggle: toggleLike, get: getLike } = useLikes('COMMUNITY', profiles);
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">
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
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 m-0">Community</h1>
            <p className="text-gray-600 mt-1">Connect with founders, investors, and operators.</p>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            {myProfile ? (
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-purple hover:bg-purple-50" onClick={() => navigate('/profile/analytics')}>
                  📈 Analytics
                </button>
                <button className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-purple hover:bg-purple-50" onClick={() => setShowForm(v => !v)}>
                  ✏ Edit Profile
                </button>
              </div>
            ) : (
              <button className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-[#0077b5] text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-[#005885] disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleConnectLinkedIn} disabled={linkedInLoading}>
                {linkedInLoading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Connecting…</>
                  : <><LinkedInIcon /> Connect with LinkedIn</>
                }
              </button>
            )}
          </div>
        </div>

        {linkedInError && (
          <div className="p-4 bg-red-100 border border-red-200 rounded-lg text-sm text-red-600 mb-6">
            {linkedInError}
          </div>
        )}
        {linkedInSuccess && (
          <div className="p-4 bg-blue-100 border border-blue-200 rounded-lg text-sm text-blue-600 mb-6 flex items-center gap-2">
            <LinkedInIcon size={16} /> {linkedInSuccess}
          </div>
        )}

        {showForm && myProfile && (
          <div className="mb-6">
            <CommunityProfileForm
              initial={myProfile}
              onSaved={handleProfileSaved}
              onCancel={() => { setShowForm(false); setLinkedInSuccess(''); }}
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" /></div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">◉</div>
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">No community members yet</h3>
            <p className="text-gray-600 mb-6">Connect your LinkedIn to join the community and be discovered.</p>
            <button className="px-5 py-2 bg-[#0077B5] text-white rounded-full text-sm font-semibold transition-all duration-200 hover:bg-[#006399] flex items-center gap-2 mx-auto" onClick={handleConnectLinkedIn}>
              <LinkedInIcon /> Connect with LinkedIn
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
            {profiles.map(p => (
              <CommunityCard
                key={p.id}
                profile={p}
                isMe={p.appUser?.id === user?.id}
                likeState={getLike(p.id)}
                onLike={() => toggleLike(p.id)}
                onView={() => setDetailProfile(p)}
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

  useEffect(() => {
    communityAPI.getOne(profile.id)
      .then(({ data }) => setDetail(data?.data ?? data))
      .catch(() => setDetail(profile))
      .finally(() => setLoading(false));
  }, [profile.id]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none" />
        <button className="absolute top-4 right-4 z-20 bg-transparent border-none text-gray-400 text-xl cursor-pointer transition-colors hover:text-gray-700" onClick={onClose}>✕</button>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-7 h-7 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              {p.imageUrl
                ? <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 flex-shrink-0" />
                : <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-2xl font-bold text-indigo-600 flex-shrink-0">{p.name?.[0]?.toUpperCase() || '?'}</div>
              }
              <div>
                <h2 className="font-display text-[1.75rem] font-semibold text-gray-900">{p.name || 'Anonymous'}</h2>
                {p.role && (
                  <div className="inline-block mt-1 px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-[0.7rem] text-indigo-600 uppercase tracking-wider">
                    {p.role.replace(/_/g, ' ')}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-5">
              {p.industry && <span className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700">{p.industry.replace(/_/g, ' ')}</span>}
              {p.location && <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">📍 {p.location}</span>}
            </div>

            {skills.length > 0 && (
              <div className="mb-5">
                <div className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(s => <span key={s} className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-600">{s}</span>)}
                </div>
              </div>
            )}

            {p.linkedInProfileUrl && (
              <div className="mb-5">
                <div className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-wider mb-2">LinkedIn</div>
                <a href={p.linkedInProfileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-[#0077b5] no-underline hover:text-[#005885]">
                  <LinkedInIcon size={14} /> View Profile ↗
                </a>
              </div>
            )}

            {p.whyImHere && (
              <div className="mb-5">
                <div className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-wider mb-2">Why I'm Here</div>
                <p className="text-gray-600 leading-relaxed text-sm m-0">{p.whyImHere}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {isMe && (
                <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-sm rounded-[10px] cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50" onClick={onEdit}>✏ Edit Profile</button>
              )}
              <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent text-gray-500 font-semibold text-sm rounded-[10px] border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-700" onClick={onClose}>Close</button>
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
    whyImHere: initial?.whyImHere || '',
    linkedInProfileUrl: initial?.linkedInProfileUrl || '',
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
    <div className="p-8 bg-white border border-gray-200 rounded-[18px] shadow-sm">
      {initial?.name && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-[10px] mb-6">
          <div className="flex items-center gap-3.5">
            {initial.imageUrl
              ? <img src={initial.imageUrl} alt={initial.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              : <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl font-semibold text-indigo-600 flex-shrink-0">{initial.name[0]?.toUpperCase()}</div>
            }
            <div>
              <div className="font-semibold text-gray-900">{initial.name}</div>
              {initial.linkedInProfileUrl && (
                <a href={initial.linkedInProfileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-[#0077b5] no-underline hover:text-[#005885] mt-0.5">
                  <LinkedInIcon size={13} /> View LinkedIn profile
                </a>
              )}
            </div>
          </div>
          <div className="mt-2.5 text-xs text-blue-500">✓ Name and photo imported from LinkedIn</div>
        </div>
      )}

      <h3 className="font-display text-2xl text-gray-900 font-semibold">
        Complete Your Community Profile
      </h3>
      <p className="text-gray-500 text-sm mt-1">Help others understand what you bring to the table.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Your Role <span className="text-red-500 font-bold">*</span></label>
            <select name="role" value={form.role} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 cursor-pointer transition-all">
              <option value="">Select role</option>
              {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Industry <span className="text-red-500 font-bold">*</span></label>
            <select name="industry" value={form.industry} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 cursor-pointer transition-all">
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Skills <span className="text-gray-400 text-xs">(comma-separated)</span></label>
          <input name="skills" value={form.skills} onChange={handleChange}
            placeholder="e.g. Java, React, Marketing, Finance"
            className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Location</label>
          <input name="location" value={form.location} onChange={handleChange}
            placeholder="e.g. Bengaluru, India"
            className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Why I'm Here <span className="text-gray-400 text-xs">(optional)</span></label>
          <textarea name="whyImHere" value={form.whyImHere} onChange={handleChange}
            placeholder="e.g. Looking to co-found a SaaS product, open to advisory roles in fintech, seeking a tech co-founder for my D2C brand..."
            rows={3}
            className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all resize-vertical" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">LinkedIn Profile URL <span className="text-red-500 font-bold">*</span></label>
          <input name="linkedInProfileUrl" value={form.linkedInProfileUrl} onChange={handleChange}
            placeholder="https://www.linkedin.com/in/your-username"
            required
            className="px-3 py-2 border border-gray-300 rounded-[8px] text-gray-900 bg-white outline-none focus:border-indigo-500 transition-all" />
          <span className="text-xs text-gray-400 mt-0.5">
            Find it on your LinkedIn profile page — e.g. linkedin.com/in/johndoe
          </span>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-[10px] border-none cursor-pointer transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : 'Save Profile →'}
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent text-gray-500 font-semibold text-sm rounded-[10px] border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100 hover:text-gray-700" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ─── Community Card ───────────────────────────────────────────────────────────
function CommunityCard({ profile, isMe, onView, onEdit, likeState, onLike }) {
  const skills = profile.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    
    <div
      className={`card-glow-hover p-6 bg-white rounded-[18px] shadow-sm flex flex-col gap-3 transition-all duration-300 cursor-pointer relative hover:-translate-y-1.5 hover:shadow-xl border ${isMe ? 'border-indigo-300' : 'border-gray-200 hover:border-indigo-200'}`}
      onClick={onView}
    >
      {isMe && (
        <button className="absolute top-3.5 right-3.5 inline-flex items-center justify-center w-7 h-7 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-500 p-0 cursor-pointer transition-all hover:bg-indigo-100" onClick={e => { e.stopPropagation(); onEdit(); }} title="Edit profile">✏</button>
      )}
      <div className="flex items-center gap-3">
        {profile.imageUrl
          ? <img src={profile.imageUrl} alt={profile.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          : <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl font-semibold text-indigo-600 flex-shrink-0">{profile.name?.[0]?.toUpperCase() || '?'}</div>
        }
        <div>
          <h4 className="font-semibold text-[0.95rem] text-gray-900">{profile.name || 'Anonymous'}</h4>
          {profile.role && (
            <div className="inline-block mt-0.5 px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-[0.7rem] text-indigo-600 uppercase tracking-wider">{profile.role.replace(/_/g, ' ')}</div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-wider">Industry & Location</span>
        <div className="flex flex-wrap gap-1.5">
          {profile.industry && (
            <span className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700">{profile.industry.replace(/_/g, ' ')}</span>
          )}
          {profile.location && (
            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">📍 {profile.location}</span>
          )}
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-wider">Skills</span>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 4).map(s => <span key={s} className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-600">{s}</span>)}
            {skills.length > 4 && <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-400">+{skills.length - 4}</span>}
          </div>
        </div>
      )}

      {profile.linkedInProfileUrl && (
        <a href={profile.linkedInProfileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-[#0077b5] no-underline mt-0.5 hover:text-[#005885]" onClick={e => e.stopPropagation()}>
          <LinkedInIcon size={13} /> LinkedIn ↗
        </a>
      )}

      <div className="flex justify-between items-center mt-1">
        <LikeButton liked={likeState?.liked} count={likeState?.count} onToggle={onLike} forceRed />
      </div>
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
