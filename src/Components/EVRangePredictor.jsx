import React, { useState } from 'react';

const EVRangePredictor = () => {
    const [formData, setFormData] = useState({
        battery_temp: '',
        current_charging: '',
        soc: '',
        battery_capacity: '',
        elevation: '',
        traffic_status: '',
        speed: '',
        wind_speed: '',
        ac_usage: '',
        trip_distance: ''
    });

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPrediction(null);

        // Convert string values to numbers where needed
        const numericData = {
            ...formData,
            battery_temp: parseFloat(formData.battery_temp),
            current_charging: parseFloat(formData.current_charging),
            soc: parseFloat(formData.soc),
            battery_capacity: parseFloat(formData.battery_capacity),
            elevation: parseFloat(formData.elevation),
            speed: parseFloat(formData.speed),
            wind_speed: parseFloat(formData.wind_speed),
            ac_usage: formData.ac_usage === 'off' ? 0 : 
                      formData.ac_usage === 'low' ? 1 :
                      formData.ac_usage === 'medium' ? 2 : 3,
            trip_distance: formData.trip_distance ? parseFloat(formData.trip_distance) : 0
        };

        try {
            const response = await fetch('http://localhost:5001/api/ev/predict-range', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(numericData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get prediction');
            }

            const data = await response.json();
            setPrediction(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 p-8 rounded-xl border border-gray-700 shadow-2xl hover:shadow-blue-500 transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-white mb-6">EV Range Prediction</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Battery Temperature (°C)
                        </label>
                        <input
                            type="number"
                            name="battery_temp"
                            value={formData.battery_temp}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Current Charging (A)
                        </label>
                        <input
                            type="number"
                            name="current_charging"
                            value={formData.current_charging}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            State of Charge (%)
                        </label>
                        <input
                            type="number"
                            name="soc"
                            value={formData.soc}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Battery Capacity (kWh)
                        </label>
                        <input
                            type="number"
                            name="battery_capacity"
                            value={formData.battery_capacity}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Elevation (m)
                        </label>
                        <input
                            type="number"
                            name="elevation"
                            value={formData.elevation}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Traffic Status
                        </label>
                        <select
                            name="traffic_status"
                            value={formData.traffic_status}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3"
                            required
                        >
                            <option value="">Select traffic status</option>
                            <option value="Light">Light</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Heavy">Heavy</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Speed (km/h)
                        </label>
                        <input
                            type="number"
                            name="speed"
                            value={formData.speed}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Wind Speed (km/h)
                        </label>
                        <input
                            type="number"
                            name="wind_speed"
                            value={formData.wind_speed}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            AC Usage
                        </label>
                        <select
                            name="ac_usage"
                            value={formData.ac_usage}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3"
                            required
                        >
                            <option value="">Select AC usage</option>
                            <option value="off">Off</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Trip Distance (km) (Optional)
                        </label>
                        <input
                            type="number"
                            name="trip_distance"
                            value={formData.trip_distance}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 p-3"
                        />
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {loading ? 'Predicting...' : 'Predict Range'}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {prediction && (
                    <div className="mt-6 p-6 bg-gray-700/50 rounded-lg border border-gray-600">
                        <h3 className="text-xl font-semibold text-white mb-4">Prediction Results</h3>
                        <div className="space-y-2">
                            <p className="text-gray-300">
                                <span className="font-medium">Predicted Range:</span> {prediction.predicted_range.toFixed(2)} km
                            </p>
                            {formData.trip_distance && (
                                <p className="text-gray-300">
                                    <span className="font-medium">Trip Distance:</span> {formData.trip_distance} km
                                </p>
                            )}
                            {formData.trip_distance && (
                                <p className={`text-${prediction.predicted_range >= formData.trip_distance ? 'green' : 'red'}-400 font-medium`}>
                                    {prediction.predicted_range >= formData.trip_distance
                                        ? '✅ Sufficient range for the trip'
                                        : '⚠️ Insufficient range for the trip'}
                                </p>
                            )}
                            {prediction.charging_suggestion && (
                                <p className="text-gray-300">
                                    <span className="font-medium">Charging Suggestion:</span> {prediction.charging_suggestion}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default EVRangePredictor; 