import { useState, useEffect } from "react";

const ADMIN_API = "https://todolist-r9lu.onrender.com/api/admin/users";

const DEFAULT_MOCK_USERS = [
  { _id: "u1", name: "Reshmaa", email: "reshmaa@gmail.com", role: "admin" },
  { _id: "u2", name: "Alex Morgan", email: "alex.m@example.com", role: "user" },
  { _id: "u3", name: "Sarah Connor", email: "sarah.c@techcorp.io", role: "user" },
];

export default function AdminDashboard({ token, onBackToTasks }) {
  const [users, setUsers] = useState(DEFAULT_MOCK_USERS);
  const [error] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (!token || token.startsWith("demo-")) return;

    fetch(ADMIN_API, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load users");
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
      })
      .catch((err) => {
        console.warn("Using local mock users:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleRoleChange(userId, newRole) {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
    );

    if (token && !token.startsWith("demo-") && !token.startsWith("token-")) {
      try {
        await fetch(`${ADMIN_API}/${userId}/role`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        });
      } catch (err) {
        console.warn("Error updating role:", err);
      }
    }
  }

  return (
    <section className="admin-container">
      <div className="admin-top-bar">
        <h2 className="admin-title">Admin Control Panel</h2>
        {onBackToTasks && (
          <button type="button" className="admin-toggle-btn" onClick={onBackToTasks}>
            ← Back to Tasks
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <div className="admin-table-wrapper">
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
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}