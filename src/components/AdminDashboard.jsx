// import { useState, useEffect } from "react";

// const ADMIN_API = "https://todolist-r9lu.onrender.com/api/admin/users";

// function AdminDashboard({ token }) {
//   const [users, setUsers] = useState([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   async function fetchUsers() {
//     try {
//       const res = await fetch(ADMIN_API, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Failed to load users");
//         return;
//       }

//       setUsers(data);
//     } catch (err) {
//       console.error(err);
//       setError("Unable to connect to server");
//     }
//   }

//   async function handleRoleChange(userId, newRole) {
//     try {
//       const res = await fetch(`${ADMIN_API}/${userId}/role`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ role: newRole }),
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         alert(data.error || "Failed to update role");
//         return;
//       }

//       setUsers((prev) =>
//         prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
//       );
//     } catch (err) {
//       console.error(err);
//       alert("Error updating role");
//     }
//   }

//   return (
//     <section className="admin-container">
//       <h2>Admin Control Panel</h2>
//       <p className="admin-subtitle">Manage user permissions across the platform</p>

//       {error && <p className="error">{error}</p>}

//       <table className="admin-table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Current Role</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((u) => (
//             <tr key={u._id}>
//               <td>{u.name}</td>
//               <td>{u.email}</td>
//               <td>
//                 <span className={`role-badge ${u.role}`}>{u.role}</span>
//               </td>
//               <td>
//                 <select
//                   value={u.role}
//                   onChange={(e) => handleRoleChange(u._id, e.target.value)}
//                   className="role-select"
//                 >
//                   <option value="user">User</option>
//                   <option value="admin">Admin</option>
//                 </select>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </section>
//   );
// }

// export default AdminDashboard;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_API = "https://todolist-r9lu.onrender.com/api/admin/users";
const easeCustom = [0.16, 1, 0.3, 1];

function AdminDashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch(ADMIN_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load users");
        return;
      }

      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      const res = await fetch(`${ADMIN_API}/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update role");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Error updating role");
    }
  }

  return (
    <section className="admin-container">
      <h2 className="admin-title">Admin Control Panel</h2>
      <p className="admin-subtitle">Manage user permissions across the platform</p>

      {error && (
        <motion.p
          className="error"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {users.map((u, i) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03, ease: easeCustom }}
                >
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <motion.span
                      key={u.role}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`role-badge ${u.role}`}
                    >
                      {u.role}
                    </motion.span>
                  </td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminDashboard;