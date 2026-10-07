import React, { useState } from "react";

const LOGIN_URL = "https://todolist-r9lu.onrender.com/api/login";
const GOOGLE_LOGIN_URL = "https://todolist-r9lu.onrender.com/auth/google";

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      onLogin(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    }
  }

  function handleGoogleLogin() {
    window.location.href = GOOGLE_LOGIN_URL;
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="reshmaa@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-submit-btn">
            Login
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-submit-btn"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </button>

        {error && <p className="error">{error}</p>}

        <p className="auth-footer-text">
          Don't have an account?{" "}
          <button type="button" onClick={onShowRegister}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;