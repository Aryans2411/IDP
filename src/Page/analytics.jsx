import React, { useState } from "react";
import axios from "axios";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";

export default function Analytics() {
  const [formData, setFormData] = useState({
    registrationnumber: "",
    engine_rpm: "",
    lub_oil_pressure: "",
    fuel_pressure: "",
    coolant_pressure: "",
    lub_oil_temp: "",
    coolant_temp: "",
    fuel_type: "",
    mileage: "",
    fuel_consumption_rate: "",
    engine_runtime: "",
    temperature_difference: "",
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationnumber, setRegistrationNumber] = useState(null);
  const [nextduedate, setNextduedate] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "fuel_type") {
      const fuelTypeValue =
        value === "petrol" ? 0.0 : value === "diesel" ? 1.0 : value;
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
        [`${name}_numeric`]: fuelTypeValue,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      const submissionData = {
        engine_rpm: parseFloat(formData.engine_rpm),
        lub_oil_pressure: parseFloat(formData.lub_oil_pressure),
        fuel_pressure: parseFloat(formData.fuel_pressure),
        coolant_pressure: parseFloat(formData.coolant_pressure),
        lub_oil_temp: parseFloat(formData.lub_oil_temp),
        coolant_temp: parseFloat(formData.coolant_temp),
        fuel_type: formData.fuel_type === "petrol" ? 0.0 : 1.0,
        mileage: parseFloat(formData.mileage),
        fuel_consumption_rate: parseFloat(formData.fuel_consumption_rate),
        engine_runtime: parseFloat(formData.engine_runtime),
        temperature_difference: parseFloat(formData.temperature_difference),
      };

      const response = await axios.post(
        "http://localhost:5002/predict",
        submissionData
      );

      setPredictionResult(response.data);
      const maintenanceDate = response.data.maintenance_date;
      setNextduedate(maintenanceDate);
      console.log(maintenanceDate, " ", registrationnumber);
      await fetch("http://localhost:4000/api/set_maintenance_date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nextduedate: maintenanceDate,
          registrationnumber: registrationnumber,
        }),
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during prediction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 text-white">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 animate-fade-in">
          Predictive Maintenance Analysis
        </h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Leverage predictive maintenance to anticipate and address potential
          vehicle issues before they occur. Analyze key parameters and
          maintenance history to minimize downtime, reduce costs, and ensure
          optimal fleet performance.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-dark-800/80 to-dark-700/80 backdrop-blur-xl p-8 rounded-2xl border border-dark-600/50 shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 animate-slide-up"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Registration Number Field */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-dark-200">
                Registration Number
              </label>
              <input
                type="text"
                name="registrationnumber"
                value={registrationnumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full bg-dark-700/50 text-white rounded-xl border border-dark-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 p-4 transition-all duration-300 placeholder-dark-400"
                placeholder="Enter Registration Number"
                required
              />
            </div>

            {/* Existing Input Fields */}
            {[
              { label: "Engine RPM", name: "engine_rpm" },
              { label: "Lubricant Oil Pressure", name: "lub_oil_pressure" },
              { label: "Fuel Pressure", name: "fuel_pressure" },
              { label: "Coolant Pressure", name: "coolant_pressure" },
              { label: "Lubricant Oil Temperature", name: "lub_oil_temp" },
              { label: "Coolant Temperature", name: "coolant_temp" },
              { label: "Mileage", name: "mileage" },
              { label: "Fuel Consumption Rate", name: "fuel_consumption_rate" },
              { label: "Engine Runtime", name: "engine_runtime" },
              {
                label: "Temperature Difference",
                name: "temperature_difference",
              },
            ].map((field, index) => (
              <div key={index} className="space-y-3">
                <label className="block text-sm font-medium text-dark-200">
                  {field.label}
                </label>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full bg-dark-700/50 text-white rounded-xl border border-dark-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 p-4 transition-all duration-300 placeholder-dark-400"
                  placeholder={`Enter ${field.label}`}
                  required
                />
              </div>
            ))}

            {/* Fuel Type Dropdown */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-dark-200">
                Fuel Type
              </label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleInputChange}
                className="w-full bg-dark-700/50 text-white rounded-xl border border-dark-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 p-4 transition-all duration-300"
                required
              >
                <option value="">Select Fuel Type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 hover:from-primary-700 hover:via-secondary-700 hover:to-accent-700 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-bounce-gentle"
            >
              {isLoading ? "Processing..." : "Get Maintenance Prediction"}
            </button>
          </div>
        </form>

        {/* Prediction Result Display */}
        {predictionResult && (
          <div className="mt-8 bg-gradient-to-br from-dark-800/80 to-dark-700/80 backdrop-blur-xl p-8 rounded-2xl border border-dark-600/50 shadow-2xl hover:shadow-accent-500/20 transition-all duration-500 animate-slide-up">
            <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-primary-400">
              Prediction Results
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-dark-700/50 to-dark-600/50 p-6 rounded-xl border border-dark-600/50 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold text-dark-200 mb-3">
                  Engine Condition
                </h3>
                <p
                  className={`text-3xl font-bold ${
                    predictionResult.engine_condition === "Normal"
                      ? "text-accent-400"
                      : "text-red-400"
                  }`}
                >
                  {predictionResult.engine_condition}
                </p>
              </div>
              <div className="bg-gradient-to-br from-dark-700/50 to-dark-600/50 p-6 rounded-xl border border-dark-600/50 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold text-dark-200 mb-3">
                  Maintenance Probability
                </h3>
                <div className="w-full bg-dark-600 rounded-full h-3 mt-3">
                  <div
                    className="bg-gradient-to-r from-accent-500 to-primary-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${predictionResult.probability * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-dark-300 mt-3 text-lg font-semibold">
                  {Math.round(predictionResult.probability * 100)}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-dark-700/50 to-dark-600/50 p-6 rounded-xl border border-dark-600/50 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold text-dark-200 mb-3">
                  Maintenance Date
                </h3>
                <p className="text-3xl font-bold text-primary-400">
                  {predictionResult.maintenance_date}{" "}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-gradient-to-br from-red-900/50 to-red-800/50 backdrop-blur-xl p-6 rounded-2xl border border-red-700/50 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 animate-slide-up">
            <p className="text-red-200 text-lg">{error}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
