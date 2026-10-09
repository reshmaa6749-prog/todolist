import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputContainer from "./components/InputContainer";
import TodoContainer from "./components/TodoContainer";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

const API_URL = "https://todolist-r9lu.onrender.com/api/todos";

const INITIAL_STARTER_TODOS = [
  {
    id: "init-1",
    text: "Review project milestones and sprint deliverables",
    completed: false,
    priority: "high",
    createdAt: new Date().toISOString(),
  },
  {
    id: "init-2",
    text: "Conduct UX review with team leads",
    completed: true,
    priority: "medium",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "init-3",
    text: "Verify API endpoints and error handling",
    completed: false,
    priority: "low",
    createdAt: new Date().toISOString(),
  },
];

function getInitialAuth() {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

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
        name: payload.name || "Google User",
        email: payload.email,
        role: payload.role || "user",
      };

      localStorage.setItem("token", googleToken);
      localStorage.setItem("user", JSON.stringify(googleUser));
      window.history.replaceState({}, document.title, window.location.pathname);
      return { token: googleToken, user: googleUser };
    } catch (err) {
      console.error("Google token decode error:", err);
    }
  }

  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");
  return {
    token: savedToken,
    user: savedUser
      ? JSON.parse(savedUser)
      : { name: "Reshmaa", email: "reshmaa@gmail.com", role: "admin" },
  };
}

export default function App() {
  const initialAuth = getInitialAuth();
  const [token, setToken] = useState(initialAuth.token);
  const [user, setUser] = useState(initialAuth.user);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState("todos"); // 'todos' | 'admin'

  // =================================================
  // THEME STATE (DARK / LIGHT)
  // =================================================
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("taskflow_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("taskflow_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  // =================================================
  // TOAST NOTIFICATIONS
  // =================================================
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = "info") {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }

  // =================================================
  // TODOS STATE & LOCAL STORAGE SYNC
  // =================================================
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("taskflow_todos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_STARTER_TODOS;
      }
    }
    return INITIAL_STARTER_TODOS;
  });

  const [inputVal, setInputVal] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Persist todos locally for instant responsiveness
  useEffect(() => {
    localStorage.setItem("taskflow_todos", JSON.stringify(todos));
  }, [todos]);

  // Load from remote backend if authenticated
  useEffect(() => {
    if (!token || token.startsWith("demo-")) return;

    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch remote todos");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTodos(data);
        }
      })
      .catch((err) => {
        console.warn("Using offline cached todos:", err);
      });
  }, [token]);

  // =================================================
  // AUTH ACTIONS
  // =================================================
  function handleLogin(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    showToast(`Welcome back, ${data.user.name || "User"}!`, "success");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setActiveTab("todos");
    showToast("Signed out successfully", "info");
  }

  // =================================================
  // TODO CRUD HANDLERS
  // =================================================
  function writeTodo(e) {
    setInputVal(e.target.value);
  }

  async function addTodo() {
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    const newTodo = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
      priority: priority,
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInputVal("");
    showToast("Task created successfully", "success");

    if (token && !token.startsWith("demo-")) {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: trimmed, priority }),
        });
        const serverTodo = await res.json();
        if (res.ok && serverTodo && (serverTodo.id || serverTodo._id)) {
          setTodos((prev) =>
            prev.map((t) => (t.id === newTodo.id ? serverTodo : t))
          );
        }
      } catch (err) {
        console.warn("Saved to local storage:", err);
      }
    }
  }

  async function updateTodo(id, updatedFields) {
    setTodos((prev) =>
      prev.map((todo) => {
        if ((todo.id && todo.id === id) || (todo._id && todo._id === id)) {
          return { ...todo, ...updatedFields };
        }
        return todo;
      })
    );

    if (updatedFields.completed !== undefined) {
      showToast(
        updatedFields.completed ? "Task marked completed" : "Task marked active",
        "info"
      );
    } else {
      showToast("Task updated", "info");
    }

    if (token && !token.startsWith("demo-")) {
      try {
        await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedFields),
        });
      } catch (err) {
        console.warn("Synced locally:", err);
      }
    }
  }

  async function delTodo(id) {
    setTodos((prev) =>
      prev.filter((todo) => todo.id !== id && todo._id !== id)
    );
    showToast("Task deleted", "info");

    if (token && !token.startsWith("demo-")) {
      try {
        await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn("Deleted locally:", err);
      }
    }
  }

  function handleClearCompleted() {
    const hasCompleted = todos.some((t) => t.completed);
    if (!hasCompleted) return;

    setTodos((prev) => prev.filter((t) => !t.completed));
    showToast("Cleared completed tasks", "info");
  }

  // =================================================
  // CALCULATED METRICS
  // =================================================
  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Filtered & Searched List
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active" && todo.completed) return false;
    if (filter === "completed" && !todo.completed) return false;
    if (search.trim()) {
      return todo.text.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  // =================================================
  // AUTH VIEWS (IF NOT LOGGED IN)
  // =================================================
  if (!token && !user) {
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
  // MAIN VIEW
  // =================================================
  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.16 }}
              className={`toast ${t.type}`}
            >
              {t.type === "success" && (
                <svg viewBox="0 0 20 20" width="16" height="16" fill="var(--success)">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              )}
              {t.type === "error" && (
                <svg viewBox="0 0 20 20" width="16" height="16" fill="var(--danger)">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
              )}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* TOP NAVBAR */}
      <header className="app-header">
        <div className="header-content">
          <div className="brand-section">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div className="brand-info">
              <div className="brand-title">
                TaskFlow
                <span className="brand-version">PRO</span>
              </div>
              <span className="brand-tagline">Minimalist SaaS Workspace</span>
            </div>
          </div>

          <div className="header-actions">
            {/* Admin Switcher */}
            {user?.role === "admin" && (
              <button
                type="button"
                className={`nav-pill-btn ${activeTab === "admin" ? "active" : ""}`}
                onClick={() =>
                  setActiveTab(activeTab === "todos" ? "admin" : "todos")
                }
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>{activeTab === "todos" ? "Admin Panel" : "My Tasks"}</span>
              </button>
            )}

            {/* Theme Toggle (Dark/Light) */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* User Profile Badge */}
            <div className="user-profile-badge">
              <div className="user-avatar-circle">
                {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-display-name">
                  {user?.name || "User"}
                </span>
                <span className={`role-pill ${user?.role || "user"}`}>
                  {user?.role || "user"}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              className="logout-icon-btn"
              onClick={handleLogout}
              title="Sign out"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="main-wrapper">
        {activeTab === "admin" && user?.role === "admin" ? (
          <AdminDashboard
            token={token}
            onBackToTasks={() => setActiveTab("todos")}
          />
        ) : (
          <>
            {/* KPI STATS CARDS */}
            <section className="metrics-grid">
              <div className="metric-card">
                <div className="metric-card-info">
                  <span className="metric-label">Total Tasks</span>
                  <span className="metric-value">{totalTasks}</span>
                </div>
                <div className="metric-icon-box total">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card-info">
                  <span className="metric-label">Active / In Progress</span>
                  <span className="metric-value">{activeTasks}</span>
                </div>
                <div className="metric-icon-box active">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card-info">
                  <span className="metric-label">Completed</span>
                  <span className="metric-value">{completedTasks}</span>
                </div>
                <div className="metric-icon-box completed">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
            </section>

            {/* PROGRESS BAR */}
            <section className="progress-card">
              <div className="progress-header">
                <div className="progress-title-wrap">
                  <span className="progress-title">Completion Rate</span>
                </div>
                <span className="progress-percent-badge">{progressPercent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </section>

            {/* TASK INPUT COMPONENT */}
            <InputContainer
              inputVal={inputVal}
              writeTodo={writeTodo}
              addTodo={addTodo}
              priority={priority}
              setPriority={setPriority}
            />

            {/* TODOS LIST & CONTROLS */}
            <TodoContainer
              todos={filteredTodos}
              updateTodo={updateTodo}
              delTodo={delTodo}
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
              totalCount={totalTasks}
              activeCount={activeTasks}
              completedCount={completedTasks}
              onClearCompleted={handleClearCompleted}
            />
          </>
        )}
      </main>
    </div>
  );
}