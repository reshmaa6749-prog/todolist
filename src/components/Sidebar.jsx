import React from "react";

export default function Sidebar({
  user,
  currentView,
  setCurrentView,
  onOpenWelcome,
  onQuickNewTask,
  onLogout,
  privateCount,
  publicCount,
  allCount,
  completedCount,
  totalTasks,
  isOpen,
  onCloseSidebar,
  onFocusSearch,
}) {
  const isAdmin = user?.role === "admin";
  const progressPercent =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="notion-sidebar-backdrop"
          onClick={onCloseSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`notion-sidebar ${isOpen ? "open" : ""}`}>
        {/* Workspace Brand / Header */}
        <div className="workspace-header">
          <div className="workspace-identity">
            <span className="workspace-icon" role="img" aria-label="workspace">
              🏡
            </span>
            <div className="workspace-titles">
              <span className="workspace-name">
                {user?.name ? `${user.name}'s Space` : "My Workspace"}
              </span>
              <span className="workspace-sub">Personal </span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onCloseSidebar}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Quick Top Icon Row (Home, Chat, Notes, Inbox, Search) */}
        <div className="quick-action-bar">
          <button
            type="button"
            className={`quick-pill-btn ${currentView === "private" ? "active" : ""}`}
            onClick={() => {
              setCurrentView("private");
              if (window.innerWidth <= 768) onCloseSidebar();
            }}
            title="Home"
          >
            <span className="pill-icon">🏠</span>
            <span className="pill-label">Home</span>
          </button>

          <button
            type="button"
            className="quick-icon-btn"
            onClick={onOpenWelcome}
            title="Welcome & Guide"
          >
            💬
          </button>

          <button
            type="button"
            className={`quick-icon-btn ${currentView === "public" ? "active" : ""}`}
            onClick={() => {
              setCurrentView("public");
              if (window.innerWidth <= 768) onCloseSidebar();
            }}
            title="Public Workspace"
          >
            📝
          </button>

          <button
            type="button"
            className={`quick-icon-btn ${currentView === "all" ? "active" : ""}`}
            onClick={() => {
              setCurrentView("all");
              if (window.innerWidth <= 768) onCloseSidebar();
            }}
            title="All Tasks"
          >
            📥
          </button>

          <button
            type="button"
            className="quick-icon-btn"
            onClick={onFocusSearch}
            title="Quick Search"
          >
            🔍
          </button>
        </div>

        {/* "Set up your workspace" Card with Duck Progress Slider */}
        <div className="setup-workspace-card">
          <div className="setup-header">
            <span className="setup-title">Set up your workspace</span>
            <span className="setup-stat">
              {completedCount}/{totalTasks}
            </span>
          </div>

          <div className="setup-track-wrapper">
            <div className="setup-track">
              <div
                className="setup-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="setup-duck-marker"
                style={{ left: `calc(${progressPercent}% - 11px)` }}
                title={`${progressPercent}% completed`}
              >
                🦆
              </div>
            </div>
          </div>
          <span className="setup-hint">
            {progressPercent === 100
              ? "All tasks completed! Great job!"
              : `${progressPercent}% finished — keep going!`}
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-sections-scroll">
          {/* PRIVATE SECTION */}
          <div className="sidebar-section">
            <div className="section-title-row">
              <span className="section-title">Private</span>
              <span className="section-info-badge" title="Only visible to you">
                🔒 Only you
              </span>
            </div>

            <button
              type="button"
              className="nav-item-btn"
              onClick={onOpenWelcome}
            >
              <span className="nav-icon">👋</span>
              <span className="nav-text">Welcome {user.name} </span>
            </button>

            <button
              type="button"
              className={`nav-item-btn ${currentView === "private" ? "active" : ""}`}
              onClick={() => {
                setCurrentView("private");
                if (window.innerWidth <= 768) onCloseSidebar();
              }}
            >
              <span className="nav-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="nav-text">Task Manager</span>
              <span className="nav-count">{privateCount}</span>
            </button>

            <button
              type="button"
              className="nav-item-btn add-btn"
              onClick={() => {
                setCurrentView("private");
                onQuickNewTask(false);
                if (window.innerWidth <= 768) onCloseSidebar();
              }}
            >
              <span className="nav-icon">＋</span>
              <span className="nav-text">Add new private</span>
            </button>
          </div>

          {/* PUBLIC SECTION */}
          <div className="sidebar-section">
            <div className="section-title-row">
              <span className="section-title">Public Workspace</span>
              <span className="section-info-badge public" title="Visible to all users">
                🌐 All users
              </span>
            </div>

            <button
              type="button"
              className={`nav-item-btn ${currentView === "public" ? "active" : ""}`}
              onClick={() => {
                setCurrentView("public");
                if (window.innerWidth <= 768) onCloseSidebar();
              }}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Public Tasks</span>
              <span className="nav-count">{publicCount}</span>
            </button>

            <button
              type="button"
              className={`nav-item-btn ${currentView === "all" ? "active" : ""}`}
              onClick={() => {
                setCurrentView("all");
                if (window.innerWidth <= 768) onCloseSidebar();
              }}
            >
              <span className="nav-icon">📁</span>
              <span className="nav-text">All Accessible</span>
              <span className="nav-count">{allCount}</span>
            </button>

            <button
              type="button"
              className="nav-item-btn add-btn"
              onClick={() => {
                setCurrentView("public");
                onQuickNewTask(true);
                if (window.innerWidth <= 768) onCloseSidebar();
              }}
            >
              <span className="nav-icon">＋</span>
              <span className="nav-text">Add new public</span>
            </button>
          </div>

          {/* ADMIN SECTION */}
          {isAdmin && (
            <div className="sidebar-section">
              <div className="section-title-row">
                <span className="section-title">Admin Management</span>
                <span className="section-info-badge admin">🛡️ Admin</span>
              </div>

              <button
                type="button"
                className={`nav-item-btn ${currentView === "admin" ? "active" : ""}`}
                onClick={() => {
                  setCurrentView("admin");
                  if (window.innerWidth <= 768) onCloseSidebar();
                }}
              >
                <span className="nav-icon">⚡</span>
                <span className="nav-text">Admin Dashboard</span>
              </button>
            </div>
          )}

          {/* UTILITY LINKS */}
          <div className="sidebar-section utility-section">
            <button
              type="button"
              className="nav-item-btn subtle"
              onClick={onOpenWelcome}
            >
              <span className="nav-icon">❓</span>
              <span className="nav-text">Help & Guide</span>
            </button>
          </div>
        </div>

        {/* User Profile & Logout at Bottom */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar-circle">
              {(user?.name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div className="user-text-info">
              <span className="user-display-name">{user?.name || "User"}</span>
              <span className="user-role-chip">{user?.role || "user"}</span>
            </div>
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={onLogout}
              title="Logout"
            >
              ⎋
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
