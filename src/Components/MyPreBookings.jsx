import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../lib/utils.url.js";

const MyPreBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [queueInfo, setQueueInfo] = useState({});

    useEffect(() => {
        fetchBookings();
        // Set up polling for real-time updates every 30 seconds
        const interval = setInterval(fetchBookings, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/my-prebookings`);
            console.log('Fetched bookings:', response.data);
            setBookings(response.data);
            
            // Fetch queue information for each booking
            const queueData = {};
            for (const booking of response.data) {
                if (booking.status === 'pending') {
                    try {
                        const queueResponse = await axios.get(`${API_BASE_URL}/api/queue/${booking.locationid}`);
                        queueData[booking.locationid] = queueResponse.data;
                    } catch (error) {
                        console.error('Error fetching queue info:', error);
                    }
                }
            }
            setQueueInfo(queueData);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setError('Failed to fetch bookings');
            setLoading(false);
        }
    };

    const handleMarkArrived = async (bookingId) => {
        try {
            await axios.post(`${API_BASE_URL}/api/prebook/${bookingId}/arrived`);
            // Refresh bookings after marking as arrived
            fetchBookings();
        } catch (error) {
            console.error('Error marking as arrived:', error);
            setError('Failed to mark as arrived');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'locked':
                return 'bg-green-100 text-green-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            case 'arrived':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const getTimeRemaining = (lockExpiresAt) => {
        if (!lockExpiresAt) return null;
        
        const now = new Date();
        const expiresAt = new Date(lockExpiresAt);
        const diff = expiresAt - now;
        
        if (diff <= 0) return 'Expired';
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getQueuePosition = (booking) => {
        if (booking.status !== 'pending' || !queueInfo[booking.locationid]) {
            return null;
        }
        
        const queue = queueInfo[booking.locationid].queue;
        const position = queue.findIndex(item => item.id === booking.id) + 1;
        return position;
    };

    const getPriorityLevel = (charge, eta) => {
        if (charge <= 20) return 'Critical';
        if (charge <= 40) return 'High';
        if (charge <= 60) return 'Medium';
        if (charge <= 80) return 'Low';
        return 'Very Low';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-gray-600">Loading your bookings...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-600 text-lg">No pre-bookings found</div>
                <div className="text-gray-500 text-sm mt-2">
                    Create a pre-booking from the charging stations map
                </div>
            </div>
        );
    }

    // Check if all vehicles are in queue
    const allVehiclesInQueue = bookings.every(booking => 
        booking.status === 'pending' || booking.status === 'locked'
    );

    return (
        <div className="space-y-4 bg-gray-800 rounded-lg p-6 mt-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">My Pre-Bookings</h3>
            
            {allVehiclesInQueue && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                    <div className="font-semibold">All vehicles in queue</div>
                    <div className="text-sm mt-1">
                        You have vehicles waiting in pre-booking queues. Once a booking is completed or expires, 
                        that vehicle will become available for new bookings.
                    </div>
                </div>
            )}
            
            {bookings.map((booking) => {
                const queuePosition = getQueuePosition(booking);
                const priorityLevel = getPriorityLevel(booking.currentcharge, booking.eta_minutes);
                
                return (
                    <div key={booking.id} className="bg-white rounded-lg p-4 shadow-md">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-semibold text-lg">
                                    {booking.registrationnumber} - {booking.make}
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Location: {booking.locationid}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Current Charge: <span className={`font-semibold ${
                                        booking.currentcharge <= 20 ? 'text-red-600' : 
                                        booking.currentcharge <= 40 ? 'text-orange-600' : 
                                        'text-green-600'
                                    }`}>{booking.currentcharge}%</span>
                                </p>
                                <p className="text-gray-600 text-sm">
                                    ETA: {(parseFloat(booking.eta_minutes) || 0).toFixed(1)} minutes
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Priority Level: <span className="font-semibold text-blue-600">{priorityLevel}</span>
                                </p>
                                {queuePosition && (
                                    <p className="text-gray-600 text-sm">
                                        Queue Position: <span className="font-semibold text-purple-600">#{queuePosition}</span>
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    {booking.status.toUpperCase()}
                                </span>
                                {booking.status === 'locked' && booking.lockexpiresat && (
                                    <div className="mt-2 text-sm">
                                        <div className="text-gray-600">Lock expires in:</div>
                                        <div className="font-mono text-lg font-bold text-red-600">
                                            {getTimeRemaining(booking.lockexpiresat)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-3">
                            Created: {formatTime(booking.createdat)}
                            {booking.lockexpiresat && (
                                <span className="ml-4">
                                    Lock expires: {formatTime(booking.lockexpiresat)}
                                </span>
                            )}
                        </div>
                        
                        {booking.status === 'locked' && (
                            <button
                                onClick={() => handleMarkArrived(booking.id)}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                            >
                                Mark as Arrived
                            </button>
                        )}
                        
                        {booking.status === 'pending' && (
                            <div className="text-center py-2 text-gray-600 text-sm">
                                Waiting in queue... {queuePosition && `(Position ${queuePosition})`}
                            </div>
                        )}
                        
                        {booking.status === 'expired' && (
                            <div className="text-center py-2 text-red-600 text-sm">
                                Booking expired - vehicle did not arrive in time
                            </div>
                        )}
                        
                        {booking.status === 'arrived' && (
                            <div className="text-center py-2 text-green-600 text-sm">
                                Vehicle has arrived at the charging station
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MyPreBookings; 