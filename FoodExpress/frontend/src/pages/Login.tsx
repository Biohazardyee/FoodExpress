import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.tsx";
import { jwtDecode } from "jwt-decode";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      console.log("Server response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setMessage("Invalid server response");
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      const decoded = jwtDecode<any>(data.token);
      setUser(decoded);
      setMessage("Login successful ✅");

      setEmail("");
      setPassword("");

      // Wait 2 seconds then redirect
      setTimeout(() => {
        navigate("/"); // home page
      }, 2000);
    } catch {
      setMessage("Server error");
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="auth-btn">
          Login
        </button>
      </form>

      <p className="auth-message">{message}</p>
    </div>
  );
}

export default Login;
