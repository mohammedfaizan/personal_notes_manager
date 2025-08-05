import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (token) {
        try {
          console.log('Token received, storing and logging in...');
          localStorage.setItem('token', token);
          await login();
          console.log('Login successful, redirecting to home...');
          navigate('/');
        } catch (err) {
          console.error('Login failed:', err);
          navigate('/login?error=auth_failed');
        }
      } else if (error) {
        console.error('OAuth error:', error);
        navigate(`/login?error=${error}`);
      } else {
        console.error('No token or error in URL');
        navigate('/login?error=no_token');
      }
    };

    handleCallback();
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;