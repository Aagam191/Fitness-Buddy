import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on application mount
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('access_token');
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('email');
      const ispremium = localStorage.getItem('ispremiumuser');

      if (token && username) {
        setUser({
          username,
          email,
          isPremiumUser: ispremium === 'true',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const response = await loginUser({ username, password });
    const data = response.data;

    if (data.status === 'success') {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
      localStorage.setItem('ispremiumuser', String(data.isPremiumUser));

      setUser({
        username: data.username,
        email: data.email,
        isPremiumUser: Boolean(data.isPremiumUser),
      });

      return { success: true, data };
    }
    return { success: false, message: data.message || 'Login failed' };
  };

  const register = async (userData) => {
    const response = await registerUser(userData);
    const data = response.data;

    if (data.status === 'success') {
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      localStorage.setItem('username', userData.username);
      localStorage.setItem('email', userData.email);
      localStorage.setItem('ispremiumuser', 'false');

      setUser({
        username: userData.username,
        email: userData.email,
        isPremiumUser: false,
      });

      return { success: true, data };
    }
    return { success: false, message: data.message || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('ispremiumuser');
    setUser(null);
  };

  const setPremium = (status = true) => {
    localStorage.setItem('ispremiumuser', String(status));
    setUser((prev) => (prev ? { ...prev, isPremiumUser: Boolean(status) } : null));
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isPremiumUser: Boolean(user?.isPremiumUser),
    loading,
    login,
    register,
    logout,
    setPremium,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
