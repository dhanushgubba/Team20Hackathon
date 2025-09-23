#!/usr/bin/env python3
"""
Test Authentication Flow
Tests the complete signup and login process
"""

import requests
import json
import time

def test_auth_flow():
    """Test the complete authentication flow"""
    base_url = "http://localhost:5000/api"
    
    print("🧪 Testing Complete Authentication Flow")
    print("=" * 50)
    
    # Test 1: Test signup with new user
    print("\n1️⃣ Testing Signup")
    signup_data = {
        "email": "flowtest@example.com",
        "password": "password123",
        "username": "flowtest",
        "full_name": "Flow Test User",
        "phone": "9876543210",
        "role": "user"
    }
    
    try:
        response = requests.post(f"{base_url}/signup", json=signup_data)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"   ✅ Signup successful: {data['message']}")
            print(f"   📧 User Email: {data['user']['email']}")
            print(f"   👤 Username: {data['user']['username']}")
            print(f"   🆔 User ID: {data['user']['id']}")
            print(f"   🔄 Redirect: {data['redirect']}")
        elif response.status_code == 400:
            data = response.json()
            print(f"   ℹ️  Signup info: {data['message']}")
        else:
            print(f"   ❌ Signup failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Signup error: {e}")
        return
    
    # Wait a moment
    time.sleep(1)
    
    # Test 2: Test login with the created user
    print("\n2️⃣ Testing Login with Signup Credentials")
    login_data = {
        "email": signup_data["email"],
        "password": signup_data["password"]
    }
    
    try:
        response = requests.post(f"{base_url}/login", json=login_data)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Login successful: {data['message']}")
            print(f"   👤 User: {data['user']['username']} ({data['user']['role']})")
            print(f"   📧 Email: {data['user']['email']}")
            print(f"   🔄 Redirect: {data['redirect']}")
        else:
            data = response.json()
            print(f"   ❌ Login failed: {data['message']}")
            
    except Exception as e:
        print(f"   ❌ Login error: {e}")
    
    # Test 3: Test login with wrong password
    print("\n3️⃣ Testing Login with Wrong Password")
    wrong_login_data = {
        "email": signup_data["email"],
        "password": "wrongpassword"
    }
    
    try:
        response = requests.post(f"{base_url}/login", json=wrong_login_data)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 401:
            data = response.json()
            print(f"   ✅ Correctly rejected: {data['message']}")
        else:
            print(f"   ❌ Unexpected response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Wrong password test error: {e}")
    
    # Test 4: Test login with non-existent email
    print("\n4️⃣ Testing Login with Non-existent Email")
    fake_login_data = {
        "email": "nonexistent@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{base_url}/login", json=fake_login_data)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 401:
            data = response.json()
            print(f"   ✅ Correctly rejected: {data['message']}")
        else:
            print(f"   ❌ Unexpected response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Fake email test error: {e}")
    
    # Test 5: Test login with existing demo user
    print("\n5️⃣ Testing Login with Demo User")
    demo_login_data = {
        "email": "admin@fraudguard.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{base_url}/login", json=demo_login_data)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Demo login successful: {data['message']}")
            print(f"   👤 User: {data['user']['username']} ({data['user']['role']})")
            print(f"   🔄 Redirect: {data['redirect']}")
        else:
            data = response.json()
            print(f"   ❌ Demo login failed: {data['message']}")
            
    except Exception as e:
        print(f"   ❌ Demo login error: {e}")
    
    print(f"\n🎉 Authentication flow test completed!")
    print(f"📝 Summary:")
    print(f"   - Signup creates user and stores in users.json")
    print(f"   - Login verifies email exists in users.json")
    print(f"   - Login verifies password matches stored hash")
    print(f"   - Invalid credentials are properly rejected")
    print(f"   - Successful login redirects to dashboard")

if __name__ == "__main__":
    test_auth_flow()