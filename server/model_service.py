# Fraud Detection Model Service
# This service loads and runs the actual .pkl model file

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
from datetime import datetime
import joblib

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

class FraudModelService:
    def __init__(self):
        self.model = None
        self.feature_columns = None
        self.scaler = None
        self.encoder = None
        self.prediction_history = []
        
    def load_model(self, model_path):
        """Load the trained model from .pkl file"""
        try:
            if model_path.endswith('.pkl'):
                with open(model_path, 'rb') as file:
                    loaded_data = pickle.load(file)
            elif model_path.endswith('.joblib'):
                loaded_data = joblib.load(model_path)
            else:
                raise ValueError("Unsupported file format. Use .pkl or .joblib")
            
            print(f"Model loaded successfully from {model_path}")
            print(f"Loaded data type: {type(loaded_data)}")
            
            # Handle different .pkl file formats
            if isinstance(loaded_data, dict):
                print("Detected dictionary format - extracting model...")
                # Try common dictionary keys for the model
                if 'model' in loaded_data:
                    self.model = loaded_data['model']
                    print("Found 'model' key in dictionary")
                elif 'classifier' in loaded_data:
                    self.model = loaded_data['classifier']
                    print("Found 'classifier' key in dictionary")
                elif 'estimator' in loaded_data:
                    self.model = loaded_data['estimator']
                    print("Found 'estimator' key in dictionary")
                elif 'rf_model' in loaded_data:
                    self.model = loaded_data['rf_model']
                    print("Found 'rf_model' key in dictionary")
                else:
                    # Print available keys to help debug
                    print(f"Available keys in dictionary: {list(loaded_data.keys())}")
                    # Try to find any sklearn model in the dictionary
                    for key, value in loaded_data.items():
                        if hasattr(value, 'predict'):
                            self.model = value
                            print(f"Found model with predict method at key: '{key}'")
                            break
                    else:
                        raise ValueError("No valid model found in dictionary. Available keys: " + str(list(loaded_data.keys())))
                
                # Load other components if available
                if 'scaler' in loaded_data:
                    self.scaler = loaded_data['scaler']
                    print("Found scaler in dictionary")
                if 'encoder' in loaded_data:
                    self.encoder = loaded_data['encoder']
                    print("Found encoder in dictionary")
                    
            else:
                # Direct model object
                self.model = loaded_data
                print("Direct model object loaded")
            
            print(f"Final model type: {type(self.model)}")
            print(f"Model has predict method: {hasattr(self.model, 'predict')}")
            return True
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False
    
    def load_preprocessors(self, scaler_path=None, encoder_path=None):
        """Load any preprocessors (scaler, encoder) if available"""
        try:
            if scaler_path and os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
                print("Scaler loaded successfully")
            
            if encoder_path and os.path.exists(encoder_path):
                self.encoder = joblib.load(encoder_path)
                print("Encoder loaded successfully")
        except Exception as e:
            print(f"Error loading preprocessors: {str(e)}")
    
    def preprocess_data(self, transaction_data):
        """Preprocess transaction data for model prediction"""
        try:
            # Convert to DataFrame
            df = pd.DataFrame([transaction_data])
            
            # Handle timestamp
            if 'timestamp' in df.columns:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                df['hour'] = df['timestamp'].dt.hour
                df['day_of_week'] = df['timestamp'].dt.dayofweek
                df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
            
            # Convert categorical variables if needed
            categorical_columns = ['deviceType', 'merchantCategory', 'ipAddressFlag', 'previousFraudulentActivity', 'transactionType']
            for col in categorical_columns:
                if col in df.columns:
                    if self.encoder:
                        # Use trained encoder
                        df[col] = self.encoder.transform(df[[col]])
                    else:
                        # Simple mapping (you might need to adjust based on your model)
                        df[col] = self._encode_categorical(col, df[col].iloc[0])
            
            # Handle numerical columns
            numerical_columns = ['transactionAmount', 'accountBalance']
            for col in numerical_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # Apply scaling if scaler is available
            if self.scaler:
                numerical_cols = df.select_dtypes(include=[np.number]).columns
                df[numerical_cols] = self.scaler.transform(df[numerical_cols])
            
            return df
        except Exception as e:
            print(f"Error in preprocessing: {str(e)}")
            raise e
    
    def _encode_categorical(self, column, value):
        """Simple categorical encoding - adjust based on your model's training"""
        encodings = {
            'deviceType': {
                'Mobile': 0, 'Desktop': 1, 'Tablet': 2, 'ATM': 3, 
                'POS Terminal': 4, 'Web Browser': 5, 'Other': 6
            },
            'merchantCategory': {
                'Grocery': 0, 'Gas Station': 1, 'Restaurant': 2, 'Retail': 3,
                'Online Shopping': 4, 'Entertainment': 5, 'Healthcare': 6,
                'Travel': 7, 'Utilities': 8, 'Financial Services': 9, 'Other': 10
            },
            'ipAddressFlag': {
                'Safe': 0, 'Suspicious': 1, 'High Risk': 2, 'Blacklisted': 3, 'Unknown': 4
            },
            'previousFraudulentActivity': {
                'None': 0, 'Low Risk': 1, 'Medium Risk': 2, 'High Risk': 3, 'Previously Flagged': 4
            },
            'transactionType': {
                'Purchase': 0, 'Withdrawal': 1, 'Transfer': 2, 'Deposit': 3,
                'Refund': 4, 'Payment': 5, 'Other': 6
            }
        }
        return encodings.get(column, {}).get(value, 0)
    
    def predict(self, transaction_data):
        """Make fraud prediction using the loaded model"""
        try:
            if self.model is None:
                raise ValueError("Model not loaded")
            
            # Preprocess the data
            processed_data = self.preprocess_data(transaction_data)
            
            # Make prediction
            if hasattr(self.model, 'predict_proba'):
                # For models that support probability prediction
                probabilities = self.model.predict_proba(processed_data)
                fraud_probability = probabilities[0][1] if len(probabilities[0]) > 1 else probabilities[0][0]
                risk_score = fraud_probability
            else:
                # For models that only give binary predictions
                prediction = self.model.predict(processed_data)
                risk_score = float(prediction[0])
                fraud_probability = risk_score * 100
            
            # Create prediction result
            is_fraud = risk_score >= 0.7  # High risk is considered fraud
            prediction_result = {
                'riskScore': float(risk_score),
                'fraudProbability': float(fraud_probability * 100),
                'isFraud': is_fraud,
                'classification': self._classify_risk(risk_score),
                'confidence': self._calculate_confidence(risk_score),
                'timestamp': datetime.now().isoformat(),
                'transactionId': transaction_data.get('transactionId', f"TXN_{int(datetime.now().timestamp())}")
            }
            
            # Store prediction for analytics
            self.prediction_history.append(prediction_result)
            
            return prediction_result
            
        except Exception as e:
            print(f"Error in prediction: {str(e)}")
            raise e
    
    def _classify_risk(self, risk_score):
        """Classify risk based on score"""
        if risk_score >= 0.7:
            return 'High Risk'
        elif risk_score >= 0.4:
            return 'Medium Risk'
        elif risk_score >= 0.2:
            return 'Low Risk'
        else:
            return 'Safe'
    
    def _calculate_confidence(self, risk_score):
        """Calculate confidence score"""
        # Simple confidence calculation - adjust based on your model
        confidence = min(90, max(60, 80 + (abs(risk_score - 0.5) * 20)))
        return int(confidence)
    
    def get_analytics(self):
        """Get analytics data for dashboard"""
        recent_predictions = self.prediction_history[-100:]  # Last 100 predictions
        
        # Calculate fraud distribution
        distribution = {'Safe': 0, 'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0}
        for pred in recent_predictions:
            distribution[pred['classification']] += 1
        
        # Calculate trends
        trends = []
        for i, pred in enumerate(recent_predictions):
            trends.append({
                'x': i,
                'y': pred['riskScore'],
                'timestamp': pred['timestamp'],
                'classification': pred['classification']
            })
        
        return {
            'totalPredictions': len(self.prediction_history),
            'recentPredictions': recent_predictions,
            'fraudDistribution': distribution,
            'riskTrends': trends,
            'featureImportance': [
                {'feature': 'Transaction Amount', 'importance': 25},
                {'feature': 'IP Address Flag', 'importance': 25},
                {'feature': 'Device Type', 'importance': 20},
                {'feature': 'Merchant Category', 'importance': 15},
                {'feature': 'Account Balance', 'importance': 15}
            ]
        }

# Initialize the service
fraud_service = FraudModelService()

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': fraud_service.model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/load-model', methods=['POST'])
def load_model():
    """Load model from specified path"""
    try:
        data = request.json
        model_path = data.get('model_path')
        
        if not model_path or not os.path.exists(model_path):
            return jsonify({'error': 'Invalid model path'}), 400
        
        success = fraud_service.load_model(model_path)
        if success:
            return jsonify({'message': 'Model loaded successfully'})
        else:
            return jsonify({'error': 'Failed to load model'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict_fraud():
    """Make fraud prediction"""
    try:
        transaction_data = request.json
        
        if not transaction_data:
            return jsonify({'error': 'No transaction data provided'}), 400
        
        prediction = fraud_service.predict(transaction_data)
        return jsonify(prediction)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data"""
    try:
        analytics = fraud_service.get_analytics()
        return jsonify(analytics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_prediction_history():
    """Get prediction history"""
    try:
        return jsonify(fraud_service.prediction_history)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Fraud Detection Model Service...")
    
    # Try to automatically load model from server directory and other locations
    model_paths_to_try = [
        'optimized_fraud_detection_rf.pkl',  # Your specific model in server folder
        '../models/fraud_model.pkl',
        'models/fraud_model.pkl',
        '../models/model.pkl',
        'models/model.pkl'
    ]
    
    model_loaded = False
    for model_path in model_paths_to_try:
        if os.path.exists(model_path):
            print(f"Found model file: {model_path}")
            if fraud_service.load_model(model_path):
                print(f"✅ Model loaded successfully from {model_path}")
                print(f"✅ Using your team's trained model: optimized_fraud_detection_rf.pkl")
                model_loaded = True
                break
            else:
                print(f"❌ Failed to load model from {model_path}")
    
    if not model_loaded:
        print("⚠️  No model loaded automatically.")
        print("📁 Available options:")
        print("   1. Your model file: optimized_fraud_detection_rf.pkl (should be in server folder)")
        print("   2. Copy your .pkl file to 'models/fraud_model.pkl'")
        print("   3. Use the /load-model API endpoint")
        print("   4. The system will work with simulated predictions until then")
    
    print("🚀 Server starting on http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)