from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import json

app = Flask(__name__)
CORS(app)

# Load trained model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(
    os.path.join(BASE_DIR, "heart_disease_model.pkl")
)

# Load evaluation metrics
with open(os.path.join(BASE_DIR, "evaluation_results.json")) as file:
    evaluation_results = json.load(file)


@app.route("/", methods=["GET"])
def home():
    return send_from_directory(
        os.path.join(os.path.dirname(BASE_DIR), "frontend"),
        "index.html"
    )

@app.route("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(
        os.path.join(os.path.dirname(BASE_DIR), "frontend"),
        filename
    )

@app.route("/metrics", methods=["GET"])
def get_metrics():
    return jsonify(evaluation_results)


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        required_fields = [
            "age",
            "sex",
            "blood_pressure",
            "cholesterol",
            "bmi",
            "smoker",
            "diabetes",
            "physical_activity",
            "family_history",
            "stress_level"
        ]

        # Check required inputs
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}"
                }), 400

        # Prepare input data in the original training column order
        input_data = pd.DataFrame([{
            "age": int(data["age"]),
            "sex": str(data["sex"]),
            "blood_pressure": int(data["blood_pressure"]),
            "cholesterol": int(data["cholesterol"]),
            "bmi": float(data["bmi"]),
            "smoker": str(data["smoker"]),
            "diabetes": str(data["diabetes"]),
            "physical_activity": int(data["physical_activity"]),
            "family_history": str(data["family_history"]),
            "stress_level": int(data["stress_level"])
        }])

        # Validate categorical values
        if input_data["sex"].iloc[0] not in ["Male", "Female"]:
            return jsonify({"error": "Invalid sex value"}), 400

        for field in ["smoker", "diabetes", "family_history"]:
            if input_data[field].iloc[0] not in ["Yes", "No"]:
                return jsonify({
                    "error": f"Invalid value for {field}"
                }), 400

        # Make prediction
        prediction = int(model.predict(input_data)[0])

        probability = model.predict_proba(input_data)[0][1]

        result = (
            "Heart Disease Detected"
            if prediction == 1
            else "No Heart Disease Detected"
        )

        return jsonify({
            "prediction": prediction,
            "result": result,
            "probability": round(float(probability) * 100, 2),
            "model": "Random Forest",
            "disclaimer": (
                "This prediction is for academic demonstration only "
                "and is not a medical diagnosis."
            )
        })

    except (ValueError, TypeError):
        return jsonify({
            "error": "Please provide valid input values."
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
