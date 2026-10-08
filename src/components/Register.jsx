// import { useState } from "react";

// const REGISTER_URL = "https://todolist-r9lu.onrender.com/api/register";
// const GOOGLE_LOGIN_URL = "https://todolist-r9lu.onrender.com/auth/google";

// function Register({ onShowLogin }) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("user");

//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   async function handleRegister(e) {
//     e.preventDefault();

//     setMessage("");
//     setError("");

//     try {
//       const res = await fetch(REGISTER_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: name,
//           email: email,
//           password: password,
//           role: role,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Registration failed");
//         return;
//       }

//       setMessage("Registration successful. Please login.");

//       setName("");
//       setEmail("");
//       setPassword("");
//       setRole("user");
//     } catch (err) {
//       console.error(err);
//       setError("Unable to connect to server");
//     }
//   }

//   function handleGoogleRegister() {
//     window.location.href = GOOGLE_LOGIN_URL;
//   }

//   return (
//     <div className="auth-container">
//       <h2>Register</h2>

//       <form onSubmit={handleRegister}>
//         <input
//           type="text"
//           placeholder="Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />

//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <div className="role-field">
//           <label htmlFor="role-select">Register As:</label>
//           <select
//             id="role-select"
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//             className="role-dropdown"
//           >
//             <option value="user">User</option>
//             <option value="admin">Admin</option>
//           </select>
//         </div>

//         <button type="submit">Register</button>
//       </form>

//       {message && <p className="success">{message}</p>}
//       {error && <p className="error">{error}</p>}

//       <div className="divider">
//         <span>OR</span>
//       </div>

//       <button
//         type="button"
//         className="google-btn"
//         onClick={handleGoogleRegister}
//       >
//         Continue with Google
//       </button>

//       <p>
//         Already have an account?{" "}
//         <button type="button" onClick={onShowLogin}>
//           Login
//         </button>
//       </p>
//     </div>
//   );
// }

// export default Register;

import { useState } from "react";
import { motion } from "framer-motion";

const REGISTER_URL = "https://todolist-r9lu.onrender.com/api/register";
const GOOGLE_LOGIN_URL = "https://todolist-r9lu.onrender.com/auth/google";

const easeCustom = [0.16, 1, 0.3, 1];

function Register({ onShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          role: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setMessage("Registration successful. Please login.");

      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    }
  }

  function handleGoogleRegister() {
    window.location.href = GOOGLE_LOGIN_URL;
  }

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.25, ease: easeCustom }}
      >
        <h2 className="auth-title">Register</h2>

        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          <div className="role-field">
            <label htmlFor="role-select">Register As:</label>
            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="role-dropdown"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="login-submit-btn"
          >
            Register
          </motion.button>
        </form>

        {message && (
          <motion.p
            className="success"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {message}
          </motion.p>
        )}

        {error && (
          <motion.p
            className="error"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.015, backgroundColor: "#f8fafc" }}
          whileTap={{ scale: 0.98 }}
          type="button"
          className="google-btn"
          onClick={handleGoogleRegister}
        >
          Continue with Google
        </motion.button>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <button type="button" onClick={onShowLogin}>
            Login
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;