// function InputContainer({ inputVal, writeTodo, addTodo }) {
//   function handleKeyDown(e) {
//     if (e.key === "Enter") addTodo();
//   }

//   return (
//     <div className="input-container">
//       <input
//         type="text"
//         value={inputVal}
//         onChange={writeTodo}
//         onKeyDown={handleKeyDown}
//         placeholder="Enter task..."
//       />
//       <button onClick={addTodo}>+</button>
//     </div>
//   );
// }

// export default InputContainer;

import { motion } from "framer-motion";

function InputContainer({ inputVal, writeTodo, addTodo }) {
  function handleKeyDown(e) {
    if (e.key === "Enter") addTodo();
  }

  return (
    <div className="input-container">
      <input
        type="text"
        value={inputVal}
        onChange={writeTodo}
        onKeyDown={handleKeyDown}
        placeholder="What is the task today?"
      />
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={addTodo}
        className="add-btn"
      >
        Add Task
      </motion.button>
    </div>
  );
}

export default InputContainer;