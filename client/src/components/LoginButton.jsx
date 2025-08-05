export default function LoginButton() {
    const handleLogin = () => {
      // Use the full URL with the correct protocol (https)
      window.location.href = `${window.location.origin}/api/auth/google`;
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