import React from "react";

export default function Admin() {
  return (
    <div className="mt-6 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Dashboard Cards */}
      <div className="card">
        <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">Toal Users</h3>
          <p className="text-3xl font-bold text-green-400"></p>
        </div>
      </div>
      <div className="card">
        <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">Total Vehicles</h3>
          <p className="text-3xl font-bold text-blue-400"> </p>
        </div>
      </div>
      <div className="card">
        <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">Total Drivers</h3>
          <p className="text-3xl font-bold text-red-400"></p>
        </div>
      </div>
      <div className="card">
        <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">Vehicles</h3>
          <p className="text-3xl font-bold text-yellow-400"> </p>
        </div>
      </div>
      <div className="card">
        <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">Active Vehicles</h3>
          <p className="text-3xl font-bold text-teal-400"> </p>
        </div>
      </div>
      <div className="card">
        <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">
            Vehicles in Maintenance
          </h3>
          <p className="text-3xl font-bold text-orange-400"> </p>
        </div>
      </div>
      <div className="card">
        <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">Unused Vehicles</h3>
          <p className="text-3xl font-bold text-purple-400"></p>
        </div>
      </div>
      <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
        <h3 className="text-xl font-semibold mb-2">Drivers</h3>
        <p className="text-3xl font-bold text-blue-400"> </p>
      </div>
    </div>
  );
}
