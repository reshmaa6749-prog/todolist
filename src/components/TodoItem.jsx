import React, { useState } from "react";

export default function TodoItem({ todo, userRole, updateTodo, deleteTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  function handleToggleComplete() {
    updateTodo(todo.id, { completed: !todo.completed });
  }

  function handleSave() {
    if (editText.trim()) {
      updateTodo(todo.id, { text: editText });
      setIsEditing(false);
    }
  }

  // Role checks: Admin or Moderator can manage tasks, regular users manage their own
  const canEdit = userRole === "admin" || userRole === "moderator" || userRole === "user";
  const canDelete = userRole === "admin" || userRole === "moderator";

  return (
    <div className={`task-item ${todo.completed ? "completed" : ""}`}>
      <div className="task-content">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
        />
        {isEditing ? (
          <input
            type="text"
            className="edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            style={{
              flex: 1,
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
              border: "1px solid #0284c7",
              outline: "none",
            }}
          />
        ) : (
          <span>{todo.text}</span>
        )}
      </div>

      <div className="task-actions">
        {canEdit && (
          <>
            {isEditing ? (
              <button className="icon-btn" onClick={handleSave} title="Save">
                ✓
              </button>
            ) : (
              <button className="icon-btn" onClick={() => setIsEditing(true)} title="Edit">
                ✏️
              </button>
            )}
          </>
        )}
        {canDelete && (
          <button className="icon-btn" onClick={() => deleteTodo(todo.id)} title="Delete">
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}