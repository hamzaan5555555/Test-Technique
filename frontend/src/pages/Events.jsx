import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';

const PAGE_SIZE = 5;

const emptyForm = {
  title: '',
  description: '',
  location: '',
  eventDate: '',
  maxParticipants: '1',
};

const getErrorMessage = (error, fallback) => {
  const apiError = error.response?.data?.error;
  return typeof apiError === 'string' ? apiError : apiError?.message || fallback;
};

const toLocalDateTime = (value) => {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transitioningEventId, setTransitioningEventId] = useState(null);
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let isCurrentRequest = true;
    setLoading(true);
    setListError('');

    const fetchEvents = async () => {
      try {
        const response = await api.get('/events', {
          params: {
            page,
            limit: PAGE_SIZE,
            status: statusFilter || undefined,
            date: dateFilter || undefined,
          },
        });
        if (isCurrentRequest) {
          setEvents(response.data.data);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        if (isCurrentRequest) setListError(getErrorMessage(error, 'Impossible de charger les événements.'));
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };
    fetchEvents();
    return () => { isCurrentRequest = false; };
  }, [page, statusFilter, dateFilter, reloadVersion]);

  const updateFilters = (update) => {
    update();
    setPage(1);
  };

  const closeCreateForm = () => {
    setIsCreateOpen(false);
    setEditingEvent(null);
    setFormError('');
  };

  const openCreateForm = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEditForm = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || '',
      location: event.location,
      eventDate: toLocalDateTime(event.eventDate),
      maxParticipants: String(event.maxParticipants),
    });
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleSaveEvent = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        ...form,
        maxParticipants: Number(form.maxParticipants),
      };
      const response = editingEvent
        ? await api.put(`/events/${editingEvent.id}`, payload)
        : await api.post('/events', payload);

      if (editingEvent) {
        setEvents((currentEvents) => currentEvents.map((item) => (
          item.id === editingEvent.id ? response.data : item
        )));
      } else {
        setStatusFilter('');
        setDateFilter('');
        setPage(1);
      }
      setReloadVersion((version) => version + 1);
      closeCreateForm();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Impossible d’enregistrer l’événement. Vérifiez les champs et réessayez.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEventStatus = async (event, status) => {
    if (status === 'cancelled' && !window.confirm(`Annuler l’événement « ${event.title} » ?`)) return;

    setTransitioningEventId(event.id);
    setActionError('');
    try {
      const response = await api.patch(`/events/${event.id}/status`, { status });
      setEvents((currentEvents) => currentEvents.map((item) => (
        item.id === event.id ? response.data : item
      )));
      setReloadVersion((version) => version + 1);
    } catch (error) {
      setActionError(getErrorMessage(error, 'Impossible de modifier le statut de cet événement.'));
    } finally {
      setTransitioningEventId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement des événements...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nouvel Événement
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Statut
          <select
            value={statusFilter}
            onChange={(event) => updateFilters(() => setStatusFilter(event.target.value))}
            className="min-w-44 rounded-md border border-gray-300 bg-white px-3 py-2 font-normal"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="cancelled">Annulé</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Date de l’événement
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => updateFilters(() => setDateFilter(event.target.value))}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 font-normal"
          />
        </label>
        {(statusFilter || dateFilter) && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
              setPage(1);
            }}
            className="px-2 py-2 text-sm font-medium text-gray-600 underline hover:text-gray-900"
          >
            Effacer les filtres
          </button>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={closeCreateForm}
        title={editingEvent ? 'Modifier l’événement' : 'Nouvel événement'}
      >
        <form className="space-y-4" onSubmit={handleSaveEvent}>
          <label className="block text-sm font-medium text-gray-700">
            Titre
            <input
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              minLength={3}
              maxLength={200}
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Lieu
            <input
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              minLength={2}
              maxLength={255}
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Date et heure
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={form.eventDate}
              onChange={(event) => setForm({ ...form, eventDate: event.target.value })}
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Nombre de places
            <input
              type="number"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={form.maxParticipants}
              onChange={(event) => setForm({ ...form, maxParticipants: event.target.value })}
              min={1}
              max={100000}
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Description
            <textarea
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              maxLength={5000}
              rows={3}
            />
          </label>
          {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeCreateForm}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Enregistrement…' : editingEvent ? 'Enregistrer les modifications' : 'Créer l’événement'}
            </button>
          </div>
        </form>
      </Modal>

      {actionError && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
      {listError && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{listError}</p>}

      <Table headers={['Titre', 'Date', 'Lieu', 'Places', 'Statut', 'Actions']}>
        {events.map((event) => (
          <tr key={event.id}>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
              {event.title}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {new Date(event.eventDate).toLocaleDateString()}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {event.location}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {event.registrationsCount} / {event.maxParticipants}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm">
              <StatusBadge status={event.status} />
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
              <Link to={`/events/${event.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                Détails
              </Link>
              {event.status === 'published' && (
                <Link to={`/register/${event.id}`} className="text-green-600 hover:text-green-900 mr-4">
                  Inscrire
                </Link>
              )}
              {event.status !== 'cancelled' && (
                <>
                  <button
                    type="button"
                    onClick={() => openEditForm(event)}
                    className="mr-4 text-gray-700 hover:text-gray-900"
                  >
                    Modifier
                  </button>
                  {event.status === 'draft' && (
                    <button
                      type="button"
                      disabled={transitioningEventId === event.id}
                      onClick={() => updateEventStatus(event, 'published')}
                      className="mr-4 text-green-700 hover:text-green-900 disabled:opacity-60"
                    >
                      {transitioningEventId === event.id ? 'Mise à jour…' : 'Publier'}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={transitioningEventId === event.id}
                    onClick={() => updateEventStatus(event, 'cancelled')}
                    className="text-red-700 hover:text-red-900 disabled:opacity-60"
                  >
                    Annuler l’événement
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
        {events.length === 0 && (
          <tr>
            <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
              Aucun événement trouvé.
            </td>
          </tr>
        )}
      </Table>
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}