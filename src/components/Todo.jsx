import { useState } from "react";

export default function Todo({ todo, updateTodo, delTodo, isAdmin, currentUser }) {
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

  // Determine owner label if viewing as admin
  const isMine =
    todo.userEmail === currentUser?.email ||
    todo.userId === currentUser?.id ||
    todo.userId === currentUser?._id ||
    (!todo.userEmail && !todo.userId);

  const ownerLabel = isMine
    ? "My Task"
    : todo.userName || todo.userEmail || "Other User";

  return (
    <div className="todo">
      {isEditing ? (
        <div className="edit-box">
          <input
            type="text"
            className="edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button type="button" className="save-btn" onClick={handleSave}>
            Save
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="todo-text-group">
            <p className={todo.completed ? "completed" : ""}>{todo.text}</p>
            {isAdmin && (
              <span className={`task-owner-badge ${isMine ? "mine" : "other"}`}>
                {ownerLabel}
              </span>
            )}
          </div>

          <div className="actions">
            <input
              type="checkbox"
              checked={!!todo.completed}
              onChange={handleToggleComplete}
            />
            <button
              type="button"
              className="edit-btn"
              onClick={() => {
                setEditText(todo.text);
                setIsEditing(true);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="delete-btn"
              onClick={() => delTodo(todo.id || todo._id)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}