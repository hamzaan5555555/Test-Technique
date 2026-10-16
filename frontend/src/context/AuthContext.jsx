import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

// كانكرييو الـ Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // أول مرة كتحل فيها لابليكاسيون، كنفحصو واش كاين الساروت وواش مازال خدام
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // كنعيطو لـ /auth/me باش نجيبو الداتا ديال اليوزر من الباكاند
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Session expirée');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // فونكسيون ديال تسجيل الدخول
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;
    
    // كنخبيو الساروت والداتا فـ المتصفح
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // كنحطو اليوزر فـ State باش لابليكاسيون كاملة تسيق الخبار
    setUser(userData);
    return userData;
  };

  // فونكسيون ديال الخروج
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // كنردوه لصفحة تسجيل الدخول
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user, // واش مكونيكطي ولا لا (true/false)
      isAdmin: user?.role === 'admin' // واش عندو صلاحيات ديال الآدمين
    }}>
      {/* ما كنبينو الانترفاس حتى كيسالي الفحص ديال الساروت */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// هاد الـ Hook كيخلينا نعيطو لـ Auth بسهولة فـ أي بلاصة فـ الكود
export const useAuth = () => {
  return useContext(AuthContext);
};