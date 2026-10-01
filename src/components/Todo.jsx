import { useState } from "react";

function Todo({ todo, updateTodo, delTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  function handleSave() {
    if (editText.trim()) {
      updateTodo(todo.id, { text: editText });
      setIsEditing(false);
    }
  }

  function handleToggleComplete(e) {
    updateTodo(todo.id, { completed: e.target.checked });
  }

  return (
    <div className="todo">
      {isEditing ? (
        <div className="edit-box">
          <input
            type="text"
            className="edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      ) : (
        <p className={todo.completed ? "completed" : ""}>{todo.text}</p>
      )}

      <div className="actions">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
        />
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}
        <button onClick={() => delTodo(todo.id)}>Delete</button>
      </div>
    </div>
  );
}

export default Todo;