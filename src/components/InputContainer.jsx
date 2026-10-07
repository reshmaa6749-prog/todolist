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
        placeholder="Enter task..."
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={addTodo}
        className="add-btn"
      >
        +
      </motion.button>
    </div>
  );
}

export default InputContainer;