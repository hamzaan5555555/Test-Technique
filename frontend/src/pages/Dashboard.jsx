import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement du dashboard...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Erreur de chargement</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      
      {/* Les cartes d'indicateurs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white p-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Total Événements</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalEvents}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white p-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Événements Publiés</dt>
          <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.publishedEvents}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white p-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">Inscriptions du jour</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.registrationsToday}</dd>
        </div>
      </div>

      {/* Top 5 des événements */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Top 5 Événements (Taux de remplissage)</h2>
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <ul className="divide-y divide-gray-200">
            {stats.topEvents.map((event) => (
              <li key={event.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Link to={`/events/${event.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {event.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {new Date(event.eventDate).toLocaleDateString()} - {event.registrationsCount}/{event.maxParticipants} places
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge status={event.status} />
                    <span className="text-sm font-bold text-gray-700">{event.fillRate}% rempli</span>
                  </div>
                </div>
              </li>
            ))}
            {stats.topEvents.length === 0 && (
              <li className="p-4 text-sm text-gray-500 text-center">Aucun événement publié pour le moment.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}