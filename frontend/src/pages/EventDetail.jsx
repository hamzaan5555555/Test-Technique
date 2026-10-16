import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';

const REGISTRATION_PAGE_SIZE = 5;

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [registrationPage, setRegistrationPage] = useState(1);
  const [registrationsPagination, setRegistrationsPagination] = useState({
    page: 1,
    limit: REGISTRATION_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [updatingRegistrationId, setUpdatingRegistrationId] = useState(null);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    setRegistrationPage(1);
  }, [id]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  useEffect(() => {
    let isCurrentRequest = true;
    setRegistrationsLoading(true);
    const fetchRegistrations = async () => {
      try {
        const response = await api.get('/registrations', {
          params: { eventId: id, page: registrationPage, limit: REGISTRATION_PAGE_SIZE },
        });
        if (isCurrentRequest) {
          setRegistrations(response.data.data);
          setRegistrationsPagination(response.data.pagination);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des inscriptions:', error);
      } finally {
        if (isCurrentRequest) setRegistrationsLoading(false);
      }
    };
    fetchRegistrations();
    return () => { isCurrentRequest = false; };
  }, [id, registrationPage]);

  const updateRegistrationStatus = async (registrationId, status) => {
    setUpdatingRegistrationId(registrationId);
    setStatusError('');
    try {
      const response = await api.patch(`/registrations/${registrationId}/status`, { status });
      setRegistrations((currentRegistrations) => currentRegistrations.map((registration) => (
        registration.id === registrationId
          ? { ...registration, status: response.data.status }
          : registration
      )));
    } catch (error) {
      setStatusError(
        error.response?.data?.error?.message || 'Impossible de modifier le statut de cette inscription.'
      );
    } finally {
      setUpdatingRegistrationId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  if (!event) return <div className="p-8 text-center text-red-500">Événement introuvable</div>;

  return (
    <div className="space-y-6">
      <div className="page-intro page-intro-action event-detail-heading">
        <div>
          <p className="page-eyebrow">DÉTAIL DE L’ÉVÉNEMENT</p>
          <h1>{event.title}</h1>
          <p className="page-subtitle">{event.location} · {new Date(event.eventDate).toLocaleString('fr-FR')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status={event.status} />
          {event.status === 'published' && (
            <Link to={`/register/${event.id}`} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              Inscrire un participant
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
        <p className="text-gray-600">{event.description || 'Aucune description fournie.'}</p>
        <div className="mt-4 flex space-x-8 text-sm">
          <div><span className="font-semibold text-gray-700">Places :</span> {event.registrationsCount} / {event.maxParticipants}</div>
          <div><span className="font-semibold text-gray-700">Créé le :</span> {new Date(event.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="section-heading roster-heading">
        <div>
          <h2>Inscriptions</h2>
          <p>{registrationsPagination.total} participant(s) enregistré(s)</p>
        </div>
      </div>
      {statusError && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{statusError}</p>}
      <Table headers={['Nom', 'Email', 'Date d\'inscription', 'Statut']}>
        {registrationsLoading ? (
          <tr><td colSpan="4" className="px-6 py-6 text-center text-sm text-gray-500">Chargement des inscriptions...</td></tr>
        ) : registrations.map((reg) => (
          <tr key={reg.id}>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{reg.participant.fullName}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{reg.participant.email}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(reg.createdAt).toLocaleDateString()}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm">
              {event.status === 'published' ? (
                <select
                  aria-label={`Statut de l'inscription de ${reg.participant.fullName}`}
                  value={reg.status}
                  disabled={updatingRegistrationId === reg.id}
                  onChange={(changeEvent) => updateRegistrationStatus(reg.id, changeEvent.target.value)}
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-60"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              ) : (
                <StatusBadge status={reg.status} />
              )}
            </td>
          </tr>
        ))}
        {!registrationsLoading && registrations.length === 0 && (
          <tr>
            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Aucun participant inscrit.</td>
          </tr>
        )}
      </Table>
      {!registrationsLoading && (
        <Pagination pagination={registrationsPagination} onPageChange={setRegistrationPage} />
      )}
    </div>
  );
}