import { useState } from "react";

function formatTaskDate(dateString) {
  if (!dateString) return "Today";
  try {
    const taskDate = new Date(dateString);
    const now = new Date();
    const isToday =
      taskDate.getDate() === now.getDate() &&
      taskDate.getMonth() === now.getMonth() &&
      taskDate.getFullYear() === now.getFullYear();

    if (isToday) return "Today";

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      taskDate.getDate() === yesterday.getDate() &&
      taskDate.getMonth() === yesterday.getMonth() &&
      taskDate.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return taskDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Today";
  }
}

export default function Todo({
  todo,
  updateTodo,
  delTodo,
  isAdmin,
  currentUser,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  function handleSave() {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      updateTodo(todo.id || todo._id, { text: trimmed });
    }
    setIsEditing(false);
  }

  function handleCancel() {
    setEditText(todo.text);
    setIsEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  }

  function handleToggleComplete(e) {
    updateTodo(todo.id || todo._id, { completed: e.target.checked });
  }

  function handleToggleVisibility() {
    if (!canModify) return;
    updateTodo(todo.id || todo._id, { isPublic: !todo.isPublic });
  }

  // Determine owner label if viewing as admin or in public view
  const isMine =
    todo.userEmail === currentUser?.email ||
    todo.userId === currentUser?.id ||
    todo.userId === currentUser?._id ||
    todo.userId?._id === currentUser?.id ||
    (!todo.userEmail && !todo.userId);

  const canModify = isMine || isAdmin;
  const isPublic = Boolean(todo.isPublic);

  const ownerName = isMine
    ? "You"
    : todo.userName || (todo.userEmail ? todo.userEmail.split("@")[0] : "Team");

  const formattedDate = formatTaskDate(todo.createdAt);

  return (
    <div
      className={`notion-todo-item ${todo.completed ? "is-completed" : ""} ${
        isEditing ? "is-editing" : ""
      }`}
    >
      {isEditing ? (
        <div className="notion-edit-box">
          <input
            type="text"
            className="notion-edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="edit-btn-group">
            <button
              type="button"
              className="notion-save-btn"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="notion-cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Checkbox */}
          <label className="notion-checkbox-container">
            <input
              type="checkbox"
              checked={!!todo.completed}
              onChange={handleToggleComplete}
              aria-label={`Mark "${todo.text}" as ${
                todo.completed ? "incomplete" : "completed"
              }`}
            />
            <span className="notion-custom-checkbox">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </label>

          {/* Task Text & Badges */}
          <div className="notion-todo-content">
            <span
              className={`notion-todo-text ${
                todo.completed ? "strikethrough" : ""
              }`}
              onDoubleClick={() => {
                if (canModify) {
                  setEditText(todo.text);
                  setIsEditing(true);
                }
              }}
              title={canModify ? "Double-click to edit" : undefined}
            >
              {todo.text}
            </span>

            {/* Visibility Toggle Badge */}
            <button
              type="button"
              className={`notion-visibility-badge ${
                isPublic ? "badge-public" : "badge-private"
              } ${canModify ? "interactive" : "readonly"}`}
              onClick={handleToggleVisibility}
              title={
                canModify
                  ? `Click to make ${isPublic ? "Private" : "Public"}`
                  : isPublic
                  ? "Public task"
                  : "Private task"
              }
            >
              <span className="badge-icon">{isPublic ? "🌐" : "🔒"}</span>
              <span className="badge-text">{isPublic ? "Public" : "Private"}</span>
            </button>

            {/* Author Badge for Public or Admin */}
            {(isPublic || isAdmin) && (
              <span
                className={`notion-author-badge ${isMine ? "is-mine" : "is-other"}`}
                title={`Created by ${todo.userEmail || ownerName}`}
              >
                👤 {ownerName}
              </span>
            )}
          </div>

          {/* Right meta: Date Tag matching Notion screenshot */}
          <div className="notion-todo-right">
            <span className="notion-date-tag">{formattedDate}</span>

            {/* Actions (visible on hover) */}
            {canModify && (
              <div className="notion-hover-actions">
                <button
                  type="button"
                  className="notion-action-icon-btn"
                  onClick={() => {
                    setEditText(todo.text);
                    setIsEditing(true);
                  }}
                  title="Edit task"
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="notion-action-icon-btn delete"
                  onClick={() => delTodo(todo.id || todo._id)}
                  title="Delete task"
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}