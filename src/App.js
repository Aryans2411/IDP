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

function App() {
  return (
    <div className=" ">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/vehicle" element={<Vehicle />} />
          {/* Add routes for other pages as needed */}
          <Route path="/driver" element={<Driver />} />
          <Route path="/trip" element={<Trip />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/databridgeai" element={<Databridgeai />} />
          <Route path="/ev-range" element={<EVRangePage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
