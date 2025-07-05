import React, { useState, useEffect } from "react";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Fleet Manager",
    company: "DriveWise Fleet Solutions",
    location: "New York, NY",
    joinDate: "January 2024",
  });

  const [editData, setEditData] = useState({ ...profileData });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:4000/api/user/profile");

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      const formattedData = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phonenumber || "",
        role: data.role || "Fleet Manager",
        company: data.company || "DriveWise Fleet Solutions",
        location: "Bangalore, Karnataka",
        joinDate: data.joinDate || "January 2024",
      };

      setProfileData(formattedData);
      setEditData(formattedData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setEditData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:4000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          phonenumber: editData.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const updatedData = await response.json();
      const formattedData = {
        name: updatedData.name || "",
        email: updatedData.email || "",
        phone: updatedData.phonenumber || "",
        role: updatedData.role || "Fleet Manager",
        company: updatedData.company || "DriveWise Fleet Solutions",
        location: updatedData.location || "New York, NY",
        joinDate: updatedData.joinDate || "January 2024",
      };

      setProfileData(formattedData);
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading && !profileData.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-dark-800/80 to-dark-700/80 backdrop-blur-xl p-8 rounded-2xl border border-dark-600/50 shadow-2xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-dark-300 mt-4">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 text-white">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 animate-fade-in">
            Your Profile
          </h1>

          <div className="bg-gradient-to-br from-dark-800/80 to-dark-700/80 backdrop-blur-xl p-8 rounded-2xl border border-dark-600/50 shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 animate-slide-up">
            {error && (
              <div className="text-center bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-200 p-4 rounded-xl mb-6 border border-red-700/50">
                {error}
              </div>
            )}

            {/* Profile Header */}
            <div className="text-center mb-8">
              <div className="inline-block relative">
                <img
                  src="https://i.pinimg.com/736x/d6/f1/8d/d6f18dcdfc48ef9c283fa8e68a5c7a9e.jpg"
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-primary-500/50 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-accent-500 rounded-full p-2 shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-4 text-white">
                {profileData.name || "User"}
              </h2>
              <p className="text-dark-300">{profileData.role}</p>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-dark-200 font-medium mb-3">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className="w-full bg-dark-700/50 text-white px-4 py-3 border border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all duration-300"
                      placeholder="Your name"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="w-full bg-dark-700/30 text-white px-4 py-3 border border-dark-600 rounded-xl">
                      {profileData.name || "Not set"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-3">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      className="w-full bg-dark-700/50 text-white px-4 py-3 border border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all duration-300"
                      placeholder="Your email"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="w-full bg-dark-700/30 text-white px-4 py-3 border border-dark-600 rounded-xl">
                      {profileData.email || "Not set"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-3">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-dark-700/50 text-white px-4 py-3 border border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all duration-300"
                      placeholder="Your phone number"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="w-full bg-dark-700/30 text-white px-4 py-3 border border-dark-600 rounded-xl">
                      {profileData.phone || "Not set"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-3">
                    Role
                  </label>
                  <div className="w-full bg-accent-900/30 text-accent-400 px-4 py-3 border border-accent-600 rounded-xl">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-accent-400 rounded-full mr-2"></div>
                      {profileData.role}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-3">
                    Company
                  </label>
                  <div className="w-full bg-dark-700/30 text-white px-4 py-3 border border-dark-600 rounded-xl">
                    {profileData.company}
                  </div>
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-3">
                    Location
                  </label>
                  <div className="w-full bg-dark-700/30 text-white px-4 py-3 border border-dark-600 rounded-xl">
                    {profileData.location}
                  </div>
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-3">
                    Member Since
                  </label>
                  <div className="w-full bg-dark-700/30 text-white px-4 py-3 border border-dark-600 rounded-xl">
                    {profileData.joinDate}
                  </div>
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-3">
                    Account Status
                  </label>
                  <div className="w-full bg-green-900/30 text-green-400 px-4 py-3 border border-green-600 rounded-xl">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 focus:ring-4 focus:ring-primary-500/50 focus:outline-none hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-6 py-3 bg-dark-700 text-dark-300 border border-dark-600 rounded-xl hover:bg-dark-600 hover:text-white transition-all duration-300 focus:ring-4 focus:ring-dark-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 focus:ring-4 focus:ring-primary-500/50 focus:outline-none hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
