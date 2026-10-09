export default function InputContainer({ inputVal, writeTodo, addTodo }) {
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTodo();
    }
  }

  return (
    <div className="input-container">
      <input
        type="text"
        value={inputVal}
        onChange={writeTodo}
        onKeyDown={handleKeyDown}
        placeholder="Enter task..."
      />
      <button type="button" onClick={addTodo}>
        Add Task
      </button>
    </div>
  );
}