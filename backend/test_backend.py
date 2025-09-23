"""
Test Backend API
Quick test to verify the backend is working correctly
"""

import requests
import json

def test_backend():
    """Test the backend API endpoints"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Backend API")
    print("=" * 40)
    
    # Test 1: Health check
    print("\n1️⃣ Testing Health Check")
    try:
        response = requests.get(f"{base_url}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['message']}")
            print(f"   Total users: {data['total_users']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return
    
    # Test 2: Get all users
    print("\n2️⃣ Testing Get All Users")
    try:
        response = requests.get(f"{base_url}/api/users")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Get users successful: {data['count']} users found")
            for user in data['users'][:3]:  # Show first 3 users
                print(f"   - {user['username']} ({user['email']}) - {user['role']}")
        else:
            print(f"❌ Get users failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Get users error: {e}")
    
    # Test 3: Test signup
    print("\n3️⃣ Testing Signup")
    try:
        signup_data = {
            "email": "testuser@example.com",
            "password": "password123",
            "username": "testuser",
            "full_name": "Test User",
            "phone": "1234567890",
            "role": "user"
        }
        
        response = requests.post(f"{base_url}/api/signup", json=signup_data)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Signup successful: {data['message']}")
            print(f"   User ID: {data['user']['id']}")
            print(f"   Redirect: {data['redirect']}")
        else:
            data = response.json()
            print(f"ℹ️  Signup response: {data['message']}")
    except Exception as e:
        print(f"❌ Signup error: {e}")
    
    # Test 4: Test login
    print("\n4️⃣ Testing Login")
    try:
        login_data = {
            "email": "admin@fraudguard.com",
            "password": "admin123"
        }
        
        response = requests.post(f"{base_url}/api/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful: {data['message']}")
            print(f"   User: {data['user']['username']} ({data['user']['role']})")
            print(f"   Redirect: {data['redirect']}")
        else:
            data = response.json()
            print(f"❌ Login failed: {data['message']}")
    except Exception as e:
        print(f"❌ Login error: {e}")
    
    print(f"\n🎉 Backend test completed!")
    print(f"🌐 API is running at: {base_url}")
    print(f"📱 Frontend should connect to: {base_url}")

if __name__ == "__main__":
    test_backend()
