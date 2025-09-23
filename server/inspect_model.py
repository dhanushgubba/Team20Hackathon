#!/usr/bin/env python3
"""
Script to inspect the .pkl file and find out what features/fields it expects
"""

import joblib
import pandas as pd
import numpy as np

def inspect_pkl_file():
    """Inspect the optimized_fraud_detection_rf.pkl file"""
    try:
        print("🔍 Loading optimized_fraud_detection_rf.pkl...")
        
        # Load the pkl file
        loaded_data = joblib.load('optimized_fraud_detection_rf.pkl')
        
        print(f"\n📁 File Type: {type(loaded_data)}")
        
        if isinstance(loaded_data, dict):
            print(f"\n🗂️  Dictionary Keys: {list(loaded_data.keys())}")
            
            # Check each key in the dictionary
            for key, value in loaded_data.items():
                print(f"\n🔑 Key: '{key}'")
                print(f"   Type: {type(value)}")
                
                # Check if it's a model with feature information
                if hasattr(value, 'feature_names_in_'):
                    print(f"   📊 Feature Names: {value.feature_names_in_}")
                elif hasattr(value, 'feature_importances_'):
                    print(f"   📈 Feature Importances: {value.feature_importances_}")
                    if hasattr(value, 'n_features_'):
                        print(f"   🔢 Number of Features: {value.n_features_}")
                elif hasattr(value, 'predict'):
                    print("   ✅ Has predict method (this is likely the model)")
                    
                    # Try to get more info about the model
                    if hasattr(value, 'n_features_in_'):
                        print(f"   🔢 Expected Features: {value.n_features_in_}")
                    if hasattr(value, 'classes_'):
                        print(f"   🏷️  Classes: {value.classes_}")
                        
        else:
            # Direct model object
            print(f"\n📊 Direct Model Type: {type(loaded_data)}")
            if hasattr(loaded_data, 'feature_names_in_'):
                print(f"📊 Feature Names: {loaded_data.feature_names_in_}")
            if hasattr(loaded_data, 'feature_importances_'):
                print(f"📈 Feature Importances: {loaded_data.feature_importances_}")
            if hasattr(loaded_data, 'n_features_in_'):
                print(f"🔢 Expected Features: {loaded_data.n_features_in_}")
                
        print("\n" + "="*50)
        print("🧪 TESTING MODEL WITH SAMPLE DATA")
        print("="*50)
        
        # Find the actual model object
        model = None
        if isinstance(loaded_data, dict):
            for key, value in loaded_data.items():
                if hasattr(value, 'predict'):
                    model = value
                    print(f"✅ Using model from key: '{key}'")
                    break
        else:
            model = loaded_data
            
        if model:
            # Test with sample data to see what features it expects
            print("\n🧪 Testing with different feature combinations...")
            
            # Common ML features for fraud detection
            test_features = [
                'transactionAmount',
                'accountBalance', 
                'deviceType',
                'merchantCategory',
                'ipAddressFlag', 
                'previousFraudulentActivity',
                'transactionType',
                'timestamp',
                'hour',
                'day_of_week',
                'is_weekend'
            ]
            
            print(f"\n📝 Testing with features: {test_features}")
            
            # Create sample data
            sample_data = {
                'transactionAmount': [100.0],
                'accountBalance': [1000.0],
                'deviceType': [1],  # encoded
                'merchantCategory': [2],  # encoded  
                'ipAddressFlag': [0],  # encoded
                'previousFraudulentActivity': [0],  # encoded
                'transactionType': [0],  # encoded
                'timestamp': [1],
                'hour': [14],
                'day_of_week': [1], 
                'is_weekend': [0]
            }
            
            # Try different combinations
            feature_combinations = [
                ['transactionAmount', 'accountBalance', 'deviceType', 'merchantCategory', 'ipAddressFlag', 'previousFraudulentActivity', 'transactionType'],
                ['transactionAmount', 'accountBalance', 'deviceType', 'merchantCategory', 'transactionType'],
                ['transactionAmount', 'accountBalance', 'deviceType', 'merchantCategory', 'ipAddressFlag', 'previousFraudulentActivity', 'transactionType', 'hour', 'day_of_week', 'is_weekend']
            ]
            
            for i, features in enumerate(feature_combinations):
                try:
                    test_df = pd.DataFrame({col: sample_data[col] for col in features})
                    print(f"\n✅ Test {i+1}: {len(features)} features - {features}")
                    prediction = model.predict(test_df)
                    print(f"   🎯 Prediction successful: {prediction}")
                    
                    # This combination works!
                    print(f"\n🎉 SUCCESS! Your model expects these {len(features)} features:")
                    for j, feature in enumerate(features, 1):
                        print(f"   {j}. {feature}")
                    break
                    
                except Exception as e:
                    print(f"   ❌ Test {i+1} failed: {str(e)}")
                    
        else:
            print("❌ Could not find a model with predict method")
            
    except Exception as e:
        print(f"❌ Error inspecting file: {str(e)}")

if __name__ == "__main__":
    inspect_pkl_file()