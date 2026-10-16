import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Table from '../components/Table';

const PAGE_SIZE = 5;
const emptyForm = { fullName: '', email: '', phone: '' };

const getErrorMessage = (error, fallback) => {
  const apiError = error.response?.data?.error;
  return typeof apiError === 'string' ? apiError : apiError?.message || fallback;
};

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [reloadVersion, setReloadVersion] = useState(0);
  const [listError, setListError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingParticipantId, setDeletingParticipantId] = useState(null);

  useEffect(() => {
    let isCurrentRequest = true;
    setLoading(true);
    setListError('');

    const load = async () => {
      try {
        const response = await api.get('/participants', {
          params: { search: search.trim(), page, limit: PAGE_SIZE },
        });
        if (isCurrentRequest) {
          setParticipants(response.data.data);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setListError(getErrorMessage(error, 'Impossible de charger les participants.'));
        }
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    load();
    return () => { isCurrentRequest = false; };
  }, [search, page, reloadVersion]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingParticipant(null);
    setFormError('');
  };

  const openCreateForm = () => {
    setEditingParticipant(null);
    setForm(emptyForm);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (participant) => {
    setEditingParticipant(participant);
    setForm({
      fullName: participant.fullName,
      email: participant.email,
      phone: participant.phone || '',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = { ...form, phone: form.phone.trim() || null };
      if (editingParticipant) {
        await api.put(`/participants/${editingParticipant.id}`, payload);
      } else {
        await api.post('/participants', payload);
      }
      if (!editingParticipant) setPage(1);
      setReloadVersion((version) => version + 1);
      closeForm();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Impossible d’enregistrer le participant.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (participant) => {
    const confirmed = window.confirm(
      `Supprimer ${participant.fullName} ? Ses inscriptions seront également supprimées.`
    );
    if (!confirmed) return;

    setDeletingParticipantId(participant.id);
    setListError('');
    try {
      await api.delete(`/participants/${participant.id}`);
      if (participants.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        setReloadVersion((version) => version + 1);
      }
    } catch (error) {
      setListError(getErrorMessage(error, 'Impossible de supprimer le participant.'));
    } finally {
      setDeletingParticipantId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nouveau Participant
        </button>
      </div>

      <label className="block max-w-lg text-sm font-medium text-gray-700">
        Rechercher par nom ou email
        <input
          type="search"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Ex. salma ou exemple.com"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </label>

      {listError && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{listError}</p>}

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingParticipant ? 'Modifier le participant' : 'Nouveau participant'}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <label className="block text-sm font-medium text-gray-700">
            Nom complet
            <input
              autoComplete="name"
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              minLength={2}
              maxLength={150}
              required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              maxLength={255}
              required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Téléphone <span className="font-normal text-gray-500">(facultatif)</span>
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              maxLength={30}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Enregistrement…' : editingParticipant ? 'Enregistrer' : 'Créer le participant'}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Chargement des participants...</div>
      ) : (
      <Table headers={['Nom complet', 'Email', 'Téléphone', 'Inscrit le', 'Actions']}>
        {participants.map((p) => (
          <tr key={p.id}>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{p.fullName}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.email}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.phone || '-'}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm">
              <button
                type="button"
                onClick={() => openEditForm(p)}
                className="mr-4 font-medium text-blue-700 hover:text-blue-900"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p)}
                disabled={deletingParticipantId === p.id}
                className="font-medium text-red-700 hover:text-red-900 disabled:opacity-60"
              >
                {deletingParticipantId === p.id ? 'Suppression…' : 'Supprimer'}
              </button>
            </td>
          </tr>
        ))}
        {participants.length === 0 && (
          <tr>
            <td colSpan="5" className="px-6 py-6 text-center text-sm text-gray-500">
              Aucun participant trouvé.
            </td>
          </tr>
        )}
      </Table>
      )}
      {!loading && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}