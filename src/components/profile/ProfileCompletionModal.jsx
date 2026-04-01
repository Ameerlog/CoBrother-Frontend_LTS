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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-[520px] bg-white border border-gray-200 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-slideUp">
        <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full bg-purple-100/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-8 pb-6">
          <div className="inline-block px-2.5 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-md mb-4">Welcome aboard</div>
          <h2 className="font-display text-2xl font-bold text-gray-900 m-0 mb-2">Complete Your Profile</h2>
          <p className="text-gray-500 text-sm m-0 mb-6">Just a few details to get you started on CoBrother.</p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 px-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                placeholder="e.g. Rahul"
                autoFocus
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(147,51,234,0.1)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                placeholder="e.g. Sharma"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(147,51,234,0.1)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Phone Number <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[10px] text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(147,51,234,0.1)]"
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[10px] text-red-400 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full px-6 py-3 bg-white border-2 border-purple-400 text-purple-600 rounded-full font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            ) : (
              'Complete Profile →'
            )}
          </button>
        </form>

        <div className="relative z-10 px-8 pb-8 pt-4 text-center text-xs text-gray-400">
          This information helps other members connect with you.
        </div>
      </div>
    </div>
  );
}
