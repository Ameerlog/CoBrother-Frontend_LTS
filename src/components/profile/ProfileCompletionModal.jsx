import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

export default function ProfileCompletionModal({ forceOpen = false }) {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstname: '', lastname: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = name, 2 = phone (optional)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstname.trim() || !form.lastname.trim()) {
      setError('First name and last name are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await profileAPI.complete(form);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card profile-modal">
        <div className="modal-glow" />

        <div className="modal-header">
          <div className="modal-badge">Welcome aboard</div>
          <h2>Complete Your Profile</h2>
          <p>Just a few details to get you started on CoBrother.</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name <span className="required">*</span></label>
              <input
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                placeholder="e.g. Rahul"
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name <span className="required">*</span></label>
              <input
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                placeholder="e.g. Sharma"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number <span className="optional">(optional)</span></label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              maxLength={10}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Complete Profile →'}
          </button>
        </form>

        <div className="modal-footer-note">
          This information helps other members connect with you.
        </div>
      </div>
    </div>
  );
}
