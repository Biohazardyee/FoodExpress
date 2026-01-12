import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        setMessage("Invalid server response");
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Signup failed");
        return;
      }

      setMessage("Account created successfully ✅ You can now log in.");

      // Optional: clear form
      setUsername("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch {
      setMessage("Server error");
    }
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>

      <form onSubmit={handleSignup} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

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
          Sign Up
        </button>
      </form>

      <p className="auth-message">{message}</p>
    </div>
  );
}

export default Signup;
