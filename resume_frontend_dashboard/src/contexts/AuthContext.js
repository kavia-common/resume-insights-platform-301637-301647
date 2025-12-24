import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'resume_insights_auth';

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides auth state (token/user) and auth actions to the app. */
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) setToken(parsed.token);
        if (parsed?.user) setUser(parsed.user);
      }
    } catch {
      // ignore corrupt storage
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist to storage
  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  }, [token, user, isLoading]);

  // PUBLIC_INTERFACE
  const login = async (email, password) => {
    /** Authenticate and store token+user. */
    const data = await api.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  // PUBLIC_INTERFACE
  const register = async (full_name, email, password) => {
    /** Register and store token+user. */
    const data = await api.register(full_name, email, password);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  // PUBLIC_INTERFACE
  const refreshMe = async () => {
    /** Refresh user information using existing token. */
    if (!token) return null;
    const me = await api.getMe(token);
    setUser(me);
    return me;
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    /** Clear auth state. */
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ token, user, isLoading, login, register, logout, refreshMe }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
