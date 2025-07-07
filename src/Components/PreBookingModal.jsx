import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../lib/utils.url.js";

const PreBookingModal = ({ isOpen, onClose, selectedLocation, onBookingSuccess }) => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [currentCharge, setCurrentCharge] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [queueStatus, setQueueStatus] = useState(null);

    useEffect(() => {
        if (isOpen && selectedLocation?.id) {
            fetchAvailableVehicles();
        }
    }, [isOpen, selectedLocation]);

    const fetchAvailableVehicles = async () => {
        try {
            if (!selectedLocation?.id) {
                setError('No location selected');
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/available-vehicles?locationid=${selectedLocation.id}`);
            
            // Handle the new response structure
            setQueueStatus(response.data.queueStatus);
            
            if (response.data.queueStatus?.isFull) {
                setVehicles([]);
                setError(`This location is at maximum capacity (${response.data.queueStatus.currentCount}/${response.data.queueStatus.maxCapacity} vehicles). Please try another location.`);
                return;
            }
            
            setVehicles(response.data.availableVehicles || []);
            
            if ((response.data.availableVehicles || []).length === 0) {
                setError('No electric vehicles available for pre-booking. All your vehicles may already be in a queue.');
            }
        } catch (error) {
            console.error('Error fetching available vehicles:', error);
            if (error.response?.status === 400) {
                setError('Location ID is required');
            } else {
                setError('Failed to fetch available vehicles');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!selectedVehicle || !currentCharge) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (currentCharge < 0 || currentCharge > 100) {
            setError('Current charge must be between 0 and 100');
            setLoading(false);
            return;
        }

        try {
            const bookingData = {
                vehicleid: selectedVehicle,
                locationid: selectedLocation.id,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                currentcharge: parseFloat(currentCharge)
            };

            const response = await axios.post(`${API_BASE_URL}/api/prebook`, bookingData);
            
            setSuccess(`Booking successful! ETA: ${response.data.eta.toFixed(1)} minutes`);
            setSelectedVehicle('');
            setCurrentCharge('');
            
            if (onBookingSuccess) {
                onBookingSuccess(response.data);
            }
            
            // Refresh available vehicles after successful booking
            fetchAvailableVehicles();
            
            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 2000);

        } catch (error) {
            console.error('Error creating booking:', error);
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Failed to create booking');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Pre-Book Charging Spot</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {selectedLocation && (
                    <div className="mb-4 p-3 bg-gray-100 rounded">
                        <p className="text-sm text-gray-600">Selected Location:</p>
                        <p className="font-medium">{selectedLocation.name || `Location ${selectedLocation.id}`}</p>
                        {queueStatus && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-sm text-gray-600">Queue Status:</p>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        queueStatus.isFull ? 'bg-red-100 text-red-800' :
                                        queueStatus.currentCount >= 4 ? 'bg-orange-100 text-orange-800' :
                                        queueStatus.currentCount >= 2 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {queueStatus.currentCount}/{queueStatus.maxCapacity} vehicles
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {queueStatus.remainingSlots} slots available
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Available Vehicle
                        </label>
                        <select
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Choose an available vehicle</option>
                            {vehicles.map((vehicle) => (
                                <option key={vehicle.vehicleid} value={vehicle.vehicleid}>
                                    {vehicle.registrationnumber} - {vehicle.make}
                                </option>
                            ))}
                        </select>
                        {vehicles.length === 0 && (
                            <p className="text-sm text-red-600 mt-1">
                                No vehicles available for pre-booking
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Charge (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentCharge}
                            onChange={(e) => setCurrentCharge(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter current charge percentage"
                            required
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {success}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || vehicles.length === 0}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Book Spot'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PreBookingModal; 