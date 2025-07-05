import React from 'react';
import Navigation from '../Components/dashboard/navigation';
import EVRangePredictor from '../Components/EVRangePredictor';

const EVRangePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <Navigation />
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">EV Range Predictor</h1>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        Predict the range of your electric vehicle based on various parameters such as battery temperature,
                        state of charge, traffic conditions, and more. Get accurate range estimates to plan your trips better.
                    </p>
                </div>
                <EVRangePredictor />
            </div>
        </div>
    );
};

export default EVRangePage; 