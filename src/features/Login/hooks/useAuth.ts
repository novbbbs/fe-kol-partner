import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = authService.getToken();
    const currentUser = authService.getUser();

    if (token && currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login'; // Sesuaikan route halaman login Anda
  };

  return {
    isAuthenticated,
    user,
    loading,
    logout,
  };
}