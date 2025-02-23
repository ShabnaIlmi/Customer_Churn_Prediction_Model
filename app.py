import warnings
import numpy as np
import pickle
import os
from flask import Flask, request, jsonify, render_template

# Suppress Specific Sklearn Warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

app = Flask(__name__)

# Load Pretrained Models and Scalers
try:
    with open('models/telecom_model.pkl', 'rb') as f:
        telecom_model = pickle.load(f)

    with open('models/banking_model.pkl', 'rb') as f:
        banking_model = pickle.load(f)

    with open('models/telecom_scaler.pkl', 'rb') as f:
        telecom_scaler = pickle.load(f)

    with open('models/banking_scaler.pkl', 'rb') as f:
        banking_scaler = pickle.load(f)

except Exception as e:
    print(f"Error loading models or scalers: {e}")
    exit(1)

# Function to Parse Bank Customer Form Data
def parse_banking_form(form_data):
    try:
        tenure = int(form_data['tenure'])
        monthly_charges = float(form_data['monthly_charges'])
        total_charges = float(form_data['total_charges'])
        paperless_billing = int(form_data['paperless_billing'])
        senior_citizen = int(form_data['senior_citizen'])
        streaming_tv = int(form_data['streaming_tv'])
        streaming_movies = int(form_data['streaming_movies'])
        multiple_lines = int(form_data['multiple_lines'])
        phone_service = int(form_data['phone_service'])
        device_protection = int(form_data['device_protection'])
        online_backup = int(form_data['online_backup'])
        partner = int(form_data['partner'])
        dependents = int(form_data['dependents'])
        tech_support = int(form_data['tech_support'])
        online_security = int(form_data['online_security'])
        gender = form_data['gender']

        # One-hot Encoding Categorical Variables
        contract = form_data['contract']
        internet_service = form_data['internet_service']
        payment_method = form_data['payment_method']

        contract_encoded = [1 if contract == "Month-to-month" else 0,
                            1 if contract == "One year" else 0,
                            1 if contract == "Two year" else 0]

        internet_service_encoded = [1 if internet_service == "Fiber optic" else 0,
                                    1 if internet_service == "DSL" else 0,
                                    1 if internet_service == "No" else 0]

        payment_method_encoded = [1 if payment_method == "Electronic check" else 0,
                                  1 if payment_method == "Mailed check" else 0,
                                  1 if payment_method == "Bank transfer (automatic)" else 0,
                                  1 if payment_method == "Credit card (automatic)" else 0]

        gender_encoded = [1 if gender == "Male" else 0, 1 if gender == "Female" else 0]

        # Create Features Array
        features = np.array([paperless_billing, senior_citizen, streaming_tv, streaming_movies,
                             multiple_lines, phone_service, device_protection, online_backup,
                             partner, dependents, tech_support, online_security,
                             monthly_charges, total_charges, tenure] +
                            contract_encoded + internet_service_encoded + payment_method_encoded + gender_encoded).reshape(1, -1)
        return features

    except KeyError as e:
        raise ValueError(f"Missing required field: {e}")
    except Exception as e:
        raise ValueError(f"Error processing form data: {e}")

# Function to Parse Telecom Customer Form Data
def parse_telecom_form(form_data):
    try:
        credit_score = int(form_data['credit_score'])
        age = int(form_data['age'])
        tenure = int(form_data['tenure'])
        balance = float(form_data['balance'])
        num_of_products = int(form_data['num_of_products'])
        has_cr_card = int(form_data['has_cr_card'])
        is_active_member = int(form_data['is_active_member'])
        estimated_salary = float(form_data['estimated_salary'])
        satisfaction_score = int(form_data['satisfaction_score'])
        point_earned = int(form_data['point_earned'])
        geography = form_data['geography']
        gender = form_data['gender']
        card_type = form_data['card_type']

        # One-hot Encoding Categorical Variables
        geography_encoded = [1 if geography == "France" else 0,
                             1 if geography == "Germany" else 0,
                             1 if geography == "Spain" else 0]
        gender_encoded = [1 if gender == "Male" else 0, 1 if gender == "Female" else 0]
        card_type_encoded = [1 if card_type == "DIAMOND" else 0,
                             1 if card_type == "GOLD" else 0,
                             1 if card_type == "SILVER" else 0,
                             1 if card_type == "PLATINUM" else 0]

        # Create Feature Array
        features = np.array([credit_score, age, tenure, balance, num_of_products,
                             has_cr_card, is_active_member, estimated_salary,
                             satisfaction_score, point_earned] +
                            geography_encoded + gender_encoded + card_type_encoded).reshape(1, -1)
        return features

    except KeyError as e:
        raise ValueError(f"Missing required field: {e}")
    except Exception as e:
        raise ValueError(f"Error processing form data: {e}")

# Predict Bank Churn
@app.route('/api/bank-churn-prediction', methods=['GET'])
def predict_banking():
    try:
        form_data = request.get_json()  # Parse incoming JSON request
        user_data = parse_banking_form(form_data)
        user_data_scaled = banking_scaler.transform(user_data)
        prediction = banking_model.predict(user_data_scaled)
        return jsonify({'prediction': "Churned" if prediction[0] == 1 else "Not Churned"})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An error occurred during prediction.'}), 500

# Predict Telecom Churn
@app.route('/api/telecom-churn-prediction', methods=['GET'])
def predict_telecom():
    try:
        form_data = request.get_json()  # Parse incoming JSON request
        user_data = parse_telecom_form(form_data)
        user_data_scaled = telecom_scaler.transform(user_data)
        prediction = telecom_model.predict(user_data_scaled)
        return jsonify({'prediction': "Churned" if prediction[0] == 1 else "Not Churned"})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An error occurred during prediction.'}), 500

# About Me Page
@app.route('/aboutme')
def aboutme():
    return render_template('AboutMe.html')

# Home Page (Optional)
@app.route('/')
def home():
    return render_template('index.html')

# Fix Heroku Deployment Port Issue
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Bind to dynamic port
    app.run(host='0.0.0.0', port=port, debug=False)
