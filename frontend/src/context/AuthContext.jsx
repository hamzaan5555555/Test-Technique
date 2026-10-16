import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

 
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

   
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
           
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

   
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;
    
     
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
     
    setUser(userData);
    return userData;
  };

   
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
     
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user,  
      isAdmin: user?.role === 'admin'  
    }}>
       
      {!loading && children}
    </AuthContext.Provider>
  );
};

 
export const useAuth = () => {
  return useContext(AuthContext);
};