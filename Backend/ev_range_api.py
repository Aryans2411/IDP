from flask import Flask, request, jsonify
from flask_cors import CORS
from ev_range_model import ev_range_predictor

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})

@app.route('/')
def home():
    return jsonify({
        "status": "success",
        "message": "EV Range Prediction API is running",
        "endpoints": {
            "predict_range": "/api/ev/predict-range"
        }
    })

@app.route('/api/ev/predict-range', methods=['POST'])
def predict_range():
    try:
        data = request.get_json()
        
        # Extract parameters with default values
        battery_temp = float(data.get('battery_temp', 0))
        current_charging = float(data.get('current_charging', 0))
        soc = float(data.get('soc', 0))
        battery_capacity = float(data.get('battery_capacity', 0))
        elevation = float(data.get('elevation', 0))
        traffic_status = data.get('traffic_status', 'Light')
        speed = float(data.get('speed', 0))
        wind_speed = float(data.get('wind_speed', 0))
        ac_usage = int(data.get('ac_usage', 0))
        trip_distance = float(data.get('trip_distance', 0))

        # Validate traffic status
        valid_traffic_statuses = ['Light', 'Moderate', 'Heavy']
        if traffic_status not in valid_traffic_statuses:
            return jsonify({
                "error": f"Invalid traffic status. Must be one of: {', '.join(valid_traffic_statuses)}"
            }), 400

        # Get prediction
        predicted_range = ev_range_predictor.predict_range(
            battery_temp=battery_temp,
            current_charging=current_charging,
            soc=soc,
            battery_capacity=battery_capacity,
            elevation=elevation,
            traffic_status=traffic_status,
            speed=speed,
            wind_speed=wind_speed,
            ac_usage=ac_usage
        )

        # Get charging suggestion if trip distance is provided
        charging_suggestion = None
        if trip_distance > 0:
            charging_suggestion = ev_range_predictor.get_optimal_charging_suggestion(
                current_soc=soc,
                predicted_range=predicted_range,
                trip_distance=trip_distance
            )

        return jsonify({
            "predicted_range": round(predicted_range, 2),
            "charging_suggestion": charging_suggestion
        })

    except ValueError as e:
        return jsonify({
            "error": f"Invalid input: {str(e)}"
        }), 400
    except Exception as e:
        return jsonify({
            "error": f"Prediction failed: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("Server running on port 5001")
    app.run(port=5001, debug=True) 