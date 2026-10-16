import axios from 'axios';

// كانصايبو نسخة من axios بالرابط ديال الباكاند
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor 1: كيتزاد قبل ما تمشي أي Request
// اللوجيك: كيهز الساروت (Token) من localStorage وكيلصقو فـ Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor 2: كيتزاد ملي كيرجع الجواب (Response) من الباكاند
// اللوجيك: إيلا الباكاند رجع 401 (يعني الساروت تسالا أو غالط)، كيمسحو من المتصفح ويصيفطك لصفحة Login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // نمسحو الداتا ديال اليوزر حيت الساروت مات
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // نصيفطوه لصفحة تسجيل الدخول (إيلا ماكانش ديجا فيها)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;