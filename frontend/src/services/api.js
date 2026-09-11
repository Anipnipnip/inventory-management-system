import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attaches the JWT to every outgoing request, so individual API calls
// never have to remember to add the Authorization header themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server rejects a request as unauthorized (expired/invalid
// token, or an account deactivated mid-session), the session is no
// longer valid -- clear it and send the user back to login. Login and
// register requests are excluded: a wrong password there is a normal
// 401 that belongs on the form itself, not a reason to redirect away
// from it.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest =
      error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
