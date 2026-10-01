import Todo from "./Todo";

function TodoContainer({ todos, updateTodo, delTodo }) {
  return (
    <div className="container">
      {todos.map((todo) => (
        <Todo
          key={todo.id}
          todo={todo}
          updateTodo={updateTodo}
          delTodo={delTodo}
        />
      ))}
    </div>
  );
}

export default TodoContainer;