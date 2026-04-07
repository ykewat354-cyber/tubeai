import { useState, useEffect, useCallback } from 'react';
import { auth } from '../services/api';

/**
 * Custom hook for authentication state
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const data = await auth.getProfile();
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await auth.login(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await auth.register(name, email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('token');
    } catch {}
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  return { user, loading, error, login, register, logout };
}
