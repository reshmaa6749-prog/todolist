import React from "react";

export default function InputContainer({
  inputVal,
  writeTodo,
  addTodo,
  isPublic,
  setIsPublic,
  inputRef,
  placeholder,
}) {
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
  }

  return (
    <div className="notion-input-wrapper">
      <div className="notion-input-row">
        <span className="notion-input-icon">➕</span>
        <input
          ref={inputRef}
          type="text"
          className="notion-task-input"
          value={inputVal}
          onChange={writeTodo}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (isPublic
              ? "Add a public task (visible to all users)..."
              : "Add a private task (only visible to you)...")
          }
        />

        {/* Visibility Selector Pill */}
        <div className="input-visibility-toggle">
          <button
            type="button"
            className={`vis-choice-btn ${!isPublic ? "selected-private" : ""}`}
            onClick={() => setIsPublic(false)}
            title="Private: Only you can see this task"
          >
            🔒 Private
          </button>
          <button
            type="button"
            className={`vis-choice-btn ${isPublic ? "selected-public" : ""}`}
            onClick={() => setIsPublic(true)}
            title="Public: All users can see this task"
          >
            🌐 Public
          </button>
        </div>

        <button
          type="button"
          className="notion-add-submit-btn"
          onClick={addTodo}
          disabled={!inputVal.trim()}
        >
          Add Task
        </button>
      </div>
    </div>
  );
}