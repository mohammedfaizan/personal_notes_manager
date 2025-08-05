import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      console.log('Attempting to fetch user profile...');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Auth response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Auth error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch user profile');
      }

      const data = await response.json();
      console.log('User profile fetched:', data);

      if (data.success && data.data && data.data.user) {
        setUser(data.data.user);
        return data.data.user; // <-- Return the user for immediate use
      } else {
        throw new Error('Invalid user data format');
      }
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.auth.getProfile();
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
