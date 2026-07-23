import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaure la session depuis localStorage au démarrage
  useEffect(() => {
    const token       = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const data = res.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    await authApi.register(payload);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isCandidate = () => user?.role === 'ROLE_CANDIDATE';
  const isRecruiter = () => user?.role === 'ROLE_RECRUITER';
  const isAdmin     = () => user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isCandidate, isRecruiter, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
