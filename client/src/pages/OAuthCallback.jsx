import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const hasRun = useRef(false); // <-- prevents running twice

  useEffect(() => {
    if (hasRun.current) return;  // <-- already handled
    hasRun.current = true;

    const handleAuth = async () => {
      const token = searchParams.get('token') || localStorage.getItem('token'); 
      console.log('Token from URL or storage:', token);

      if (!token) {
        setError('No token found in URL');
        navigate('/login', { replace: true, state: { error: 'No token provided' } });
        return;
      }

      try {
        localStorage.setItem('token', token);
        await login();
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.message);
        localStorage.removeItem('token');
        navigate('/login', { replace: true, state: { error: err.message } });
      }
    };

    handleAuth();
  }, [navigate, login, searchParams]);

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return <div className="text-center mt-10">Processing login...</div>;
};

export default OAuthCallback;
