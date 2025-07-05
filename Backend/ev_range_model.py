import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

class EVRangePredictor:
    def __init__(self):
        self.model = None
        self.X_train_encoded = None
        self.model_path = os.path.join(os.path.dirname(__file__), 'ev_range_model.joblib')
        self._initialize_model()

    def _initialize_model(self):
        try:
            if os.path.exists(self.model_path):
                print("Loading existing model...")
                loaded_data = joblib.load(self.model_path)
                self.model = loaded_data['model']
                self.X_train_encoded = loaded_data['X_train_encoded']
                print("Model loaded successfully")
            else:
                print("Training new model...")
                self._train_model()
                print("Model trained successfully")
        except Exception as e:
            print(f"Error loading/training model: {str(e)}")
            print("Training new model...")
            self._train_model()
            print("Model trained successfully")

    def _train_model(self):
        # Generate synthetic dataset
        np.random.seed(42)
        n_samples = 10000

        data = {
            'battery_temp': np.random.uniform(0, 40, n_samples),
            'current_charging': np.random.uniform(0, 100, n_samples),
            'soc': np.random.uniform(0, 100, n_samples),
            'battery_capacity': np.random.uniform(50, 100, n_samples),
            'elevation': np.random.uniform(-100, 1000, n_samples),
            'traffic_status': np.random.choice(['Light', 'Moderate', 'Heavy'], n_samples),
            'speed': np.random.uniform(0, 120, n_samples),
            'wind_speed': np.random.uniform(0, 30, n_samples),
            'ac_usage': np.random.choice([0, 1], n_samples)
        }

        df = pd.DataFrame(data)

        # Calculate range based on factors
        df['range'] = (
            df['battery_capacity'] * 5  # Base range
            - df['battery_temp'] * 0.5  # Temperature impact
            - (df['elevation'].clip(lower=0) * 0.02)  # Elevation impact
            - (df['speed'] ** 2 * 0.001)  # Speed impact
            - (df['wind_speed'] * 0.5)  # Wind impact
            - (df['ac_usage'] * 10)  # AC usage impact
        )

        # Traffic impact
        traffic_impact = {'Light': 1, 'Moderate': 0.9, 'Heavy': 0.7}
        df['range'] *= df['traffic_status'].map(traffic_impact)

        # Ensure range is always positive
        df['range'] = df['range'].clip(lower=0)

        # Split data
        X = df.drop('range', axis=1)
        y = df['range']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # One-hot encode categorical variables
        self.X_train_encoded = pd.get_dummies(X_train)
        X_test_encoded = pd.get_dummies(X_test)

        # Train Random Forest model
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(self.X_train_encoded, y_train)

        # Save the model and encoded training data
        save_data = {
            'model': self.model,
            'X_train_encoded': self.X_train_encoded
        }
        joblib.dump(save_data, self.model_path)

    def predict_range(self, battery_temp, current_charging, soc, battery_capacity, 
                     elevation, traffic_status, speed, wind_speed, ac_usage):
        if self.model is None or self.X_train_encoded is None:
            raise Exception("Model not properly initialized")

        input_data = pd.DataFrame({
            'battery_temp': [battery_temp],
            'current_charging': [current_charging],
            'soc': [soc],
            'battery_capacity': [battery_capacity],
            'elevation': [elevation],
            'traffic_status': [traffic_status],
            'speed': [speed],
            'wind_speed': [wind_speed],
            'ac_usage': [ac_usage]
        })
        
        # One-hot encode the input data
        input_encoded = pd.get_dummies(input_data)
        
        # Ensure all columns from training are present
        for col in self.X_train_encoded.columns:
            if col not in input_encoded.columns:
                input_encoded[col] = 0
        
        # Reorder columns to match training data
        input_encoded = input_encoded[self.X_train_encoded.columns]
        
        return float(self.model.predict(input_encoded)[0])

    def get_optimal_charging_suggestion(self, current_soc, predicted_range, trip_distance):
        if predicted_range >= trip_distance * 1.2:  # 20% buffer
            return "No charging needed for this trip."
        elif current_soc < 20:
            return "Charge immediately to at least 50% for battery health."
        else:
            charge_needed = min((trip_distance / predicted_range) * 100, 80)
            return f"Charge to {charge_needed:.0f}% for optimal range and battery health."

# Create a singleton instance
ev_range_predictor = EVRangePredictor() 