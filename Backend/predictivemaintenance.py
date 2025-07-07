from flask import Flask, request, jsonify
import pickle
import numpy as np
from datetime import datetime, timedelta
from flask_cors import CORS
import os
# Load the .env file

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing (CORS) for React frontend

# Load the trained model
model_path = "hhmodel.pkl"
# model_path = "Backend\hhmodel.pkl" # Update to the correct path

try:
    with open(model_path, 'rb') as file:
        model = pickle.load(file)
    print("Model loaded successfully")
except FileNotFoundError:
    print(f"Error: Model file '{model_path}' not found.")
    model = None
except ModuleNotFoundError as e:
    print(f"Error: Module compatibility issue - {e}")
    print("This usually happens when the model was trained with a different scikit-learn version.")
    print("Try updating scikit-learn: pip install --upgrade scikit-learn")
    model = None
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Define constants
THRESHOLD = 0.6  # Probability threshold for maintenance recommendation
MAX_DAYS_TO_MAINTENANCE = 30  # Max possible days to maintenance when probability is 1.0

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({
                'error': 'Model not loaded. Please check the server logs for details.'
            }), 500
            
        # Parse input data
        data = request.get_json()
        # print(data)
        test_instance = np.array(list(data.values())).reshape(1, -1)
        # print(test_instance)
        # print(test_instance)
        # Perform prediction
        probability = model.predict_proba(test_instance)[0, 1]  # Probability for class 1
        prediction = model.predict(test_instance)[0]  # Predicted class (0 or 1)

        # Calculate days to maintenance
        if probability > THRESHOLD:
            days_to_maintenance = int(MAX_DAYS_TO_MAINTENANCE * probability)
            maintenance_date = datetime.now() + timedelta(days=days_to_maintenance)
            maintenance_date_str = maintenance_date.strftime('%Y-%m-%d')
        else:
            days_to_maintenance = None
            maintenance_date_str = "No maintenance needed"

        # Prepare response
        engine_condition = "Normal" if prediction == 0 else "Needs Maintenance"
        response = {
            'predicted_class': int(prediction),
            'probability': float(probability),
            'threshold': THRESHOLD,
            'days_to_maintenance': days_to_maintenance,
            'maintenance_date': maintenance_date_str,
            'engine_condition': engine_condition,
        }
        print(response)
        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Run the app
if __name__ == '__main__':
    app.run(debug=True,port=5002)
