import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, Users, UserCog, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // هاد الفونكسيون كتعرف واش حنا فديك الصفحة باش تسطر عليها بالزرق
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* اللوغو */}
            <div className="flex flex-shrink-0 items-center">
              <span className="text-xl font-bold text-blue-600">EventHub</span>
            </div>
            
            {/* الروابط ديال الصفحات */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link to="/dashboard" className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${isActive('/dashboard') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Link>
              <Link to="/events" className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${isActive('/events') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                <Calendar className="mr-2 h-4 w-4" /> Événements
              </Link>
              <Link to="/participants" className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${isActive('/participants') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                <Users className="mr-2 h-4 w-4" /> Participants
              </Link>
              {user?.role === 'admin' && (
                <Link to="/users" className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${isActive('/users') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                  <UserCog className="mr-2 h-4 w-4" /> Utilisateurs
                </Link>
              )}
            </div>
          </div>

          {/* معلومات اليوزر وزر الخروج */}
          <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-600">
              {user?.fullName} <span className="text-xs font-bold text-blue-600">({user?.role})</span>
            </span>
            <button 
              onClick={logout} 
              className="rounded-md bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              title="Se déconnecter"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}