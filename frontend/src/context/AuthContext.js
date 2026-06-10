import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('hr_user') || 'null'));
  const [token, setToken]     = useState(() => localStorage.getItem('hr_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('hr_token', t);
    localStorage.setItem('hr_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password, role: 'candidate' });
    const { token: t, user: u } = res.data;
    localStorage.setItem('hr_token', t);
    localStorage.setItem('hr_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
    setToken(null);
    setUser(null);
  };

  const isHR    = user?.role === 'admin' || user?.role === 'hr_manager';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isHR, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
