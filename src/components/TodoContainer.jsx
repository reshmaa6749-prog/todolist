import { motion, AnimatePresence } from "framer-motion";
import Todo from "./Todo";

export default function TodoContainer({
  todos,
  updateTodo,
  delTodo,
  filter,
  setFilter,
  search,
  setSearch,
  totalCount,
  activeCount,
  completedCount,
  onClearCompleted,
}) {
  return (
    <div className="todos-section">
      {/* Toolbar Controls */}
      <div className="todo-toolbar">
        <div className="filter-pills">
          <button
            type="button"
            className={`filter-pill-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All <span className="filter-count">{totalCount}</span>
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active <span className="filter-count">{activeCount}</span>
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed <span className="filter-count">{completedCount}</span>
          </button>
        </div>

        <div className="search-and-actions">
          <div className="search-box">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {completedCount > 0 && onClearCompleted && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              className="clear-completed-btn"
              onClick={onClearCompleted}
            >
              Clear Completed
            </motion.button>
          )}
        </div>
      </div>

      {/* Todo Items List */}
      <div className="todo-list-container">
        <AnimatePresence mode="popLayout">
          {todos.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="empty-tasks-state"
            >
              <div className="empty-icon-wrap">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="empty-title">
                {search ? "No matching tasks found" : filter === "completed" ? "No completed tasks yet" : "All caught up!"}
              </h3>
              <p className="empty-description">
                {search
                  ? `No tasks found matching "${search}". Try searching for something else.`
                  : "Enjoy your free time or add a new task above to stay productive."}
              </p>
            </motion.div>
          ) : (
            todos.map((todo) => (
              <Todo
                key={todo.id || todo._id}
                todo={todo}
                updateTodo={updateTodo}
                delTodo={delTodo}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}