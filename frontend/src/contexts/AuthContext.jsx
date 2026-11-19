import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const roleLabels = {
  ADMIN: 'System Administrator',
  'STORE MANAGER': 'Store Manager',
  'STORE EMPLOYEE': 'Store Employee',
  DRIVER: 'Driver',
};

export const normalizeUser = (user) => user && ({
  ...user,
  role: roleLabels[user.role] || user.role,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      const currentUser = normalizeUser(response.data.user);
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  useEffect(() => {
    const handleExpiredSession = () => setUser(null);
    window.addEventListener('auth:expired', handleExpiredSession);
    return () => window.removeEventListener('auth:expired', handleExpiredSession);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const currentUser = normalizeUser(response.data.user);
    setUser(currentUser);
    setLoading(false);
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } finally { setUser(null); }
  }, []);

  const updateProfile = useCallback(async (profile) => {
    const response = await api.patch('/auth/me', profile);
    const updatedUser = normalizeUser(response.data.user);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const changePassword = useCallback(async (passwords) => {
    const response = await api.patch('/auth/change-password', passwords);
    return response.data;
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, refreshUser, updateProfile, changePassword, setUser }), [user, loading, login, logout, refreshUser, updateProfile, changePassword]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
