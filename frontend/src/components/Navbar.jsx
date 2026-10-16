import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CalendarDays, Users, UserRoundCog, LogOut, PanelTop } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

   
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <aside className="app-sidebar">
      <Link to="/dashboard" className="brand-lockup" aria-label="EventHub, accueil">
        <span className="brand-symbol"><PanelTop size={19} strokeWidth={2.2} /></span>
        <span className="brand-name">event<span>hub</span><small>ORGANISATION</small></span>
      </Link>

      <div className="sidebar-section-label">ESPACE DE TRAVAIL</div>
      <nav className="primary-nav" aria-label="Navigation principale">
        <Link to="/dashboard" className={isActive('/dashboard') ? 'nav-item is-active' : 'nav-item'}>
          <LayoutDashboard size={18} strokeWidth={1.8} /> <span>Vue d’ensemble</span>
        </Link>
        <Link to="/events" className={isActive('/events') ? 'nav-item is-active' : 'nav-item'}>
          <CalendarDays size={18} strokeWidth={1.8} /> <span>Événements</span>
        </Link>
        <Link to="/participants" className={isActive('/participants') ? 'nav-item is-active' : 'nav-item'}>
          <Users size={18} strokeWidth={1.8} /> <span>Participants</span>
        </Link>
        {user?.role === 'admin' && (
          <Link to="/users" className={isActive('/users') ? 'nav-item is-active' : 'nav-item'}>
            <UserRoundCog size={18} strokeWidth={1.8} /> <span>Utilisateurs</span>
          </Link>
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="profile-block">
          <span className="profile-avatar" aria-hidden="true">
            {user?.fullName?.trim()?.charAt(0)?.toUpperCase() || 'E'}
          </span>
          <span className="profile-copy">
            <strong>{user?.fullName || 'Compte EventHub'}</strong>
            <small>{user?.role === 'admin' ? 'Administrateur' : 'Équipe événementielle'}</small>
          </span>
        </div>
        <button type="button" onClick={logout} className="signout-button">
          <LogOut size={17} strokeWidth={1.8} /> Se déconnecter
        </button>
        <p className="sidebar-version">EVENTHUB <span>•</span> GESTION</p>
      </div>
    </aside>
  );
}