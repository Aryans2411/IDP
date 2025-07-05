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
    <div className="  bg-gradient-to-br from-gray-900  via-gray-800 to-black min-h-screen">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex items-center justify-center relative">
        <div className="bg-white bg-opacity-10 backdrop-blur-md border border-gray-700 p-8 rounded-lg shadow-lg relative z-10 max-w-md w-full">
          <h2 className="text-3xl font-extrabold text-center mb-6 text-white">
            Login
          </h2>
          {error && (
            <div className="text-center bg-red-100 text-red-700 p-2 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 my-4 rounded-lg transition-colors duration-300 focus:ring-4 focus:ring-blue-300 focus:outline-none"
              >
                Login
              </button>
            </div>
          </form>
          <div
            className="text-center mt-4 cursor-pointer text-blue-500 hover:text-blue-700"
            onClick={() => navigate("/signup")}
          >
            <h2>Need an account?</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
