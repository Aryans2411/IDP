import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phonenumber: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:4000/signUpPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Navigate to login page upon success
      navigate("/login");
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="bg-white bg-opacity-10 backdrop-blur-md border border-gray-700 p-8 rounded-lg shadow-lg relative z-10 max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-white">
          Sign Up
        </h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-white font-medium mb-2">
              Name
            </label>
            <input
              className="w-full bg-transparent text-white px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-white font-medium mb-2"
            >
              Email
            </label>
            <input
              className="w-full bg-transparent text-white px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-white font-medium mb-2"
            >
              Password
            </label>
            <input
              className="w-full bg-transparent text-white px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="phonenumber"
              className="block text-white font-medium mb-2"
            >
              Phone Number
            </label>
            <input
              className="w-full bg-transparent text-white px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="text"
              name="phonenumber"
              id="phonenumber"
              placeholder="Enter your phone number"
              value={formData.phonenumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 text-white font-bold bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-300 focus:ring-4 focus:ring-blue-300 focus:outline-none"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
