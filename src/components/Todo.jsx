// import { useState } from "react";

// function Todo({ todo, updateTodo, delTodo }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editText, setEditText] = useState(todo.text);

//   function handleSave() {
//     if (editText.trim()) {
//       updateTodo(todo.id, { text: editText });
//       setIsEditing(false);
//     }
//   }

//   function handleToggleComplete(e) {
//     updateTodo(todo.id, { completed: e.target.checked });
//   }

//   return (
//     <div className="todo">
//       {isEditing ? (
//         <div className="edit-box">
//           <input
//             type="text"
//             className="edit-input"
//             value={editText}
//             onChange={(e) => setEditText(e.target.value)}
//           />
//           <button className="save-btn" onClick={handleSave}>Save</button>
//         </div>
//       ) : (
//         <p className={todo.completed ? "completed" : ""}>{todo.text}</p>
//       )}

//       <div className="actions">
//         <input
//           type="checkbox"
//           checked={todo.completed}
//           onChange={handleToggleComplete}
//         />
//         {!isEditing && (
//           <button className="edit-btn" onClick={() => setIsEditing(true)}>
//             Edit
//           </button>
//         )}
//         <button onClick={() => delTodo(todo.id)}>Delete</button>
//       </div>
//     </div>
//   );
// }

// export default Todo;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const easeConfig = [0.16, 1, 0.3, 1];

export default function Todo({ todo, updateTodo, delTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  function handleSave() {
    if (editText.trim()) {
      updateTodo(todo.id, { text: editText });
      setIsEditing(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.15, ease: easeConfig }}
      className={`todo ${todo.completed ? "is-completed" : ""}`}
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: easeConfig }}
            className="edit-box"
          >
            <input
              type="text"
              className="edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: easeConfig }}
            className="todo-text-wrapper"
          >
            <p className={`todo-text ${todo.completed ? "completed" : ""}`}>
              {todo.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="actions">
        <label className="custom-checkbox">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => updateTodo(todo.id, { completed: e.target.checked })}
          />
          <span className="checkmark" />
        </label>

        {!isEditing && (
          <button
            className="edit-btn"
            onClick={() => {
              setEditText(todo.text);
              setIsEditing(true);
            }}
          >
            Edit
          </button>
        )}

        <button className="delete-btn" onClick={() => delTodo(todo.id)}>
          Delete
        </button>
      </div>
    </motion.div>
  );
}