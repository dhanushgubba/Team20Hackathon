"""
Test script to verify the new transaction API endpoints
"""
import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_login():
    """Test user login and get JWT token"""
    print("Testing login...")
    
    response = requests.post(f'{BASE_URL}/login', json={
        'email': 'demo@fraudguard.com',
        'password': 'demo123'
    })
    
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print(f"✅ Login successful! Token received.")
            return data['token']
        else:
            print(f"❌ Login failed: {data['message']}")
    else:
        print(f"❌ Login failed with status {response.status_code}")
    
    return None

def test_transaction_submission(token):
    """Test submitting a transaction"""
    print("\nTesting transaction submission...")
    
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    sample_transaction = {
        'transactionId': 'TXN_TEST_123',
        'transactionAmount': 150.00,
        'accountBalance': 1500.00,
        'transactionType': 'Purchase',
        'deviceType': 'Web Browser',
        'merchantCategory': 'Online Shopping',
        'location': 'Test City',
        'ipAddressFlag': 'Safe',
        'previousFraudulentActivity': 'None',
        'fraudPrediction': {
            'isFraud': False,
            'riskScore': 0.25,
            'classification': 'Low Risk',
            'confidence': 0.85,
            'modelVersion': '1.0'
        }
    }
    
    response = requests.post(f'{BASE_URL}/transactions', 
                           headers=headers, 
                           json=sample_transaction)
    
    if response.status_code == 201:
        data = response.json()
        if data['success']:
            print(f"✅ Transaction submitted successfully!")
            print(f"   Transaction ID: {data['transaction']['transaction_id']}")
            return True
        else:
            print(f"❌ Transaction submission failed: {data['message']}")
    else:
        print(f"❌ Transaction submission failed with status {response.status_code}")
        print(f"   Response: {response.text}")
    
    return False

def test_get_transactions(token):
    """Test retrieving user transactions"""
    print("\nTesting transaction retrieval...")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.get(f'{BASE_URL}/transactions', headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print(f"✅ Retrieved {len(data['transactions'])} transactions")
            if data['transactions']:
                print(f"   Latest transaction: {data['transactions'][0]['transaction_id']}")
            return True
        else:
            print(f"❌ Failed to retrieve transactions: {data['message']}")
    else:
        print(f"❌ Failed to retrieve transactions with status {response.status_code}")
        print(f"   Response: {response.text}")
    
    return False

def test_get_stats(token):
    """Test retrieving transaction statistics"""
    print("\nTesting transaction statistics...")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.get(f'{BASE_URL}/transactions/stats', headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            stats = data['stats']
            print(f"✅ Retrieved transaction statistics:")
            print(f"   Total transactions: {stats.get('total_transactions', 0)}")
            print(f"   Total amount: ${stats.get('total_amount', 0):.2f}")
            print(f"   Fraud rate: {stats.get('fraud_rate', 0)*100:.1f}%")
            return True
        else:
            print(f"❌ Failed to retrieve stats: {data['message']}")
    else:
        print(f"❌ Failed to retrieve stats with status {response.status_code}")
        print(f"   Response: {response.text}")
    
    return False

def main():
    print("🧪 Testing Transaction Management API")
    print("=" * 50)
    
    # Test login
    token = test_login()
    if not token:
        print("❌ Cannot proceed without valid token")
        return
    
    # Test transaction submission
    test_transaction_submission(token)
    
    # Test transaction retrieval
    test_get_transactions(token)
    
    # Test statistics
    test_get_stats(token)
    
    print("\n" + "=" * 50)
    print("✅ API testing completed!")

if __name__ == '__main__':
    main()