import React, { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Trip from "./Page/Trip.jsx";
import Vehicle from "./Page/vehicle.jsx";

import Driver from "./Page/driver.jsx";

import Analytics from "./Page/analytics.jsx";

import Home from "./Page/home.jsx";
import LandingPage from "./Page/landing.jsx";
import Login from "./Components/Login/Login.jsx";
import Signup from "./Components/Signup/Signup.jsx";
import Databridgeai from "./Page/databridgeai.jsx";
import EVRangePage from "./Page/EVRangePage.jsx";
import Profile from "./Page/Profile.jsx";

// Lazy load components for better performance
const LandingPageLazy = lazy(() => import("./Page/landing"));
const LoginLazy = lazy(() => import("./Components/Login/Login"));
const SignupLazy = lazy(() => import("./Components/Signup/Signup"));
const HomeLazy = lazy(() => import("./Page/home"));
const VehicleLazy = lazy(() => import("./Page/vehicle"));
const DriverLazy = lazy(() => import("./Page/driver"));
const AnalyticsLazy = lazy(() => import("./Page/analytics"));
const TripLazy = lazy(() => import("./Page/Trip"));
const DataBridgeAILazy = lazy(() => import("./Page/databridgeai"));
const EVRangePageLazy = lazy(() => import("./Page/EVRangePage"));
const ProfileLazy = lazy(() => import("./Page/Profile"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading...</p>
    </div>
  </div>
);

// Error boundary component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="text-red-400 text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-white mb-4">
        Something went wrong
      </h1>
      <p className="text-gray-300 mb-6">
        We're sorry, but something unexpected happened. Please try refreshing
        the page.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  </div>
);

function App() {
  return (
    <div className=" ">
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPageLazy />} />
            <Route path="/login" element={<LoginLazy />} />
            <Route path="/signup" element={<SignupLazy />} />
            <Route path="/home" element={<HomeLazy />} />
            <Route path="/vehicle" element={<VehicleLazy />} />
            {/* Add routes for other pages as needed */}
            <Route path="/driver" element={<DriverLazy />} />
            <Route path="/trip" element={<TripLazy />} />
            <Route path="/analytics" element={<AnalyticsLazy />} />
            <Route path="/databridgeai" element={<DataBridgeAILazy />} />
            <Route path="/ev-range" element={<EVRangePageLazy />} />
            <Route path="/profile" element={<ProfileLazy />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
