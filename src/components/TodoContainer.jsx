import React from "react";
import Todo from "./Todo";

export default function TodoContainer({
  todos,
  updateTodo,
  delTodo,
  isAdmin,
  currentUser,
  onQuickAdd,
  activeView,
  onRestoreSamplePublic,
}) {
  return (
    <div className="notion-tasks-container">
      {todos.length === 0 ? (
        <div className="notion-empty-block">
          <div className="empty-icon">{activeView === "public" ? "🌐" : "📝"}</div>
          <p className="empty-title">
            {activeView === "public"
              ? "No public tasks to display"
              : "No tasks found in this view"}
          </p>
          <p className="empty-sub">
            {activeView === "private"
              ? "You don't have any private tasks here. Add one below!"
              : activeView === "public"
              ? "Public tasks are shared across all users in the workspace. Add one below or restore sample tasks!"
              : "No tasks to display matching this filter."}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            {onQuickAdd && (
              <button
                type="button"
                className="notion-empty-add-btn"
                onClick={onQuickAdd}
              >
                + Add a task now
              </button>
            )}
            {activeView === "public" && onRestoreSamplePublic && (
              <button
                type="button"
                className="notion-empty-add-btn"
                style={{ backgroundColor: "#0284c7" }}
                onClick={onRestoreSamplePublic}
              >
                🔄 Restore sample public tasks
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="notion-todos-list">
          {todos.map((todo) => (
            <Todo
              key={todo.id || todo._id}
              todo={todo}
              updateTodo={updateTodo}
              delTodo={delTodo}
              isAdmin={isAdmin}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {/* Notion-style bottom "+ New task" row */}
      {onQuickAdd && (
        <button
          type="button"
          className="notion-bottom-new-row"
          onClick={onQuickAdd}
        >
          <span className="plus-sign">＋</span>
          <span className="row-text">
            {activeView === "public" ? "New public task" : "New task"}
          </span>
        </button>
      )}
    </div>
  );
}