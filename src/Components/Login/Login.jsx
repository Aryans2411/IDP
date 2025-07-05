import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WavyBackground } from "../ui/wavy-background";

export function WavyBackgroundDemo() {
  return (
    <WavyBackground className="max-w-4xl mx-auto pb-40">
      <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
        Hero waves are cool
      </p>
      <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
        Leverage the power of canvas to create a beautiful hero section
      </p>
    </WavyBackground>
  );
}

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    console.log("Attempting to send login data:", formData);

    try {
      const response = await fetch("http://localhost:4000/formPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response received:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // If login successful, navigate to home page
      navigate("/home");
    } catch (err) {
      console.error("Detailed error:", err);
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 min-h-screen">
      <div className="bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 min-h-screen flex items-center justify-center relative">
        <div className="bg-gradient-to-br from-dark-800/80 to-dark-700/80 backdrop-blur-xl border border-dark-600/50 p-8 rounded-2xl shadow-2xl relative z-10 max-w-md w-full hover:shadow-primary-500/25 transition-all duration-500">
          <h2 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
            Login
          </h2>
          {error && (
            <div className="text-center bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-200 p-4 rounded-xl mb-6 border border-red-700/50">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-dark-200 font-medium mb-3"
              >
                Email
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
              />
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 hover:from-primary-700 hover:via-secondary-700 hover:to-accent-700 text-white py-3 my-4 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-primary-500/50 focus:outline-none hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25"
              >
                Login
              </button>
            </div>
          </form>
          <div
            className="text-center mt-6 cursor-pointer text-primary-400 hover:text-primary-300 transition-colors duration-200"
            onClick={() => navigate("/signup")}
          >
            <h2 className="text-lg">Need an account?</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
