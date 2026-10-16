import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function RegistrationForm() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, partRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get('/participants?limit=100') // كنجيبو اللائحة باش نعمرو الـ Select
        ]);
        setEvent(eventRes.data);
        setParticipants(partRes.data.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParticipant) return setError('Veuillez sélectionner un participant');
    
    setError('');
    setSubmitting(true);
    try {
      await api.post('/registrations', {
        eventId,
        participantId: selectedParticipant,
        status: 'confirmed' // كنفاليديو التسجيل نيشان للتبسيط
      });
      navigate(`/events/${eventId}`); // كنرجعوه لصفحة الحدث
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erreur lors de l\'inscription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  if (!event) return <div role="alert" className="p-8 text-center text-red-600">{error || 'Événement introuvable.'}</div>;

  if (event.status !== 'published') {
    return (
      <div className="mx-auto mt-8 max-w-xl rounded border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-semibold text-gray-900">Inscription indisponible</h1>
        <p className="mt-2 text-sm text-gray-700">
          Cet événement n’est pas publié. L’inscription est possible uniquement pour les événements publiés.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/events/${eventId}`)}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Retour à l’événement
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Inscription à : <span className="text-blue-600">{event.title}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un participant
            </label>
            <select
              value={selectedParticipant}
              onChange={(e) => setSelectedParticipant(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            >
              <option value="">-- Choisir un participant --</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              Places disponibles : <span className="font-bold">{event.maxParticipants - event.registrationsCount}</span>
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/events/${eventId}`)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || event.registrationsCount >= event.maxParticipants}
              className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {submitting ? 'Enregistrement...' : 'Confirmer l\'inscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}