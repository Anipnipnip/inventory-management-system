import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Starts true: on first load we don't yet know if a stored token is
  // still valid, so routes must wait for that check instead of
  // flashing the login page before redirecting to the dashboard (or
  // vice versa).
  const [isLoading, setIsLoading] = useState(true);

  // On app start, a token may already be sitting in localStorage from
  // a previous visit. Only the token is persisted (see Phase 13
  // design notes) -- the user's name/role are always re-fetched here
  // rather than cached, so a role change made by another admin is
  // reflected on the next load instead of showing stale data.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedInUser, token } = await authService.login(email, password);
    localStorage.setItem('token', token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user: registeredUser, token } = await authService.register(name, email, password);
    localStorage.setItem('token', token);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
