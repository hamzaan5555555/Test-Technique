import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import Table from '../components/Table';

const emptyForm = { fullName: '', email: '', password: '', role: 'staff' };

const getErrorMessage = (error, fallback) => {
  const apiError = error.response?.data?.error;
  return typeof apiError === 'string' ? apiError : apiError?.message || fallback;
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [formError, setFormError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setListError('');
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      setListError(getErrorMessage(error, 'Impossible de charger les utilisateurs.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormError('');
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (account) => {
    setEditingUser(account);
    setForm({
      fullName: account.fullName,
      email: account.email,
      password: '',
      role: account.role,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        role: form.role,
      };
      if (!editingUser || form.password) payload.password = form.password;

      if (editingUser) {
        const response = await api.put(`/users/${editingUser.id}`, payload);
        setUsers((currentUsers) => currentUsers.map((account) => (
          account.id === editingUser.id ? response.data : account
        )));
      } else {
        const response = await api.post('/users', payload);
        setUsers((currentUsers) => [response.data, ...currentUsers]);
      }
      closeForm();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Impossible d’enregistrer cet utilisateur.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (account) => {
    if (account.id === currentUser?.id) return;
    if (!window.confirm(`Supprimer le compte de ${account.fullName} ?`)) return;

    setDeletingUserId(account.id);
    setListError('');
    try {
      await api.delete(`/users/${account.id}`);
      setUsers((currentUsers) => currentUsers.filter((item) => item.id !== account.id));
    } catch (error) {
      setListError(getErrorMessage(error, 'Impossible de supprimer cet utilisateur.'));
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-intro page-intro-action">
        <div>
          <p className="page-eyebrow">ADMINISTRATION</p>
          <h1>Utilisateurs</h1>
          <p className="page-subtitle">Gérez les accès et les rôles de l’équipe EventHub.</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nouvel utilisateur
        </button>
      </div>

      {listError && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{listError}</p>}

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingUser ? 'Modifier l’utilisateur' : 'Créer un utilisateur'}
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
            Mot de passe {editingUser && <span className="font-normal text-gray-500">(laisser vide pour conserver l’actuel)</span>}
            <input
              type="password"
              autoComplete={editingUser ? 'new-password' : 'new-password'}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              minLength={8}
              maxLength={100}
              required={!editingUser}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Rôle
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              disabled={editingUser?.id === currentUser?.id}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            {editingUser?.id === currentUser?.id && (
              <span className="mt-1 block text-xs font-normal text-gray-500">Vous ne pouvez pas modifier votre propre rôle.</span>
            )}
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
              {isSubmitting ? 'Enregistrement…' : editingUser ? 'Enregistrer' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Chargement des utilisateurs...</div>
      ) : (
        <Table headers={['Nom complet', 'Email', 'Rôle', 'Créé le', 'Actions']}>
          {users.map((account) => (
            <tr key={account.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {account.fullName}{account.id === currentUser?.id && <span className="ml-2 text-xs text-gray-500">(vous)</span>}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{account.email}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-700">{account.role}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {new Date(account.createdAt).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <button
                  type="button"
                  onClick={() => openEditForm(account)}
                  className="mr-4 font-medium text-blue-700 hover:text-blue-900"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(account)}
                  disabled={account.id === currentUser?.id || deletingUserId === account.id}
                  title={account.id === currentUser?.id ? 'Vous ne pouvez pas supprimer votre propre compte' : 'Supprimer le compte'}
                  className="font-medium text-red-700 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deletingUserId === account.id ? 'Suppression…' : 'Supprimer'}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-6 text-center text-sm text-gray-500">Aucun utilisateur.</td>
            </tr>
          )}
        </Table>
      )}
    </div>
  );
}