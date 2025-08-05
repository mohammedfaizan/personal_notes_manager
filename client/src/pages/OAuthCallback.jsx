import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      login();
      window.location.href = '/';
    } else if (error) {
      console.error('OAuth error:', error);
      window.location.href = '/login?error=' + error;
    }
  }, [login]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;