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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Navigation />

      <div className="container mx-auto px-4 py-4">
        <h1 className="text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-900">
          Predictive Maintenance Analysis
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/50   p-8 rounded-xl border border-gray-700 shadow-2xl hover:shadow-blue-500 transition-shadow duration-300"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Registration Number Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Registration Number
              </label>
              <input
                type="text"
                name="registrationnumber"
                value={registrationnumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3 transition-all duration-300"
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
              <div key={index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {field.label}
                </label>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3 transition-all duration-300"
                  placeholder={`Enter ${field.label}`}
                  required
                />
              </div>
            ))}

            {/* Fuel Type Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Fuel Type
              </label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleInputChange}
                className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3 transition-all duration-300"
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
              className="bg-gradient-to-r from-sky-400 to-indigo-900 hover:bg-linear-to-r hover:from-gray-800 hover:via-blue-700 hover:to-gray-900 text-white font-semibold py-3 px-8 rounded-lg transition  duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-allowed"
            >
              {isLoading ? "Processing..." : "Get Maintenance Prediction"}
            </button>
          </div>
        </form>

        {/* Prediction Result Display */}
        {predictionResult && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-md p-8 rounded-xl border border-gray-700 shadow-2xl hover:shadow-green-500/10 transition-shadow duration-300">
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              Prediction Results
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-200">
                  Engine Condition
                </h3>
                <p
                  className={`text-2xl font-bold ${
                    predictionResult.engine_condition === "Normal"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {predictionResult.engine_condition}
                </p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-200">
                  Maintenance Probability
                </h3>
                <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${predictionResult.probability * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-gray-300 mt-2">
                  {Math.round(predictionResult.probability * 100)}%
                </p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-200">
                  Maintenance Date
                </h3>
                <p className={`text-2xl font-bold`}>
                  {predictionResult.maintenance_date}{" "}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-900/50 backdrop-blur-md p-6 rounded-xl border border-red-700 shadow-2xl hover:shadow-red-500/10 transition-shadow duration-300">
            <p className="text-red-200">{error}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
