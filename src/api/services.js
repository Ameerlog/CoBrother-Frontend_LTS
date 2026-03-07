import api from './axios';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:           (data)          => api.post('/api/v1/auth/register', data),
  login:              (data)          => api.post('/api/v1/auth/login', data),
  sendOtp:            (email)         => api.post('/api/v1/auth/otp/send', { email }),
  verifyOtp:          (email, otp)    => api.post('/api/v1/auth/otp/verify', { email, otpCode: otp }),
  verifyEmail:        (token)         => api.get(`/api/v1/auth/verify-email?token=${token}`),
  resendVerification: (email)         => api.post('/api/v1/auth/resend-verification', { email }),
  refresh:            (refreshToken)  => api.post('/api/v1/auth/refresh', { refreshToken }),
  logout:             ()              => api.post('/api/v1/auth/logout'),
  completeProfile:    (data)          => api.post('/api/v1/auth/complete-profile', data),
};

// ─── Profile ─────────────────────────────────────────────────────────────────
export const profileAPI = {
  // /profile/me is the primary source — returns AppUser with profileComplete
  getMe:    ()     => api.get('/api/v1/profile/me'),
  complete: (data) => api.put('/api/v1/profile/complete', data),
};

// ─── Venture ─────────────────────────────────────────────────────────────────
export const ventureAPI = {
  getAll:       ()        => api.get('/api/v1/venture/all'),
  getMyVentures:()        => api.get('/api/v1/venture/my'),
  get:          (id)      => api.get(`/api/v1/venture/${id}`),
  create:       (data)    => api.post('/api/v1/venture', data),
  update:       (id, data)=> api.put(`/api/v1/venture/${id}`, data),
  delete:       (id)      => api.delete(`/api/v1/venture/${id}`),
};

// ─── CoVenture ───────────────────────────────────────────────────────────────
export const coVentureAPI = {
  apply:                  (ventureId, data) => api.post(`/api/v1/coventure/${ventureId}`, data),
  checkApplied:           (ventureId)       => api.get(`/api/v1/coventure/${ventureId}/my-status`),
  getMyApplications:      ()                => api.get('/api/v1/coventure/my-applications'),
  getMyVentureApplications: (status)        => api.get('/api/v1/coventure/my-venture-applications', { params: { status } }),
  updateStatus:           (id, status)      => api.put(`/api/v1/coventure/${id}/status`, { status }),
};
// ─── Community ───────────────────────────────────────────────────────────────
export const communityAPI = {
  getAll:           ()        => api.get('/api/v1/community/all'),
  getOne:           (id)      => api.get(`/api/v1/community/${id}`),
  update:           (id, data)=> api.put(`/api/v1/community/${id}`, data),
  linkedInAuthUrl:  ()        => api.get('/api/v1/community/linkedin/auth'),
  linkedInCallback: (code)    => api.get(`/api/v1/community/linkedin/callback?code=${code}`),
};

// ─── Domain ──────────────────────────────────────────────────────────────────
export const domainAPI = {
  get:    (id)       => api.get(`/api/v1/domain/${id}`),
  create: (data)     => api.post('/api/v1/domain', data),
  update: (id, data) => api.put(`/api/v1/domain/${id}`, data),
  delete: (id)       => api.delete(`/api/v1/domain/${id}`),
};

export const analyticsAPI = {
  getVentureAnalytics: (id) => api.get(`/api/v1/analytics/venture/${id}`),
  getProfileAnalytics: ()    => api.get('/api/v1/analytics/profile'),
  getMyVentures:       ()    => api.get('/api/v1/venture/my'),
};
