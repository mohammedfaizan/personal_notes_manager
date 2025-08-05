export default function LoginButton() {
    const handleLogin = () => {
      // Use the full backend URL for OAuth
      const backendUrl = 'https://personal-notes-manager-dhxk.onrender.com';
      window.location.href = `${backendUrl}/auth/google`;
    };
  
    return (
      <button 
        onClick={handleLogin} 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Login with Google
      </button>
    );
  }