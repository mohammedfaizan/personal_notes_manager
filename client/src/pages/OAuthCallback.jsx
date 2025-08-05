import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (isProcessing) return;

      const token = searchParams.get('token');
      console.log('Token from URL:', token);

      if (!token) {
        setError('No token found in URL');
        navigate('/login', { replace: true, state: { error: 'No token provided' } });
        return;
      }

      try {
        setIsProcessing(true);
        localStorage.setItem('token', token);

        // Wait for login to set user and get user data
        const userData = await login();

        if (userData) {
          navigate('/dashboard', { replace: true });
        } else {
          console.error("User data missing after login");
          setError("Login failed. Please try again.");
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.message);
        localStorage.removeItem('token');
        navigate('/login', { replace: true, state: { error: err.message } });
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuth();
  }, [navigate, login, searchParams, isProcessing]);

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return <div className="text-center mt-10">Processing login...</div>;
};

export default OAuthCallback;
