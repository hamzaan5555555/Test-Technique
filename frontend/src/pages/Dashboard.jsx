import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, BadgeCheck, UserRoundCheck, ArrowUpRight } from 'lucide-react';
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

  if (loading) return <div className="loading-state"><span className="loading-spinner" />Chargement des statistiques...</div>;
  if (!stats) return <div role="alert" className="rounded bg-red-50 p-4">Impossible de charger les statistiques. Vérifiez la connexion à l’API.</div>;

  const metrics = [
    { label: 'Événements au total', value: stats.totalEvents, icon: CalendarDays, tone: 'forest' },
    { label: 'Événements publiés', value: stats.publishedEvents, icon: BadgeCheck, tone: 'blue' },
    { label: 'Inscriptions aujourd’hui', value: stats.registrationsToday, icon: UserRoundCheck, tone: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-intro">
        <div>
          <p className="page-eyebrow">VOTRE ACTIVITÉ</p>
          <h1>Vue d’ensemble</h1>
          <p className="page-subtitle">Suivez l’activité et le remplissage de vos événements.</p>
        </div>
        <Link to="/events" className="text-link">
          Voir les événements <ArrowUpRight size={15} />
        </Link>
      </div>

      <dl className="metric-grid">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <div className="metric" key={label}>
            <span className={`metric-icon metric-icon-${tone}`}><Icon size={17} strokeWidth={1.9} /></span>
            <dt>{label}</dt>
            <dd>{value ?? 0}</dd>
          </div>
        ))}
      </dl>

      <section className="dashboard-section" aria-labelledby="top-events-heading">
        <div className="section-heading">
          <div>
            <h2 id="top-events-heading">Événements les plus remplis</h2>
            <p>Les cinq événements publiés avec le plus fort taux de remplissage.</p>
          </div>
          <span className="section-unit">TAUX DE REMPLISSAGE</span>
        </div>
        <div className="top-event-list">
          {stats.topEvents.map((event) => (
            <div key={event.id} className="top-event-row">
              <div>
                <Link to={`/events/${event.id}`} className="top-event-title">{event.title}</Link>
                <span className="top-event-meta">
                  {new Date(event.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  <span aria-hidden="true"> · </span>
                  {event.registrationsCount} / {event.maxParticipants} places
                </span>
              </div>
              <StatusBadge status={event.status} />
              <div className="fill-track" aria-label={`${event.fillRate}% de remplissage`}>
                <span style={{ width: `${Math.min(100, Math.max(0, event.fillRate))}%` }} />
              </div>
              <span className="fill-rate">{event.fillRate}%</span>
            </div>
          ))}
          {stats.topEvents.length === 0 && (
            <div className="dashboard-empty">Aucun événement publié pour le moment.</div>
          )}
        </div>
      </section>
    </div>
  );
}