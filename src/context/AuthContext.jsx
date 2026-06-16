import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Always use the Railway backend URL in production
const API_BASE = import.meta.env.VITE_API_URL || '';

const AuthContext = createContext(null);

const DEMO_USER = { id: 'demo', name: 'Demo User', phone: '+94771234567', email: 'demo@hershield.app' };
const DEMO_TOKEN = 'demo-token';

function isNetworkError(err) {
  return !err.response || err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('hs_token'));
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    if (token === DEMO_TOKEN) {
      setUser(DEMO_USER);
      setDemoMode(true);
      setLoading(false);
      return;
    }
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_BASE}/api/auth/me`)
        .then(r => setUser(r.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (phone, password) => {
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, { phone, password });
      localStorage.setItem('hs_token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setToken(data.token);
      setUser(data.user);
      setDemoMode(false);
      return data;
    } catch (err) {
      if (isNetworkError(err)) {
        // Backend offline — fall through to demo mode
        throw { isDemoFallback: true };
      }
      throw err;
    }
  };

  const register = async (form) => {
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/register`, form);
      localStorage.setItem('hs_token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setToken(data.token);
      setUser(data.user);
      setDemoMode(false);
      return data;
    } catch (err) {
      if (isNetworkError(err)) {
        throw { isDemoFallback: true };
      }
      throw err;
    }
  };

  const enterDemoMode = (name = 'You') => {
    const demoUser = { ...DEMO_USER, name };
    localStorage.setItem('hs_token', DEMO_TOKEN);
    setToken(DEMO_TOKEN);
    setUser(demoUser);
    setDemoMode(true);
  };

  const logout = () => {
    localStorage.removeItem('hs_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setDemoMode(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, demoMode, login, register, logout, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
