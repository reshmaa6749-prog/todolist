// import Todo from "./Todo";

// function TodoContainer({ todos, updateTodo, delTodo }) {
//   return (
//     <div className="container">
//       {todos.map((todo) => (
//         <Todo
//           key={todo.id}
//           todo={todo}
//           updateTodo={updateTodo}
//           delTodo={delTodo}
//         />
//       ))}
//     </div>
//   );
// }

// export default TodoContainer;

import { motion, AnimatePresence } from "framer-motion";
import Todo from "./Todo";

function TodoContainer({ todos, updateTodo, delTodo }) {
  return (
    <div className="container">
      <AnimatePresence mode="popLayout">
        {todos.map((todo) => (
          <Todo
            key={todo.id}
            todo={todo}
            updateTodo={updateTodo}
            delTodo={delTodo}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default TodoContainer;