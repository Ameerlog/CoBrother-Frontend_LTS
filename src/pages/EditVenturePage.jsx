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
      .then(({ data }) => {
        const venture = data?.data ?? data;
        setVenture(venture);
      })
      .catch(() => navigate('/ventures'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (form, imageFile) => {
    setLoading(true); setError('');
    try {
        // Clean form data - only send editable fields
        const cleanData = {
          brandDetails: form.brandDetails,
          contactInfo: form.contactInfo,
          agreement: form.agreement,
          status: form.status,
          stage: form.stage,
          lookingFor: form.lookingFor,
          currentProblem: form.currentProblem,
        };
        
        console.log('Sending update payload:', cleanData);
        await ventureAPI.update(id, cleanData);

        if (imageFile) {
            await ventureAPI.uploadImage(id, imageFile);
        }

        navigate('/ventures');
      } catch (err) {
          console.error('Venture update failed:', err);
          setError(err.response?.data?.error || err.message || 'Failed to update venture.');
      } finally { setLoading(false); }
  };

  if (fetching) return (
    <AppLayout>
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-full w-full">
        <div className="mb-8">
          <h1 className="font-display text-[2rem] font-bold text-gray-900 m-0 mb-2">Edit Venture</h1>
          <p className="text-gray-600">Update your venture details.</p>
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
