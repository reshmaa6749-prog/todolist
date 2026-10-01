import { useState } from "react";

const REGISTER_URL = "https://todolist-r9lu.onrender.com/api/register"

const GOOGLE_LOGIN_URL = "http://localhost:5000/auth/google";

function Register({ onShowLogin }) {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: name,
          email: email,
          password: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setMessage(
        "Registration successful. Please login."
      );

      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to server"
      );
    }
  }

  function handleGoogleRegister() {
    window.location.href = GOOGLE_LOGIN_URL;
  }

  return (
    <div className="auth-container">

      <h2>Register</h2>

      <form onSubmit={handleRegister}>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Register
        </button>

      </form>

      {message && (
        <p className="success">
          {message}
        </p>
      )}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <div className="divider">
        <span>OR</span>
      </div>

      <button
        type="button"
        className="google-btn"
        onClick={handleGoogleRegister}
      >
        Continue with Google
      </button>

      <p>
        Already have an account?

        <button
          type="button"
          onClick={onShowLogin}
        >
          Login
        </button>
      </p>

    </div>
  );
}

export default Register;