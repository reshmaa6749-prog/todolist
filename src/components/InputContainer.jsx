import { motion } from "framer-motion";

export default function InputContainer({
  inputVal,
  writeTodo,
  addTodo,
  priority = "medium",
  setPriority,
}) {
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTodo();
    }
  }

  return (
    <div className="input-section">
      <div className="input-row">
        <div className="input-icon-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
        <input
          type="text"
          className="task-input-field"
          value={inputVal}
          onChange={writeTodo}
          onKeyDown={handleKeyDown}
          placeholder="What needs to get done? Type and press Enter..."
          autoFocus
        />
      </div>

      <div className="input-actions-row">
        <div className="priority-selector">
          <span style={{ fontSize: "0.725rem", color: "var(--text-tertiary)", marginRight: "2px" }}>
            Priority:
          </span>
          {["low", "medium", "high"].map((p) => (
            <button
              key={p}
              type="button"
              className={`priority-btn ${priority === p ? `selected ${p}` : ""}`}
              onClick={() => setPriority && setPriority(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          className="add-task-btn"
          onClick={addTodo}
        >
          <span>Add Task</span>
          <span className="kbd-shortcut">↵</span>
        </motion.button>
      </div>
    </div>
  );
}