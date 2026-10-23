import { useState, useEffect, useRef } from "react";
import InputContainer from "./components/InputContainer";
import TodoContainer from "./components/TodoContainer";
import Sidebar from "./components/Sidebar";
import WelcomeModal from "./components/WelcomeModal";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

const API_URL = "https://todolist-r9lu.onrender.com/api/todos";

export function isPublicTodo(todo) {
  if (!todo) return false;
  return (
    todo.isPublic === true ||
    todo.isPublic === "true" ||
    todo.isPublic === 1 ||
    todo.isPublic === "1"
  );
}

const DEFAULT_SAMPLE_TODOS = [
  {
    id: "task-pub-1",
    text: "Check the box to mark items as done",
    completed: false,
    isPublic: true,
    userEmail: "alex@gmail.com",
    userName: "Alex Morgan",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-pub-2",
    text: "Click the blue New button to add a task",
    completed: false,
    isPublic: true,
    userEmail: "reshmaa@gmail.com",
    userName: "Reshmaa",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-pub-3",
    text: "See finished items in the 'Done' view",
    completed: true,
    isPublic: true,
    userEmail: "alex@gmail.com",
    userName: "Alex Morgan",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "task-priv-1",
    text: "Click the due date to change it",
    completed: false,
    isPublic: false,
    userEmail: "reshmaa@gmail.com",
    userName: "Reshmaa",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-priv-2",
    text: "Learn how private tasks stay hidden from other users",
    completed: false,
    isPublic: false,
    userEmail: "user@gmail.com",
    userName: "User",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-priv-3",
    text: "Personal journal & private notes",
    completed: false,
    isPublic: false,
    userEmail: "user@gmail.com",
    userName: "User",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function getInitialTodos() {
  const saved = localStorage.getItem("taskmaster_todos");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed.map((t) => ({
          ...t,
          isPublic: isPublicTodo(t),
        }));

        // If saved data has no public tasks (e.g. from an older app version),
        // ensure public sample tasks are merged in so Public Tasks are visible!
        const hasPublic = normalized.some((t) => isPublicTodo(t));
        if (!hasPublic) {
          const samplePublic = DEFAULT_SAMPLE_TODOS.filter((t) => isPublicTodo(t));
          return [...normalized, ...samplePublic];
        }
        return normalized;
      }
    } catch (e) {
      console.warn("Failed to parse saved todos:", e);
    }
  }
  return DEFAULT_SAMPLE_TODOS;
}

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

  // Navigation state: 'private' | 'public' | 'all' | 'admin'
  const [currentView, setCurrentView] = useState("private");

  // Task filter: 'active' (To Do) | 'completed' (Done) | 'all' (All)
  const [activeFilter, setActiveFilter] = useState("all");

  // Admin scope: 'all' | 'mine' | 'others'
  const [adminScope, setAdminScope] = useState("all");

  // Search & input state
  const [searchQuery, setSearchQuery] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [isPublicNew, setIsPublicNew] = useState(false);

  // UI Modals & Sidebar toggle
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareToast, setShareToast] = useState("");

  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  const isAdmin = user?.role === "admin";

  // Automatically sync isPublicNew when switching views
  useEffect(() => {
    if (currentView === "public") {
      setIsPublicNew(true);
    } else if (currentView === "private") {
      setIsPublicNew(false);
    }
  }, [currentView]);

  // =================================================
  // TODOS STATE
  // =================================================
  const [todos, setTodos] = useState(getInitialTodos);

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
          setTodos((prev) => {
            const prevMap = new Map(prev.map((t) => [t.id || t._id, t]));
            const serverTodos = data.map((t) => {
              const existing = prevMap.get(t.id || t._id);
              // Preserve isPublic if already marked locally or on server
              const isPub =
                t.isPublic !== undefined
                  ? isPublicTodo(t)
                  : existing && existing.isPublic !== undefined
                  ? isPublicTodo(existing)
                  : false;

              return {
                ...t,
                id: t.id || t._id,
                isPublic: isPub,
                userName: t.userId?.name || t.userName,
                userEmail: t.userId?.email || t.userEmail,
              };
            });

            // Keep any local public sample tasks so public tasks never disappear
            const existingPublicLocal = prev.filter(
              (p) => isPublicTodo(p) && !serverTodos.some((s) => s.id === p.id)
            );

            return [...serverTodos, ...existingPublicLocal];
          });
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
    setCurrentView("private");
  }

  // =================================================
  // CRUD ACTIONS
  // =================================================
  function writeTodo(e) {
    setInputVal(e.target.value);
  }

  async function addTodo() {
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    const willBePublic = currentView === "public" ? true : Boolean(isPublicNew);

    const newTodo = {
      id: "task-" + Date.now(),
      text: trimmed,
      completed: false,
      isPublic: willBePublic,
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
          body: JSON.stringify({
            text: trimmed,
            isPublic: willBePublic,
          }),
        });
        const serverTodo = await res.json();
        if (res.ok && serverTodo && (serverTodo.id || serverTodo._id)) {
          setTodos((prev) =>
            prev.map((t) =>
              t.id === newTodo.id
                ? {
                    ...serverTodo,
                    id: serverTodo.id || serverTodo._id,
                    // Preserve willBePublic if backend did not return isPublic
                    isPublic:
                      serverTodo.isPublic !== undefined
                        ? isPublicTodo(serverTodo)
                        : willBePublic,
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

  function handleRestoreSamplePublicTasks() {
    const samplePublic = DEFAULT_SAMPLE_TODOS.filter((t) => isPublicTodo(t));
    setTodos((prev) => {
      const existingIds = new Set(prev.map((t) => t.id || t._id));
      const toAdd = samplePublic.filter((s) => !existingIds.has(s.id));
      return [...toAdd, ...prev];
    });
    setShareToast("Sample public tasks added!");
    setTimeout(() => setShareToast(""), 3000);
  }

  function handleQuickNewTask(forPublic = false) {
    setIsPublicNew(forPublic);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }

  function handleFocusSearch() {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }

  function handleShareWorkspace() {
    navigator.clipboard?.writeText(window.location.href);
    setShareToast("Workspace link copied to clipboard!");
    setTimeout(() => setShareToast(""), 3000);
  }

  // =================================================
  // ACCESS CONTROL & SCOPES
  // Private: User can ONLY see their own tasks
  // Public: ALL users can see these tasks
  // =================================================
  const isTaskMine = (todo) =>
    todo.userEmail === user?.email ||
    todo.userId === user?.id ||
    todo.userId === user?._id ||
    todo.userId?._id === user?.id ||
    (!todo.userEmail && !todo.userId);

  // Filter tasks accessible to this user
  const accessibleTodos = todos.filter((todo) => {
    if (isAdmin) return true; // Admin has supervisory access
    if (isPublicTodo(todo)) return true; // Public tasks visible to all users
    return isTaskMine(todo); // Private tasks visible ONLY to owner
  });

  // Calculate Section Counts
  const privateCount = todos.filter(
    (t) => !isPublicTodo(t) && (isTaskMine(t) || isAdmin)
  ).length;
  const publicCount = todos.filter((t) => isPublicTodo(t)).length;
  const allCount = accessibleTodos.length;
  const completedCount = accessibleTodos.filter((t) => t.completed).length;

  // View Filter (Private vs Public vs All vs Admin)
  const viewScopedTodos = accessibleTodos.filter((todo) => {
    if (currentView === "private") {
      // User's private tasks (owner only)
      return !isPublicTodo(todo) && (isTaskMine(todo) || isAdmin);
    }
    if (currentView === "public") {
      // Public tasks: ALL users can see
      return isPublicTodo(todo);
    }
    return true; // 'all' view
  });

  // Admin Scope Sub-Filter (when in Admin/Scope mode)
  // In public view, do NOT filter out other users' public tasks unless explicitly requested
  const adminScopedTodos = viewScopedTodos.filter((todo) => {
    if (!isAdmin || adminScope === "all" || currentView === "public") return true;
    const isMine = isTaskMine(todo);
    if (adminScope === "mine") return isMine;
    if (adminScope === "others") return !isMine;
    return true;
  });

  // Status Filter: All | To Do (active) | Done (completed)
  const statusFilteredTodos = adminScopedTodos.filter((todo) => {
    if (activeFilter === "active") return !todo.completed;
    if (activeFilter === "completed") return todo.completed;
    return true;
  });

  // Search Filter
  const finalTodos = statusFilteredTodos.filter((todo) => {
    if (!searchQuery.trim()) return true;
    return todo.text.toLowerCase().includes(searchQuery.toLowerCase().trim());
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
  // MAIN NOTION WORKSPACE VIEW
  // =================================================
  return (
    <div className="notion-app-container">
      {/* Toast Notification */}
      {shareToast && <div className="notion-toast">{shareToast}</div>}

      {/* Welcome & Visibility Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      {/* LEFT NOTION SIDEBAR */}
      <Sidebar
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenWelcome={() => setShowWelcomeModal(true)}
        onQuickNewTask={handleQuickNewTask}
        onLogout={handleLogout}
        privateCount={privateCount}
        publicCount={publicCount}
        allCount={allCount}
        completedCount={completedCount}
        totalTasks={allCount}
        isOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        onFocusSearch={handleFocusSearch}
      />

      {/* MAIN NOTION CANVAS */}
      <main className="notion-canvas">
        {/* TOPBAR / BREADCRUMB NAVIGATION */}
        <header className="notion-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>

            {/* Breadcrumb path */}
            <div className="breadcrumb-path">
              <span className="breadcrumb-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="breadcrumb-title">
                {currentView === "admin"
                  ? "Admin Control Panel"
                  : currentView === "public"
                  ? "Public Tasks"
                  : currentView === "all"
                  ? "All Accessible Tasks"
                  : "Task Manager"}
              </span>

              {/* Private / Public Switcher Pill */}
              {currentView !== "admin" && (
                <div className="topbar-scope-pill-dropdown">
                  <button
                    type="button"
                    className={`scope-pill-btn ${
                      currentView === "public" ? "pill-public" : "pill-private"
                    }`}
                    onClick={() =>
                      setCurrentView(
                        currentView === "public" ? "private" : "public"
                      )
                    }
                    title="Click to toggle between Private and Public tasks"
                  >
                    <span>{currentView === "public" ? "🌐 Public" : "🔒 Private"}</span>
                    <span className="pill-arrow">▾</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="topbar-right">
            <span className="last-edited-label">Edited just now</span>

            {/* Topbar View Segmented Toggle (Private vs Public vs All) */}
            {currentView !== "admin" && (
              <div className="topbar-view-segmented">
                <button
                  type="button"
                  className={`segmented-item ${
                    currentView === "private" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("private")}
                  title="Private: Only you can see"
                >
                  🔒 Private ({privateCount})
                </button>
                <button
                  type="button"
                  className={`segmented-item ${
                    currentView === "public" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("public")}
                  title="Public: All users can see"
                >
                  🌐 Public ({publicCount})
                </button>
                <button
                  type="button"
                  className={`segmented-item ${
                    currentView === "all" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("all")}
                  title="All tasks"
                >
                  📁 All ({allCount})
                </button>
              </div>
            )}

            <button
              type="button"
              className="topbar-action-btn share-btn"
              onClick={handleShareWorkspace}
              title="Share Workspace Link"
            >
              Share
            </button>
            <button
              type="button"
              className="topbar-icon-action"
              onClick={() => setShowWelcomeModal(true)}
              title="Workspace Info"
            >
              ★
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="notion-page-scroll">
          <div className="notion-page-content">
            {currentView === "admin" && isAdmin ? (
              <AdminDashboard
                token={token}
                onBackToTasks={() => setCurrentView("private")}
              />
            ) : (
              <>
                {/* NOTION COVER & HEADER SECTION */}
                <div className="notion-header-block">
                  {/* User Name Header Badge (Replaced green 3-check icon) */}
                  <div className="notion-user-header-banner">
                    <div className="notion-user-avatar-large">
                      {(user?.name || user?.email || "U")[0].toUpperCase()}
                    </div>
                    <div className="notion-user-info-group">
                      <span className="notion-user-greeting">Signed in as</span>
                      <div className="notion-user-name-row">
                        <span className="notion-user-header-name">
                          {user?.name || "User"}
                        </span>
                        <span className={`role-badge ${user?.role || "user"}`}>
                          {user?.role || "user"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="header-meta-actions">
                    <button
                      type="button"
                      className="meta-action-btn"
                      onClick={() => setShowWelcomeModal(true)}
                    >
                      💬 Visibility Guide
                    </button>
                    <button
                      type="button"
                      className="meta-action-btn"
                      onClick={() => handleQuickNewTask(currentView === "public")}
                    >
                      ＋ Add {currentView === "public" ? "public" : "private"} task
                    </button>
                    {currentView === "public" && publicCount === 0 && (
                      <button
                        type="button"
                        className="meta-action-btn"
                        style={{ color: "#0284c7" }}
                        onClick={handleRestoreSamplePublicTasks}
                      >
                        🔄 Restore sample public tasks
                      </button>
                    )}
                  </div>

                  <h1 className="notion-page-title">
                    {currentView === "public"
                      ? "Public Tasks"
                      : currentView === "all"
                      ? "All Tasks"
                      : "Task Manager"}
                  </h1>

                  <div className="notion-scope-description-banner">
                    {currentView === "private" ? (
                      <span className="desc-text private">
                        🔒 <strong>Private Workspace:</strong> Only you can see
                        these tasks ({privateCount} tasks). Other standard users
                        cannot view or search them.
                      </span>
                    ) : currentView === "public" ? (
                      <span className="desc-text public">
                        🌐 <strong>Public Workspace:</strong> All users can see
                        and collaborate on these tasks ({publicCount} tasks
                        available to all users).
                      </span>
                    ) : (
                      <span className="desc-text all">
                        📁 <strong>All Accessible Tasks:</strong> Showing your
                        personal private tasks and all shared public tasks (
                        {allCount} tasks).
                      </span>
                    )}
                  </div>
                </div>

                {/* DEDICATED WORKSPACE NAVIGATION BAR (Private vs Public vs All) */}
                <div className="notion-workspace-scope-bar">
                  <div className="scope-bar-tabs">
                    <button
                      type="button"
                      className={`scope-bar-tab ${
                        currentView === "private" ? "active-private" : ""
                      }`}
                      onClick={() => setCurrentView("private")}
                    >
                      <span className="scope-tab-icon">🔒</span>
                      <span className="scope-tab-title">Private Tasks</span>
                      <span className="scope-tab-badge">{privateCount}</span>
                    </button>

                    <button
                      type="button"
                      className={`scope-bar-tab ${
                        currentView === "public" ? "active-public" : ""
                      }`}
                      onClick={() => setCurrentView("public")}
                    >
                      <span className="scope-tab-icon">🌐</span>
                      <span className="scope-tab-title">Public Tasks</span>
                      <span className="scope-tab-badge public-badge">
                        {publicCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`scope-bar-tab ${
                        currentView === "all" ? "active-all" : ""
                      }`}
                      onClick={() => setCurrentView("all")}
                    >
                      <span className="scope-tab-icon">📁</span>
                      <span className="scope-tab-title">All Accessible</span>
                      <span className="scope-tab-badge">{allCount}</span>
                    </button>
                  </div>
                </div>

                {/* NOTION VIEWS & FILTER CONTROLS BAR (Matches screenshot tabs: To Do | Done | New) */}
                <div className="notion-controls-bar">
                  <div className="views-tabs-group">
                    <button
                      type="button"
                      className={`view-tab-btn ${
                        activeFilter === "all" ? "active" : ""
                      }`}
                      onClick={() => setActiveFilter("all")}
                    >
                      <span className="tab-icon">📑</span>
                      <span className="tab-label">All</span>
                      <span className="tab-count">{viewScopedTodos.length}</span>
                    </button>

                    <button
                      type="button"
                      className={`view-tab-btn ${
                        activeFilter === "active" ? "active" : ""
                      }`}
                      onClick={() => setActiveFilter("active")}
                    >
                      <span className="tab-icon">📋</span>
                      <span className="tab-label">To Do</span>
                      <span className="tab-count">
                        {viewScopedTodos.filter((t) => !t.completed).length}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`view-tab-btn ${
                        activeFilter === "completed" ? "active" : ""
                      }`}
                      onClick={() => setActiveFilter("completed")}
                    >
                      <span className="tab-icon">☑</span>
                      <span className="tab-label">Done</span>
                      <span className="tab-count">
                        {viewScopedTodos.filter((t) => t.completed).length}
                      </span>
                    </button>
                  </div>

                  <div className="views-actions-group">
                    {/* Live Search Input */}
                    <div className="notion-search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Filter tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="notion-search-input"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          className="search-clear-btn"
                          onClick={() => setSearchQuery("")}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Admin Scope Selector (Only in private/all views) */}
                    {isAdmin && currentView !== "public" && (
                      <div className="admin-scope-mini-toggle">
                        <button
                          type="button"
                          className={`mini-scope-btn ${
                            adminScope === "all" ? "active" : ""
                          }`}
                          onClick={() => setAdminScope("all")}
                        >
                          All Users
                        </button>
                        <button
                          type="button"
                          className={`mini-scope-btn ${
                            adminScope === "mine" ? "active" : ""
                          }`}
                          onClick={() => setAdminScope("mine")}
                        >
                          Mine
                        </button>
                        <button
                          type="button"
                          className={`mini-scope-btn ${
                            adminScope === "others" ? "active" : ""
                          }`}
                          onClick={() => setAdminScope("others")}
                        >
                          Others
                        </button>
                      </div>
                    )}

                    {/* Blue "+ New ▾" Button from Notion Screenshot */}
                    <button
                      type="button"
                      className="notion-blue-new-btn"
                      onClick={() => handleQuickNewTask(currentView === "public")}
                    >
                      <span>New</span>
                      <span className="new-btn-arrow">▾</span>
                    </button>
                  </div>
                </div>

                {/* TASK INPUT CONTAINER */}
                <InputContainer
                  inputRef={inputRef}
                  inputVal={inputVal}
                  writeTodo={writeTodo}
                  addTodo={addTodo}
                  isPublic={isPublicNew}
                  setIsPublic={setIsPublicNew}
                />

                {/* TODO LIST CONTAINER */}
                <TodoContainer
                  todos={finalTodos}
                  updateTodo={updateTodo}
                  delTodo={delTodo}
                  isAdmin={isAdmin}
                  currentUser={user}
                  onQuickAdd={() => handleQuickNewTask(currentView === "public")}
                  activeView={currentView}
                  onRestoreSamplePublic={handleRestoreSamplePublicTasks}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}