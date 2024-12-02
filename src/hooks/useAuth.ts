import { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../types/auth';

const AUTH_STORAGE_KEY = 'chatUser';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  });

  const login = useCallback((userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  // Clear invalid auth data
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(newValue);
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };
};