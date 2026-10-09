import { useState } from "react";
import { motion } from "framer-motion";

const easeCurve = [0.16, 1, 0.3, 1];

export default function Todo({ todo, updateTodo, delTodo }) {
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

  function toggleComplete(e) {
    updateTodo(todo.id || todo._id, { completed: e.target.checked });
  }

  const priority = todo.priority || "medium";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.16, ease: easeCurve }}
      className={`todo-item-card ${todo.completed ? "is-completed" : ""}`}
    >
      <div className="todo-left-content">
        <label className="custom-checkbox-label">
          <input
            type="checkbox"
            className="custom-checkbox-input"
            checked={!!todo.completed}
            onChange={toggleComplete}
          />
          <span className="checkbox-visual">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
              />
            </svg>
          </span>
        </label>

        {isEditing ? (
          <div className="todo-inline-edit">
            <input
              type="text"
              className="edit-input-field"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              className="edit-save-btn"
              onClick={handleSave}
            >
              Save
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              className="edit-cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </motion.button>
          </div>
        ) : (
          <div className="todo-content-block">
            <div className="todo-text-row">
              <span className={`todo-text ${todo.completed ? "completed" : ""}`}>
                {todo.text}
              </span>
              <span className={`priority-tag ${priority}`}>
                {priority}
              </span>
            </div>
            {todo.createdAt && (
              <span className="todo-meta-date">
                {new Date(todo.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="todo-actions-cluster">
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className="action-icon-btn edit"
            onClick={() => setIsEditing(true)}
            title="Edit task"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className="action-icon-btn delete"
            onClick={() => delTodo(todo.id || todo._id)}
            title="Delete task"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}