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

import React, { useState, useEffect } from "react";
import TodoItem from "./components/TodoItem";
import "./App.css";

const API_URL = "https://todolist-r9lu.onrender.com/api/todos";

export default function App() {
  const [inputVal, setInputVal] = useState("");
  const [todos, setTodos] = useState([
    { id: "1", text: "Complete the Lecture Notes", completed: false },
    { id: "2", text: "Ready for the Mid-exam", completed: false },
    { id: "3", text: "Complete the Journal", completed: false },
    { id: "4", text: "Do the Mini-project", completed: false },
    { id: "5", text: "Complete the Assignment", completed: false },
  ]);

  // Retaining authentication, token, and role states
  const [token] = useState(() => localStorage.getItem("token"));
  const [userRole] = useState(() => localStorage.getItem("userRole") || "user");

  useEffect(() => {
    if (!token) return;
    fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setTodos(data))
      .catch((err) => console.error("Error fetching tasks:", err));
  }, [token]);

  function addTodo() {
    if (!inputVal.trim()) return;
    const newTodo = { id: Date.now().toString(), text: inputVal, completed: false };

    if (token) {
      fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      })
        .then((res) => res.json())
        .then((savedTodo) => setTodos((prev) => [...prev, savedTodo]))
        .catch(() => setTodos((prev) => [...prev, newTodo]));
    } else {
      setTodos((prev) => [...prev, newTodo]);
    }
    setInputVal("");
  }

  function updateTodo(id, updatedFields) {
    if (token) {
      fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      }).catch((err) => console.error("Update error:", err));
    }
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...updatedFields } : todo))
    );
  }

  function deleteTodo(id) {
    if (token) {
      fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => console.error("Delete error:", err));
    }
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  return (
    <div className="layout-wrapper">
      {/* Left Sidebar Illustration & Title */}
      <div className="sidebar-section">
        <div className="dot-pattern"></div>
        <h1 className="main-title">ToDo App</h1>
        <p className="main-subtitle">Let's Accomplish Tasks Together!</p>

        {/* Notebook Illustration */}
        <div className="illustration-wrapper">
          <svg className="notebook-illustration" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Spiral rings */}
            <rect x="35" y="30" width="12" height="160" rx="6" fill="#e2e8f0" />
            <circle cx="41" cy="45" r="4" fill="#cbd5e1" />
            <circle cx="41" cy="70" r="4" fill="#cbd5e1" />
            <circle cx="41" cy="95" r="4" fill="#cbd5e1" />
            <circle cx="41" cy="120" r="4" fill="#cbd5e1" />
            <circle cx="41" cy="145" r="4" fill="#cbd5e1" />
            <circle cx="41" cy="170" r="4" fill="#cbd5e1" />

            {/* Notebook Base */}
            <rect x="45" y="20" width="125" height="180" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <rect x="45" y="20" width="16" height="180" fill="#f472b6" rx="4" />

            {/* Cover details */}
            <rect x="75" y="50" width="75" height="8" rx="4" fill="#bae6fd" />
            <rect x="75" y="70" width="85" height="6" rx="3" fill="#e2e8f0" />
            <rect x="75" y="85" width="65" height="6" rx="3" fill="#e2e8f0" />
            <rect x="75" y="100" width="80" height="6" rx="3" fill="#e2e8f0" />
            <rect x="75" y="115" width="50" height="6" rx="3" fill="#e2e8f0" />

            {/* Bookmark / Pencil */}
            <rect x="135" y="135" width="10" height="45" rx="3" fill="#38bdf8" transform="rotate(-15 135 135)" />
            <polygon points="135,180 140,190 145,180" fill="#f43f5e" transform="rotate(-15 135 135)" />
          </svg>
        </div>

        <div className="bottom-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Right Task Card Panel */}
      <div className="task-panel">
        <h2 className="panel-title">Get Things Done !</h2>

        {/* Input Bar */}
        <div className="task-input-bar">
          <input
            type="text"
            placeholder="What is the task today?"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button onClick={addTodo}>Add Task</button>
        </div>

        {/* Todo List Items */}
        <div className="task-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              userRole={userRole}
              updateTodo={updateTodo}
              deleteTodo={deleteTodo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}