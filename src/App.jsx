// import { useState, useEffect } from "react";
// import "./App.css";

// import InputContainer from "./components/InputContainer";
// import TodoContainer from "./components/TodoContainer";
// import Login from "./components/Login";
// import Register from "./components/Register";
// import AdminDashboard from "./components/AdminDashboard";

// const API_URL = "https://todolist-r9lu.onrender.com/api/todos";

// function App() {
//   // =================================================
//   // TODO STATES & FILTER
//   // =================================================
//   const [inputVal, setInputVal] = useState("");
//   const [todos, setTodos] = useState([]);
//   const [filter, setFilter] = useState("all");

//   // =================================================
//   // AUTH & NAVIGATION STATES
//   // =================================================
//   const [token, setToken] = useState(() => localStorage.getItem("token"));
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });
//   const [showRegister, setShowRegister] = useState(false);
//   const [activeTab, setActiveTab] = useState("todos"); // 'todos' | 'admin'

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
//           role: payload.role || "user", // Extract role from token
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
//     setActiveTab("todos");
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
//   // CALCULATED METRICS
//   // =================================================
//   const totalTasks = todos.length;
//   const completedTasks = todos.filter((t) => t.completed).length;
//   const pendingTasks = totalTasks - completedTasks;
//   const progressPercent =
//     totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

//   const filteredTodos = todos.filter((todo) => {
//     if (filter === "active") return !todo.completed;
//     if (filter === "completed") return todo.completed;
//     return true;
//   });

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
//   // MAIN VIEW
//   // =================================================
//   return (
//     <main className="app-card">
//       {/* APP HEADER */}
//       <header className="app-header">
//         <div className="brand-logo">
//           <div className="check-icon">✓</div>
//           <h1 className="app-title">TaskMaster Pro</h1>
//         </div>

//         <div className="user-section">
//           <div className="user-badge">
//             <div className="user-avatar">
//               {(user?.name || user?.email || "U")[0].toUpperCase()}
//             </div>
//             <div className="user-info">
//               <span className="user-name">
//                 {user?.name || "User"}{" "}
//                 <strong className={`role-badge ${user?.role || "user"}`}>
//                   [{user?.role || "user"}]
//                 </strong>
//               </span>
//               <span className="user-email">
//                 {user?.email || "user@gmail.com"}
//               </span>
//             </div>
//           </div>

//           {/* ADMIN TOGGLE BUTTON - ONLY VISIBLE TO ADMINS */}
//           {user?.role === "admin" && (
//             <button
//               className="admin-toggle-btn"
//               onClick={() =>
//                 setActiveTab(activeTab === "todos" ? "admin" : "todos")
//               }
//             >
//               {activeTab === "todos" ? "Admin Panel" : "My Tasks"}
//             </button>
//           )}

//           <button className="logout-btn" onClick={logout}>
//             Logout
//           </button>
//         </div>
//       </header>

//       {/* RENDER ADMIN DASHBOARD IF ACTIVE TAB IS ADMIN */}
//       {activeTab === "admin" && user?.role === "admin" ? (
//         <AdminDashboard token={token} />
//       ) : (
//         <>
//           {/* DASHBOARD CARDS */}
//           <section className="stats-grid">
//             <div className="stat-card">
//               <span className="stat-label">TOTAL TASKS</span>
//               <span className="stat-value">{totalTasks}</span>
//             </div>
//             <div className="stat-card">
//               <span className="stat-label">PENDING</span>
//               <span className="stat-value warning">{pendingTasks}</span>
//             </div>
//             <div className="stat-card">
//               <span className="stat-label">COMPLETED</span>
//               <span className="stat-value success">{completedTasks}</span>
//             </div>
//           </section>

//           {/* PROGRESS BAR */}
//           <section className="progress-card">
//             <div className="progress-header">
//               <span className="stat-label">PROGRESS</span>
//               <span className="progress-percentage">{progressPercent}%</span>
//             </div>
//             <div className="progress-track">
//               <div
//                 className="progress-fill"
//                 style={{ width: `${progressPercent}%` }}
//               ></div>
//             </div>
//           </section>

//           {/* INPUT CONTAINER */}
//           <InputContainer
//             inputVal={inputVal}
//             writeTodo={writeTodo}
//             addTodo={addTodo}
//           />

//           {/* FILTER BUTTONS */}
//           <div className="filter-buttons">
//             <button
//               className={`filter-btn ${filter === "all" ? "active" : ""}`}
//               onClick={() => setFilter("all")}
//             >
//               All ({totalTasks})
//             </button>
//             <button
//               className={`filter-btn ${filter === "active" ? "active" : ""}`}
//               onClick={() => setFilter("active")}
//             >
//               Active ({pendingTasks})
//             </button>
//             <button
//               className={`filter-btn ${
//                 filter === "completed" ? "active" : ""
//               }`}
//               onClick={() => setFilter("completed")}
//             >
//               Completed ({completedTasks})
//             </button>
//           </div>

//           {/* TODO LIST */}
//           <TodoContainer
//             todos={filteredTodos}
//             updateTodo={updateTodo}
//             delTodo={delTodo}
//           />
//         </>
//       )}
//     </main>
//   );
// }

// export default App;

import { useState, useEffect } from "react";
import Todo from "./Todo";
import "./App.css";

const API_URL = "https://todolist-r9lu.onrender.com/api/todos";

export default function App() {
  const [inputVal, setInputVal] = useState("");
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");

  const [token] = useState(() => localStorage.getItem("token"));
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : { name: "reshmaa", email: "reshmaa@gmail.com" };
  });

  useEffect(() => {
    if (!token) return;
    fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setTodos(data))
      .catch((err) => console.error(err));
  }, [token]);

  function addTodo() {
    if (!inputVal.trim()) return;
    const newTodo = { id: Date.now().toString(), text: inputVal, completed: false };
    setTodos((prev) => [...prev, newTodo]);
    setInputVal("");
  }

  function updateTodo(id, updatedFields) {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...updatedFields } : todo))
    );
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="app-layout">
      {/* Left Section with Notebook Icon */}
      <div className="hero-section">
        <div className="dots-grid">
          {[...Array(12)].map((_, i) => (
            <span key={i} />
          ))}
        </div>

        <h1 className="hero-title">ToDo App</h1>
        <p className="hero-subtitle">Let's Accomplish Tasks Together!</p>

        {/* Notebook Graphic Vector replacing the owl */}
        <div className="notebook-illustration">
          <svg
            className="notebook-svg"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Spiral Notebook Background */}
            <rect x="40" y="30" width="130" height="150" rx="12" fill="#38BDF8" />
            <rect x="50" y="30" width="120" height="150" rx="10" fill="#F472B6" />
            <rect x="60" y="40" width="100" height="130" rx="6" fill="#FFFFFF" />

            {/* Notebook Lines */}
            <line x1="75" y1="70" x2="145" y2="70" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
            <line x1="75" y1="95" x2="145" y2="95" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
            <line x1="75" y1="120" x2="145" y2="120" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
            <line x1="75" y1="145" x2="125" y2="145" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />

            {/* Checkmarks on page */}
            <path d="M78 69 L82 73 L90 65" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M78 94 L82 98 L90 90" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Binder Rings */}
            {[45, 65, 85, 105, 125, 145, 165].map((yVal, idx) => (
              <g key={idx}>
                <rect x="35" y={yVal - 4} width="20" height="8" rx="4" fill="#0F172A" />
                <circle cx="52" cy={yVal} r="2.5" fill="#FFFFFF" />
              </g>
            ))}

            {/* Decorative Pencil */}
            <g transform="rotate(-25 140 120)">
              <rect x="130" y="80" width="12" height="60" fill="#38BDF8" rx="2" />
              <polygon points="130,140 142,140 136,152" fill="#F472B6" />
              <rect x="130" y="75" width="12" height="8" fill="#CBD5E1" />
            </g>
          </svg>
        </div>

        <div className="bottom-dots">
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* Right ToDo Card Component */}
      <div className="todo-card">
        <header className="todo-header">
          <h2 className="todo-title">Get Things Done !</h2>
        </header>

        {user && (
          <div className="user-badge">
            <span>{user.name}</span>
            <button className="logout-btn" onClick={() => localStorage.clear()}>
              Logout
            </button>
          </div>
        )}

        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-num">{totalTasks}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{activeTasks}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{completedTasks}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="What is the task today?"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button className="add-btn" onClick={addTodo}>
            Add Task
          </button>
        </div>

        <div className="filter-tabs">
          {["all", "active", "completed"].map((type) => (
            <button
              key={type}
              className={`filter-tab ${filter === type ? "active" : ""}`}
              onClick={() => setFilter(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <p className="empty-state">No tasks to display.</p>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                updateTodo={updateTodo}
                deleteTodo={deleteTodo}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}