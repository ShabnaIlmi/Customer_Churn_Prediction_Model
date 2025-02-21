import json
import numpy as np
import joblib  # Assuming your model is saved with joblib
from sklearn.preprocessing import StandardScaler

# Load the models and scaler
rf_model_banking = joblib.load("models/banking_model.joblib")  # Replace with your actual model file
rf_model_telecom = joblib.load("models/telecom_model.joblib")  # Replace with your actual model file
scaler = joblib.load("models/scaler.joblib")  # Load scaler for scaling the features

# Load input data from sample_input.json
with open("data/sample_input.json", "r") as file:
    data = json.load(file)

# Extract banking input features and process (one-hot encoding, etc.)
banking_input = np.array([
    data["banking"]["CreditScore"], data["banking"]["Age"], data["banking"]["Tenure"],
    data["banking"]["Balance"], data["banking"]["NumOfProducts"], data["banking"]["HasCrCard"],
    data["banking"]["IsActiveMember"], data["banking"]["EstimatedSalary"], data["banking"]["Complain"],
    data["banking"]["SatisfactionScore"], data["banking"]["PointsEarned"], data["banking"]["France"],
    data["banking"]["Germany"], data["banking"]["Spain"], data["banking"]["Male"], data["banking"]["Female"],
    data["banking"]["DIAMOND"], data["banking"]["GOLD"], data["banking"]["SILVER"], data["banking"]["PLATINUM"]
]).reshape(1, -1)

# Scale the banking input features
scaled_banking_input = scaler.transform(banking_input)

# Predict churn for banking model
banking_prediction = rf_model_banking.predict(scaled_banking_input)
banking_churn_status = "Churned" if banking_prediction[0] == 1 else "Not Churned"
banking_churn_prob = rf_model_banking.predict_proba(scaled_banking_input)[0][1]  # Probability of churn

# Extract telecom input features and process (one-hot encoding, etc.)
telecom_input = np.array([
    data["telecom"]["PaperlessBilling"], data["telecom"]["SeniorCitizen"], data["telecom"]["StreamingTV"],
    data["telecom"]["StreamingMovies"], data["telecom"]["MultipleLines"], data["telecom"]["PhoneService"],
    data["telecom"]["DeviceProtection"], data["telecom"]["OnlineBackup"], data["telecom"]["Partner"],
    data["telecom"]["Dependents"], data["telecom"]["TechSupport"], data["telecom"]["OnlineSecurity"],
    data["telecom"]["MonthlyCharges"], data["telecom"]["TotalCharges"], data["telecom"]["Tenure"]
] + [
    1 if data["telecom"]["Contract"] == "Month-to-month" else 0,
    1 if data["telecom"]["Contract"] == "One year" else 0,
    1 if data["telecom"]["Contract"] == "Two year" else 0
] + [
    1 if data["telecom"]["InternetService"] == "Fiber optic" else 0,
    1 if data["telecom"]["InternetService"] == "DSL" else 0,
    1 if data["telecom"]["InternetService"] == "No" else 0
] + [
    1 if data["telecom"]["PaymentMethod"] == "Electronic check" else 0,
    1 if data["telecom"]["PaymentMethod"] == "Mailed check" else 0,
    1 if data["telecom"]["PaymentMethod"] == "Bank transfer (automatic)" else 0,
    1 if data["telecom"]["PaymentMethod"] == "Credit card (automatic)" else 0
] + [
    1 if data["telecom"]["gender"] == "Male" else 0,
    1 if data["telecom"]["gender"] == "Female" else 0
]).reshape(1, -1)

# Scale the telecom input features
scaled_telecom_input = scaler.transform(telecom_input)

# Predict churn for telecom model
telecom_prediction = rf_model_telecom.predict(scaled_telecom_input)
telecom_churn_status = "Churned" if telecom_prediction[0] == 1 else "Not Churned"
telecom_churn_prob = rf_model_telecom.predict_proba(scaled_telecom_input)[0][1]  # Probability of churn

# Save the predictions to predictions.json
predictions = {
    "banking_prediction": {
        "ChurnStatus": banking_churn_status,
        "ChurnProbability": banking_churn_prob
    },
    "telecom_prediction": {
        "ChurnStatus": telecom_churn_status,
        "ChurnProbability": telecom_churn_prob
    }
}

with open("data/predictions.json", "w") as file:
    json.dump(predictions, file, indent=4)

print("Predictions saved to predictions.json")
