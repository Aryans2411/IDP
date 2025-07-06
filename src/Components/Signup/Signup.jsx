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
    <div className="bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="bg-gradient-to-br from-dark-800/80 to-dark-700/80 backdrop-blur-xl border border-dark-600/50 p-8 rounded-2xl shadow-2xl relative z-10 max-w-md w-full hover:shadow-primary-500/25 transition-all duration-500">
        <h2 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
          Sign Up
        </h2>
        {error && (
          <div className="text-center bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-200 p-4 rounded-xl mb-6 border border-red-700/50">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-dark-200 font-medium mb-3"
            >
              Full Name
            </label>
            <input
              className="w-full bg-dark-700/50 text-white px-4 py-3 border border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all duration-300 placeholder-dark-400"
              type="text"
              name="name"
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              aria-required="true"
              aria-describedby="name-error"
              aria-invalid={error ? "true" : "false"}
              autoComplete="name"
            />
            {error && (
              <div
                id="name-error"
                className="text-red-400 text-sm mt-1"
                role="alert"
              >
                {error}
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-dark-200 font-medium mb-3"
            >
              Email Address
            </label>
            <input
              className="w-full bg-dark-700/50 text-white px-4 py-3 border border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all duration-300 placeholder-dark-400"
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              aria-required="true"
              aria-describedby="email-error"
              aria-invalid={error ? "true" : "false"}
              autoComplete="email"
            />
            {error && (
              <div
                id="email-error"
                className="text-red-400 text-sm mt-1"
                role="alert"
              >
                {error}
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-dark-200 font-medium mb-3"
            >
              Password
            </label>
            <input
              className="w-full bg-dark-700/50 text-white px-4 py-3 border border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all duration-300 placeholder-dark-400"
              type="password"
              name="password"
              id="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              aria-required="true"
              aria-describedby="password-error"
              aria-invalid={error ? "true" : "false"}
              autoComplete="new-password"
              minLength="8"
            />
            {error && (
              <div
                id="password-error"
                className="text-red-400 text-sm mt-1"
                role="alert"
              >
                {error}
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="phonenumber"
              className="block text-dark-200 font-medium mb-3"
            >
              Phone Number
            </label>
            <input
              className="w-full bg-dark-700/50 text-white px-4 py-3 border border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all duration-300 placeholder-dark-400"
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
              className="w-full bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 hover:from-primary-700 hover:via-secondary-700 hover:to-accent-700 text-white py-3 my-4 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-primary-500/50 focus:outline-none hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25"
              aria-describedby="signup-status"
              disabled={error}
            >
              {error ? "Creating account..." : "Sign Up"}
            </button>
          </div>
          {error && (
            <div
              id="signup-status"
              className="text-center text-red-400 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
