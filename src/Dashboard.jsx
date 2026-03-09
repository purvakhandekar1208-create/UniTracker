import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "./api/userApi";

function Dashboard() {

const [users, setUsers] = useState([]);

const [newUser, setNewUser] = useState({
name: "",
email: "",
role: "MENTEE"
});

useEffect(() => {
loadUsers();
}, []);

const loadUsers = () => {
getUsers()
.then((res) => setUsers(res.data))
.catch((err) => console.error(err));
};

const handleChange = (e) => {
setNewUser({
...newUser,
[e.target.name]: e.target.value
});
};

const handleAddUser = () => {
createUser(newUser)
.then(() => {
loadUsers();
setNewUser({ name: "", email: "", role: "MENTEE" });
})
.catch((err) => console.error(err));
};

const handleDelete = (id) => {
deleteUser(id)
.then(() => loadUsers())
.catch((err) => console.error(err));
};

const handleEdit = (user) => {
const updatedName = prompt("Enter new name", user.name);

if (updatedName) {
  updateUser(user._id, { ...user, name: updatedName })
    .then(() => loadUsers())
    .catch((err) => console.error(err));
}

};

return (
<div className="min-h-screen bg-[#eef1f7] flex">

  {/* SIDEBAR */}
  <div className="w-64 bg-gradient-to-b from-[#3559d6] to-[#1f3c88] text-white p-6">

    <div className="text-2xl font-bold mb-10">LOGO</div>

    <nav className="space-y-4">
      <div className="bg-white/20 p-3 rounded-lg">Dashboard</div>
      <div className="hover:bg-white/10 p-3 rounded-lg cursor-pointer">My Division</div>
      <div className="hover:bg-white/10 p-3 rounded-lg cursor-pointer">Internships</div>
      <div className="hover:bg-white/10 p-3 rounded-lg cursor-pointer">Certificates</div>
      <div className="hover:bg-white/10 p-3 rounded-lg cursor-pointer">Defaulters</div>
      <div className="hover:bg-white/10 p-3 rounded-lg cursor-pointer">Reports</div>
      <div className="hover:bg-white/10 p-3 rounded-lg cursor-pointer">Settings</div>
    </nav>

  </div>

  {/* MAIN CONTENT */}
  <div className="flex-1">

    {/* HEADER */}
    <div className="bg-white p-6 flex justify-between items-center shadow-sm">
      <h1 className="text-2xl font-bold text-gray-700">
        Mentor Dashboard
      </h1>
    </div>

    <div className="p-6">

      {/* STATS */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Mentees" value={users.length} color="bg-green-100" />
        <StatCard title="Defaulter Count" value="0" color="bg-red-100" />
        <StatCard title="Courses Completed" value="0" color="bg-blue-100" />
        <StatCard title="Pending Verifications" value="0" color="bg-yellow-100" />
      </div>

      {/* ADD STUDENT FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Student</h2>

        <div className="flex gap-4">

          <input
            name="name"
            value={newUser.name}
            onChange={handleChange}
            placeholder="Student Name"
            className="border p-2 rounded-lg"
          />

          <input
            name="email"
            value={newUser.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded-lg"
          />

          <select
            name="role"
            value={newUser.role}
            onChange={handleChange}
            className="border p-2 rounded-lg"
          >
            <option value="MENTEE">MENTEE</option>
            <option value="MENTOR">MENTOR</option>
          </select>

          <button
            onClick={handleAddUser}
            className="bg-[#3559d6] text-white px-4 py-2 rounded-lg"
          >
            Add
          </button>

        </div>
      </div>

      {/* STUDENTS TABLE */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">My Mentees</h2>

        <table className="w-full text-sm">

          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="pb-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b">

                <td className="py-3">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>

                <td className="flex gap-2 py-3">

                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>

  </div>
</div>

);
}

function StatCard({ title, value, color }) {
return (
<div className={"p-6 rounded-xl shadow-sm ${color}"}>
<h3 className="text-gray-600 text-sm">{title}</h3>
<p className="text-2xl font-bold text-gray-800">{value}</p>
</div>
);
}

export default Dashboard;