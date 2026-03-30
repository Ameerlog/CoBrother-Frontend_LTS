import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ventureAPI } from '../api/services';
import AppLayout from '../components/layout/AppLayout';
import VentureForm from '../components/venture/VentureForm';

export default function EditVenturePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venture, setVenture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ventureAPI.get(id)
      .then(({ data }) => setVenture(data))
      .catch(() => navigate('/ventures'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (form, imageFile) => {
    setLoading(true); setError('');
    try {
        await ventureAPI.update(id, form);

        if (imageFile) {
            await ventureAPI.uploadImage(id, imageFile);
        }

        navigate('/ventures');
      } catch (err) {
          setError(err.response?.data?.error || 'Failed to update venture.');
      } finally { setLoading(false); }
  };

  if (fetching) return (
    <AppLayout>
      <div className="page-loading">
        <div className="spinner" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="form-page venture-form-page">
        <div className="form-page-header">
          <h1>Edit Venture</h1>
          <p>Update your venture details.</p>
        </div>
        <VentureForm
          initialData={venture}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitLabel="Save Changes →"
        />
      </div>
    </AppLayout>
  );
}
