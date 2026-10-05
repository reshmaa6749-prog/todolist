// import { useState, useEffect } from "react";
// import "./App.css";

// import InputContainer from "./components/InputContainer";
// import TodoContainer from "./components/TodoContainer";
// import Login from "./components/Login";
// import Register from "./components/Register";

// const API_URL = "https://todolist-r9lu.onrender.com/api/todos";

// function App() {
//   // =================================================
//   // TODO STATES
//   // =================================================
//   const [inputVal, setInputVal] = useState("");
//   const [todos, setTodos] = useState([]);

//   // =================================================
//   // AUTH STATES
//   // =================================================
//   const [token, setToken] = useState(() => localStorage.getItem("token"));
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });
//   const [showRegister, setShowRegister] = useState(false);

//   // =================================================
//   // HANDLE GOOGLE OAUTH REDIRECT & TOKEN DECODING
//   // =================================================
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));

//     const googleToken = urlParams.get("token") || hashParams.get("token");

//     if (googleToken) {
//       try {
//         const payload = JSON.parse(
//           atob(
//             googleToken
//               .split(".")[1]
//               .replace(/-/g, "+")
//               .replace(/_/g, "/")
//           )
//         );

//         const googleUser = {
//           id: payload.userId,
//           name: payload.name,
//           email: payload.email,
//         };

//         localStorage.setItem("token", googleToken);
//         localStorage.setItem("user", JSON.stringify(googleUser));

//         setToken(googleToken);
//         setUser(googleUser);

//         window.history.replaceState(
//           {},
//           document.title,
//           window.location.pathname
//         );
//       } catch (err) {
//         console.error("Google token processing error:", err);
//       }
//     }
//   }, []);

//   // =================================================
//   // NORMAL LOGIN HANDLER
//   // =================================================
//   function handleLogin(data) {
//     localStorage.setItem("token", data.token);
//     localStorage.setItem("user", JSON.stringify(data.user));
//     setToken(data.token);
//     setUser(data.user);
//   }

//   // =================================================
//   // LOGOUT HANDLER
//   // =================================================
//   function logout() {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setToken(null);
//     setUser(null);
//     setTodos([]);
//   }

//   // =================================================
//   // FETCH TODOS
//   // =================================================
//   useEffect(() => {
//     if (!token) return;

//     fetch(API_URL, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error("Failed to load todos");
//         }
//         return res.json();
//       })
//       .then((data) => setTodos(data))
//       .catch((err) => console.error("Error loading todos:", err));
//   }, [token]);

//   // =================================================
//   // TODO CRUD ACTIONS
//   // =================================================
//   function writeTodo(e) {
//     setInputVal(e.target.value);
//   }

//   async function addTodo() {
//     if (!inputVal.trim()) return;

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ text: inputVal }),
//       });

//       const newTodo = await res.json();

//       if (!res.ok) {
//         console.error(newTodo.error);
//         return;
//       }

//       setTodos((prev) => [...prev, newTodo]);
//       setInputVal("");
//     } catch (err) {
//       console.error("Error adding todo:", err);
//     }
//   }

//   async function updateTodo(id, updatedFields) {
//     try {
//       const res = await fetch(`${API_URL}/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(updatedFields),
//       });

//       const updatedTodo = await res.json();

//       if (!res.ok) {
//         console.error(updatedTodo.error);
//         return;
//       }

//       setTodos((prev) =>
//         prev.map((todo) => (todo.id === id ? updatedTodo : todo))
//       );
//     } catch (err) {
//       console.error("Error updating todo:", err);
//     }
//   }

//   async function delTodo(id) {
//     try {
//       const res = await fetch(`${API_URL}/${id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         console.error(data.error);
//         return;
//       }

//       setTodos((prev) => prev.filter((todo) => todo.id !== id));
//     } catch (err) {
//       console.error("Error deleting todo:", err);
//     }
//   }

//   // =================================================
//   // AUTH VIEWS (LOGIN / REGISTER)
//   // =================================================
//   if (!token) {
//     if (showRegister) {
//       return <Register onShowLogin={() => setShowRegister(false)} />;
//     }
//     return (
//       <Login
//         onLogin={handleLogin}
//         onShowRegister={() => setShowRegister(true)}
//       />
//     );
//   }

//   // =================================================
//   // TODO VIEW
//   // =================================================
//   return (
//     <main className="todo-app">
//       <header className="top-bar">
//         <h1 className="app-title">To Do List</h1>
//         <div className="user-profile">
//           <div className="user-header">
//             <span className="welcome-text">
//               Welcome, <strong>{user?.name || "User"}</strong>
//             </span>
//             <button className="logout-btn" onClick={logout}>
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       <InputContainer
//         inputVal={inputVal}
//         writeTodo={writeTodo}
//         addTodo={addTodo}
//       />

//       <TodoContainer
//         todos={todos}
//         updateTodo={updateTodo}
//         delTodo={delTodo}
//       />
//     </main>
//   );
// }

// export default App;


import { useState, useEffect } from "react";
import "./App.css";

import InputContainer from "./components/InputContainer";
import TodoContainer from "./components/TodoContainer";
import Login from "./components/Login";
import Register from "./components/Register";

const API_URL = "https://todolist-r9lu.onrender.com/api/todos";

function App() {
  // =================================================
  // TODO STATES & FILTER
  // =================================================
  const [inputVal, setInputVal] = useState("");
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'completed'

  // =================================================
  // AUTH STATES
  // =================================================
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showRegister, setShowRegister] = useState(false);

  // =================================================
  // HANDLE GOOGLE OAUTH REDIRECT & TOKEN DECODING
  // =================================================
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));

    const googleToken = urlParams.get("token") || hashParams.get("token");

    if (googleToken) {
      try {
        const payload = JSON.parse(
          atob(
            googleToken
              .split(".")[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/")
          )
        );

        const googleUser = {
          id: payload.userId,
          name: payload.name,
          email: payload.email,
        };

        localStorage.setItem("token", googleToken);
        localStorage.setItem("user", JSON.stringify(googleUser));

        setToken(googleToken);
        setUser(googleUser);

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (err) {
        console.error("Google token processing error:", err);
      }
    }
  }, []);

  // =================================================
  // NORMAL LOGIN HANDLER
  // =================================================
  function handleLogin(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  // =================================================
  // LOGOUT HANDLER
  // =================================================
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setTodos([]);
  }

  // =================================================
  // FETCH TODOS
  // =================================================
  useEffect(() => {
    if (!token) return;

    fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load todos");
        }
        return res.json();
      })
      .then((data) => setTodos(data))
      .catch((err) => console.error("Error loading todos:", err));
  }, [token]);

  // =================================================
  // TODO CRUD ACTIONS
  // =================================================
  function writeTodo(e) {
    setInputVal(e.target.value);
  }

  async function addTodo() {
    if (!inputVal.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: inputVal }),
      });

      const newTodo = await res.json();

      if (!res.ok) {
        console.error(newTodo.error);
        return;
      }

      setTodos((prev) => [...prev, newTodo]);
      setInputVal("");
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  }

  async function updateTodo(id, updatedFields) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const updatedTodo = await res.json();

      if (!res.ok) {
        console.error(updatedTodo.error);
        return;
      }

      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  }

  async function delTodo(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  }

  // =================================================
  // CALCULATED METRICS
  // =================================================
  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  // =================================================
  // AUTH VIEWS (LOGIN / REGISTER)
  // =================================================
  if (!token) {
    if (showRegister) {
      return <Register onShowLogin={() => setShowRegister(false)} />;
    }
    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  // =================================================
  // TODO VIEW
  // =================================================
  return (
    <main className="app-card">
      {/* APP HEADER */}
      <header className="app-header">
        <div className="brand-logo">
          <div className="check-icon">✓</div>
          <h1 className="app-title">TaskMaster Pro</h1>
        </div>

        <div className="user-section">
          <div className="user-badge">
            <div className="user-avatar">
              {(user?.name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || "User"}</span>
              <span className="user-email">{user?.email || "user@gmail.com"}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* DASHBOARD CARDS */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">TOTAL TASKS</span>
          <span className="stat-value">{totalTasks}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">PENDING</span>
          <span className="stat-value warning">{pendingTasks}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">COMPLETED</span>
          <span className="stat-value success">{completedTasks}</span>
        </div>
      </section>

      {/* PROGRESS BAR */}
      <section className="progress-card">
        <div className="progress-header">
          <span className="stat-label">PROGRESS</span>
          <span className="progress-percentage">{progressPercent}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </section>

      {/* INPUT CONTAINER */}
      <InputContainer
        inputVal={inputVal}
        writeTodo={writeTodo}
        addTodo={addTodo}
      />

      {/* FILTER BUTTONS */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({totalTasks})
        </button>
        <button
          className={`filter-btn ${filter === "active" ? "active" : ""}`}
          onClick={() => setFilter("active")}
        >
          Active ({pendingTasks})
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed ({completedTasks})
        </button>
      </div>

      {/* TODO LIST */}
      <TodoContainer
        todos={filteredTodos}
        updateTodo={updateTodo}
        delTodo={delTodo}
      />
    </main>
  );
}

export default App;