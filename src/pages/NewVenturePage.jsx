import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ventureAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';
import VentureForm from '../components/venture/VentureForm';

export default function NewVenturePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (form) => {
    setLoading(true); setError('');
    try {
      await ventureAPI.create(form);
      navigate('/ventures');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create venture.');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div className="form-page">
        <div className="form-page-header">
          <h1>List a New Venture</h1>
          <p>Fill in the details to attract the right co-venturers.</p>
        </div>
        <VentureForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitLabel="Publish Venture →"
        />
      </div>
    </AppLayout>
  );
}
