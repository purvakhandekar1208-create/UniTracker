import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
const [role, setRole] = useState("Mentor");
const navigate = useNavigate();

const handleLogin = () => {
navigate("/dashboard");
};

const roles = [
{
name: "Mentor",
image: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
},
{
name: "Student",
image: "https://cdn-icons-png.flaticon.com/512/4140/4140061.png",
},
{
name: "Parent",
image: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
},
];

return (
<div className="min-h-screen bg-gradient-to-br from-[#3559d6] via-[#2f4fbf] to-[#1f3c88] flex items-center justify-center relative">

  {/* Logo */}
  <div className="absolute top-8 left-12 text-white text-2xl font-semibold tracking-wide">
    LOGO
  </div>

  {/* Login Card */}
  <div className="bg-white w-[520px] rounded-3xl shadow-2xl p-12">

    <h1 className="text-4xl font-bold text-center text-gray-700 mb-2">
      Login
    </h1>

    <p className="text-center text-gray-500 mb-8">
      Sign in as
    </p>

    {/* Role Selection */}
    <div className="flex justify-between mb-8">
      {roles.map((item) => (
        <div
          key={item.name}
          onClick={() => setRole(item.name)}
          className={`cursor-pointer flex flex-col items-center p-5 rounded-2xl transition w-[120px]
          ${
            role === item.name
              ? "border-2 border-[#3559d6] bg-blue-50 shadow-md"
              : "border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 rounded-full bg-gray-100 p-2 mb-3"
          />
          <span className="text-gray-600 font-medium">
            {item.name}
          </span>
        </div>
      ))}
    </div>

    {/* Email */}
    <input
      type="text"
      placeholder="Enter email or USN"
      className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-[#3559d6] focus:outline-none"
    />

    {/* Password */}
    <input
      type="password"
      placeholder="Enter password"
      className="w-full p-3 border rounded-xl mb-6 focus:ring-2 focus:ring-[#3559d6] focus:outline-none"
    />

    {/* Sign In Button */}
    <button
      onClick={handleLogin}
      className="w-full bg-gradient-to-r from-[#3559d6] to-[#1f3c88] text-white p-3 rounded-xl font-semibold hover:opacity-95 transition"
    >
      Sign In
    </button>

    <p className="text-center text-sm text-blue-600 mt-4 cursor-pointer hover:underline">
      Forgot password?
    </p>

  </div>
</div>

);
}

export default Login;