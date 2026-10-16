import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// جلب الصفحات
import Login from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Participants from './pages/Participants';
import RegistrationForm from './pages/RegistrationForm';
import Users from './pages/Users';

// هاد الـ Layout كيزيد Navbar الفوق أوتوماتيكيا فاع الصفحات
const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      {children}
    </main>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* صفحة تسجيل الدخول (مافيهاش Navbar) */}
      <Route path="/login" element={<Login />} />
      
      {/* الصفحات المحمية (خصك تكون مكونيكطي باش تشوفهم) */}
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

      {/* إيلا اليوزر دخل لشي مسار ماكاينش، ردو للداشبورد */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}