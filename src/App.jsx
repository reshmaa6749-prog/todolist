// import { useState, useEffect } from "react";
// import "./App.css";

// import InputContainer from "./components/InputContainer";
// import TodoContainer from "./components/TodoContainer";
// import Login from "./components/Login";
// import Register from "./components/Register";

// const API_URL = "https://todolist-r9lu.onrender.com";

// function App() {
//   // =================================================
//   // TODO STATES
//   // =================================================
//   const [inputVal, setInputVal] = useState("");
//   const [todos, setTodos] = useState([]);

//   // =================================================
//   // AUTH STATES
//   // =================================================
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [user, setUser] = useState(
//     JSON.parse(localStorage.getItem("user"))
//   );
//   const [showRegister, setShowRegister] = useState(false);

//   // =================================================
//   // HANDLE GOOGLE CALLBACK
//   // =================================================
//   useEffect(() => {
//     const hash = window.location.hash;
//     if (!hash) return;

//     const params = new URLSearchParams(hash.substring(1));
//     const googleToken = params.get("token");

//     if (googleToken) {
//       try {
//         const payload = JSON.parse(
//           atob(
//             googleToken
//               .split(".")[1]
//               .replace(/-/g, "+")
//               .replace(/_/g, "/")
//           )
//         );

//         const googleUser = {
//           id: payload.userId,
//           name: payload.name,
//           email: payload.email,
//         };

//         localStorage.setItem("token", googleToken);
//         localStorage.setItem("user", JSON.stringify(googleUser));

//         setToken(googleToken);
//         setUser(googleUser);

//         window.history.replaceState(
//           {},
//           document.title,
//           window.location.pathname
//         );
//       } catch (err) {
//         console.error("Google token processing error:", err);
//       }
//     }
//   }, []);

//   // =================================================
//   // NORMAL LOGIN
//   // =================================================
//   function handleLogin(data) {
//     localStorage.setItem("token", data.token);
//     localStorage.setItem("user", JSON.stringify(data.user));
//     setToken(data.token);
//     setUser(data.user);
//   }

//   // =================================================
//   // LOGOUT
//   // =================================================
//   function logout() {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setToken(null);
//     setUser(null);
//     setTodos([]);
//   }

//   // =================================================
//   // FETCH TODOS
//   // =================================================
//   useEffect(() => {
//     if (!token) return;

//     fetch(API_URL, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error("Failed to load todos");
//         }
//         return res.json();
//       })
//       .then((data) => setTodos(data))
//       .catch((err) => console.error("Error loading todos:", err));
//   }, [token]);

//   // =================================================
//   // INPUT & ACTIONS
//   // =================================================
//   function writeTodo(e) {
//     setInputVal(e.target.value);
//   }

//   async function addTodo() {
//     if (!inputVal.trim()) return;

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ text: inputVal }),
//       });

//       const newTodo = await res.json();

//       if (!res.ok) {
//         console.error(newTodo.error);
//         return;
//       }

//       setTodos((prev) => [...prev, newTodo]);
//       setInputVal("");
//     } catch (err) {
//       console.error("Error adding todo:", err);
//     }
//   }

//   async function updateTodo(id, updatedFields) {
//     try {
//       const res = await fetch(`${API_URL}/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(updatedFields),
//       });

//       const updatedTodo = await res.json();

//       if (!res.ok) {
//         console.error(updatedTodo.error);
//         return;
//       }

//       setTodos((prev) =>
//         prev.map((todo) => (todo.id === id ? updatedTodo : todo))
//       );
//     } catch (err) {
//       console.error("Error updating todo:", err);
//     }
//   }

//   async function delTodo(id) {
//     try {
//       const res = await fetch(`${API_URL}/${id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         console.error(data.error);
//         return;
//       }

//       setTodos((prev) => prev.filter((todo) => todo.id !== id));
//     } catch (err) {
//       console.error("Error deleting todo:", err);
//     }
//   }

//   // =================================================
//   // SHOW LOGIN / REGISTER
//   // =================================================
//   if (!token) {
//     if (showRegister) {
//       return <Register onShowLogin={() => setShowRegister(false)} />;
//     }
//     return (
//       <Login
//         onLogin={handleLogin}
//         onShowRegister={() => setShowRegister(true)}
//       />
//     );
//   }

//   // =================================================
//   // TODO PAGE (UPDATED MARKUP)
//   // =================================================
//   return (
//     <main className="todo-app">
//       <header className="top-bar">
//         <h1 className="app-title">To Do List</h1>
//         <div className="user-profile">
//           <div className="user-header">
//           <span className="welcome-text">
//             Welcome, <strong>{user?.name || "User"}</strong>
//           </span>
//           <button className="logout-btn" onClick={logout}>
//             Logout
//           </button>
//         </div></div>
//       </header>

//       <InputContainer
//         inputVal={inputVal}
//         writeTodo={writeTodo}
//         addTodo={addTodo}
//       />

//       <TodoContainer
//         todos={todos}
//         updateTodo={updateTodo}
//         delTodo={delTodo}
//       />
//     </main>
//   );
// }
// export default App;


import { useState, useEffect } from "react";
import "./App.css";

import InputContainer from "./components/InputContainer";
import TodoContainer from "./components/TodoContainer";
import Login from "./components/Login";
import Register from "./components/Register";

const API_URL = "https://todolist-r9lu.onrender.com/api/todos";

function App() {
  // =================================================
  // TODO STATES
  // =================================================
  const [inputVal, setInputVal] = useState("");
  const [todos, setTodos] = useState([]);

  // =================================================
  // AUTH STATES
  // =================================================
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showRegister, setShowRegister] = useState(false);

  // =================================================
  // HANDLE GOOGLE OAUTH REDIRECT & TOKEN DECODING
  // =================================================
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));

    const googleToken = urlParams.get("token") || hashParams.get("token");

    if (googleToken) {
      try {
        const payload = JSON.parse(
          atob(
            googleToken
              .split(".")[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/")
          )
        );

        const googleUser = {
          id: payload.userId,
          name: payload.name,
          email: payload.email,
        };

        localStorage.setItem("token", googleToken);
        localStorage.setItem("user", JSON.stringify(googleUser));

        setToken(googleToken);
        setUser(googleUser);

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (err) {
        console.error("Google token processing error:", err);
      }
    }
  }, []);

  // =================================================
  // NORMAL LOGIN HANDLER
  // =================================================
  function handleLogin(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  // =================================================
  // LOGOUT HANDLER
  // =================================================
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setTodos([]);
  }

  // =================================================
  // FETCH TODOS
  // =================================================
  useEffect(() => {
    if (!token) return;

    fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load todos");
        }
        return res.json();
      })
      .then((data) => setTodos(data))
      .catch((err) => console.error("Error loading todos:", err));
  }, [token]);

  // =================================================
  // TODO CRUD ACTIONS
  // =================================================
  function writeTodo(e) {
    setInputVal(e.target.value);
  }

  async function addTodo() {
    if (!inputVal.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: inputVal }),
      });

      const newTodo = await res.json();

      if (!res.ok) {
        console.error(newTodo.error);
        return;
      }

      setTodos((prev) => [...prev, newTodo]);
      setInputVal("");
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  }

  async function updateTodo(id, updatedFields) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const updatedTodo = await res.json();

      if (!res.ok) {
        console.error(updatedTodo.error);
        return;
      }

      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  }

  async function delTodo(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  }

  // =================================================
  // AUTH VIEWS (LOGIN / REGISTER)
  // =================================================
  if (!token) {
    if (showRegister) {
      return <Register onShowLogin={() => setShowRegister(false)} />;
    }
    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  // =================================================
  // TODO VIEW
  // =================================================
  return (
    <main className="todo-app">
      <header className="top-bar">
        <h1 className="app-title">To Do List</h1>
        <div className="user-profile">
          <div className="user-header">
            <span className="welcome-text">
              Welcome, <strong>{user?.name || "User"}</strong>
            </span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <InputContainer
        inputVal={inputVal}
        writeTodo={writeTodo}
        addTodo={addTodo}
      />

      <TodoContainer
        todos={todos}
        updateTodo={updateTodo}
        delTodo={delTodo}
      />
    </main>
  );
}

export default App;