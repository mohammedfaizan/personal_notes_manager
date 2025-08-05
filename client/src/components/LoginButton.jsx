export default function LoginButton() {
    const handleLogin = () => {
      window.location.href = "https://personal-notes-manager-dhxk.onrender.com/auth/google/callback"; // backend OAuth route
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
  