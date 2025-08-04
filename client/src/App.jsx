import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/notes");
    }
  }, [navigate]);

  return (
    <div>
      {/* Routes go here */}
    </div>
  );
}

export default App;
