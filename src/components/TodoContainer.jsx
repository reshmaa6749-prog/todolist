import Todo from "./Todo";

export default function TodoContainer({
  todos,
  updateTodo,
  delTodo,
  isAdmin,
  currentUser,
}) {
  if (todos.length === 0) {
    return <p className="empty-state">No tasks to display.</p>;
  }

  return (
    <div className="container">
      {todos.map((todo) => (
        <Todo
          key={todo.id || todo._id}
          todo={todo}
          updateTodo={updateTodo}
          delTodo={delTodo}
          isAdmin={isAdmin}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
}