import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

 
import Login from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Participants from './pages/Participants';
import RegistrationForm from './pages/RegistrationForm';
import Users from './pages/Users';

 
const MainLayout = ({ children }) => (
  <div className="app-shell">
    <Navbar />
    <div className="workspace">
      <header className="workspace-topbar">
        <div className="workspace-topbar-copy">
          <span className="workspace-kicker">ESPACE DE GESTION</span>
          <span className="workspace-context">EventHub <span aria-hidden="true">/</span> Opérations</span>
        </div>
        <span className="system-status"><span /> Services opérationnels</span>
      </header>
      <main className="workspace-content">{children}</main>
      <footer className="workspace-footer">EventHub <span>Gestion des événements et des inscriptions</span></footer>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
       
      <Route path="/login" element={<Login />} />
      
       
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/events" element={<MainLayout><Events /></MainLayout>} />
        <Route path="/events/:id" element={<MainLayout><EventDetail /></MainLayout>} />
        <Route path="/participants" element={<MainLayout><Participants /></MainLayout>} />
        <Route path="/register/:eventId" element={<MainLayout><RegistrationForm /></MainLayout>} />
      </Route>

      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path="/users" element={<MainLayout><Users /></MainLayout>} />
      </Route>

       
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}