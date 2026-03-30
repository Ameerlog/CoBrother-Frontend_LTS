import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ventureAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';
import VentureForm from '../components/venture/VentureForm';

export default function NewVenturePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (form, imageFile) => {
    setLoading(true); setError('');
    try {
        const { data } = await ventureAPI.create(form);
        const savedId = data?.id ?? data?.data?.id;

        // Upload image after venture is created (we need the ID for S3 key)
        if (imageFile && savedId) {
            await ventureAPI.uploadImage(savedId, imageFile);
        }

        navigate('/ventures');
      } catch (err) {
          setError(err.response?.data?.error || 'Failed to create venture.');
      } finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div className="form-page venture-form-page">
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
