import { useState, useEffect } from "react";
import InputContainer from "./components/InputContainer";
import TodoContainer from "./components/TodoContainer";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

const API_URL = "https://todolist-r9lu.onrender.com/api/todos";

const DEFAULT_SAMPLE_TODOS = [
  {
    id: "task-1",
    text: "Admin review of team objectives",
    completed: false,
    userEmail: "reshmaa@gmail.com",
    userName: "Reshmaa",
  },
  {
    id: "task-2",
    text: "Update client project roadmap",
    completed: false,
    userEmail: "user@gmail.com",
    userName: "User",
  },
  {
    id: "task-3",
    text: "Prepare weekly deliverables report",
    completed: true,
    userEmail: "alex@gmail.com",
    userName: "Alex Morgan",
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
    user: savedUser ? JSON.parse(savedUser) : null,
  };
}

export default function App() {
  const initialAuth = getInitialAuth();
  const [token, setToken] = useState(initialAuth.token);
  const [user, setUser] = useState(initialAuth.user);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState("todos"); // 'todos' | 'admin'
  const [adminScope, setAdminScope] = useState("all"); // 'all' | 'mine' | 'others'
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'completed'
  const [inputVal, setInputVal] = useState("");

  const isAdmin = user?.role === "admin";

  // =================================================
  // TODOS STATE
  // =================================================
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("taskmaster_todos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return DEFAULT_SAMPLE_TODOS;
      }
    }
    return DEFAULT_SAMPLE_TODOS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("taskmaster_todos", JSON.stringify(todos));
  }, [todos]);

  // Load from remote backend if authenticated
  useEffect(() => {
    if (!token || token.startsWith("token-")) return;

    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load todos");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Normalize user info if populated from backend
          const normalized = data.map((t) => ({
            ...t,
            id: t.id || t._id,
            userName: t.userId?.name || t.userName,
            userEmail: t.userId?.email || t.userEmail,
          }));
          setTodos(normalized);
        }
      })
      .catch((err) => {
        console.warn("Using local tasks:", err);
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
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setActiveTab("todos");
  }

  // =================================================
  // TODO CRUD ACTIONS
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
      userEmail: user?.email || "user@gmail.com",
      userName: user?.name || "User",
      userId: user?.id || user?._id || "uid-" + Date.now(),
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInputVal("");

    if (token && !token.startsWith("token-")) {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: trimmed }),
        });
        const serverTodo = await res.json();
        if (res.ok && serverTodo && (serverTodo.id || serverTodo._id)) {
          setTodos((prev) =>
            prev.map((t) =>
              t.id === newTodo.id
                ? {
                    ...serverTodo,
                    id: serverTodo.id || serverTodo._id,
                    userEmail: serverTodo.userId?.email || user?.email,
                    userName: serverTodo.userId?.name || user?.name,
                  }
                : t
            )
          );
        }
      } catch (err) {
        console.warn("Saved locally:", err);
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

    if (token && !token.startsWith("token-")) {
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
        console.warn("Updated locally:", err);
      }
    }
  }

  async function delTodo(id) {
    setTodos((prev) =>
      prev.filter((todo) => todo.id !== id && todo._id !== id)
    );

    if (token && !token.startsWith("token-")) {
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

  // =================================================
  // ACCESS CONTROL & FILTERING
  // User can ONLY access their own tasks.
  // Admin can access their own tasks AND also other users' tasks!
  // =================================================
  const accessibleTodos = todos.filter((todo) => {
    if (isAdmin) {
      // Admin accesses all tasks
      return true;
    }
    // Standard user ONLY accesses their own tasks
    const isOwner =
      todo.userEmail === user?.email ||
      todo.userId === user?.id ||
      todo.userId === user?._id ||
      todo.userId?._id === user?.id ||
      (!todo.userEmail && !todo.userId); // fallback for unassigned tasks

    return isOwner;
  });

  // Admin Scope Filtering (All | My Tasks | Others' Tasks)
  const scopedTodos = accessibleTodos.filter((todo) => {
    if (!isAdmin || adminScope === "all") return true;

    const isMine =
      todo.userEmail === user?.email ||
      todo.userId === user?.id ||
      todo.userId === user?._id;

    if (adminScope === "mine") return isMine;
    if (adminScope === "others") return !isMine;
    return true;
  });

  // Status Filter (All | Active | Completed)
  const filteredTodos = scopedTodos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  // Calculate Metrics from Accessible Tasks
  const totalTasks = accessibleTodos.length;
  const completedTasks = accessibleTodos.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Counts for Admin Scope buttons
  const myTasksCount = accessibleTodos.filter(
    (t) =>
      t.userEmail === user?.email ||
      t.userId === user?.id ||
      t.userId === user?._id
  ).length;
  const otherTasksCount = totalTasks - myTasksCount;

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
    <main className="app-card">
      {/* HEADER */}
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
              <span className="user-name">
                {user?.name || "User"}{" "}
                <span className={`role-badge ${user?.role || "user"}`}>
                  {user?.role || "user"}
                </span>
              </span>
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="admin-toggle-btn"
              onClick={() =>
                setActiveTab(activeTab === "todos" ? "admin" : "todos")
              }
            >
              {activeTab === "todos" ? "Admin Panel" : "My Tasks"}
            </button>
          )}

          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ADMIN PANEL OR TASKS */}
      {activeTab === "admin" && isAdmin ? (
        <AdminDashboard
          token={token}
          onBackToTasks={() => setActiveTab("todos")}
        />
      ) : (
        <>
          {/* STATS */}
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

          {/* ADMIN TASK SCOPE CONTROLS (Only visible to Admin) */}
          {isAdmin && (
            <div className="admin-scope-bar">
              <span className="scope-title">View Tasks:</span>
              <button
                type="button"
                className={`scope-btn ${adminScope === "all" ? "active" : ""}`}
                onClick={() => setAdminScope("all")}
              >
                All Users ({totalTasks})
              </button>
              <button
                type="button"
                className={`scope-btn ${adminScope === "mine" ? "active" : ""}`}
                onClick={() => setAdminScope("mine")}
              >
                My Tasks ({myTasksCount})
              </button>
              <button
                type="button"
                className={`scope-btn ${adminScope === "others" ? "active" : ""}`}
                onClick={() => setAdminScope("others")}
              >
                Other Users ({otherTasksCount})
              </button>
            </div>
          )}

          {/* INPUT CONTAINER */}
          <InputContainer
            inputVal={inputVal}
            writeTodo={writeTodo}
            addTodo={addTodo}
          />

          {/* FILTER BUTTONS */}
          <div className="filter-buttons">
            <button
              type="button"
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({scopedTodos.length})
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === "active" ? "active" : ""}`}
              onClick={() => setFilter("active")}
            >
              Active ({scopedTodos.filter((t) => !t.completed).length})
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed ({scopedTodos.filter((t) => t.completed).length})
            </button>
          </div>

          {/* TODO LIST */}
          <TodoContainer
            todos={filteredTodos}
            updateTodo={updateTodo}
            delTodo={delTodo}
            isAdmin={isAdmin}
            currentUser={user}
          />
        </>
      )}
    </main>
  );
}