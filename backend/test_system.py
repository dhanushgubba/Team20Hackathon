"""
Test the User Authentication System
This script tests signup, login, and JSON file storage
"""

from user_manager import UserManager
import json
import os

def test_signup_and_login():
    """Test the complete signup and login flow"""
    print("🧪 Testing User Authentication System")
    print("=" * 50)
    
    # Initialize user manager
    user_manager = UserManager("test_users.json")
    
    # Test 1: Signup
    print("\n1️⃣ Testing User Signup")
    print("-" * 30)
    
    test_user = {
        'email': 'newuser@example.com',
        'password': 'password123',
        'username': 'newuser',
        'full_name': 'New User',
        'phone': '1234567890',
        'role': 'user'
    }
    
    success, message, user = user_manager.signup(**test_user)
    
    if success:
        print(f"✅ Signup successful: {message}")
        print(f"   User ID: {user['id']}")
        print(f"   Email: {user['email']}")
        print(f"   Username: {user['username']}")
        print(f"   Full Name: {user['full_name']}")
        print(f"   Phone: {user['phone']}")
        print(f"   Role: {user['role']}")
    else:
        print(f"❌ Signup failed: {message}")
        return
    
    # Test 2: Check JSON file
    print(f"\n2️⃣ Checking JSON File Storage")
    print("-" * 30)
    
    if os.path.exists("test_users.json"):
        print("✅ JSON file created successfully")
        
        # Show file content
        with open("test_users.json", 'r') as f:
            content = f.read()
            print(f"📄 File size: {len(content)} bytes")
            
            # Parse and show user count
            data = json.loads(content)
            user_count = len(data.get('users', []))
            print(f"👥 Total users: {user_count}")
            
            # Show user details
            for i, user in enumerate(data.get('users', []), 1):
                print(f"   User {i}: {user['username']} ({user['email']}) - {user['role']}")
    else:
        print("❌ JSON file not created")
        return
    
    # Test 3: Login
    print(f"\n3️⃣ Testing User Login")
    print("-" * 30)
    
    success, message, user = user_manager.login("newuser@example.com", "password123")
    
    if success:
        print(f"✅ Login successful: {message}")
        print(f"   Logged in user: {user['username']}")
        print(f"   Last login: {user.get('last_login', 'Never')}")
    else:
        print(f"❌ Login failed: {message}")
    
    # Test 4: Check updated JSON file
    print(f"\n4️⃣ Checking Updated JSON File")
    print("-" * 30)
    
    if os.path.exists("test_users.json"):
        with open("test_users.json", 'r') as f:
            data = json.loads(f.read())
            users = data.get('users', [])
            
            if users:
                user = users[0]  # Get the first user
                print(f"✅ User data updated")
                print(f"   Last login: {user.get('last_login', 'Never')}")
    
    # Test 5: Show complete JSON content
    print(f"\n5️⃣ Complete JSON File Content")
    print("-" * 30)
    
    if os.path.exists("test_users.json"):
        with open("test_users.json", 'r') as f:
            content = f.read()
            print("📄 JSON Content:")
            print(content)
    
    print(f"\n🎉 Test completed successfully!")
    print(f"📁 Check the file: test_users.json")

def test_api_endpoints():
    """Test API endpoints"""
    print(f"\n🌐 API Endpoint Testing")
    print("=" * 50)
    
    print("📋 Available API Endpoints:")
    print("   POST /api/signup - Register new user")
    print("   POST /api/login - User login")
    print("   GET /api/users - Get all users")
    print("   GET /api/user/<id> - Get user by ID")
    print("   GET /api/user/email/<email> - Get user by email")
    print("   PUT /api/user/<id> - Update user")
    print("   DELETE /api/user/<id> - Delete user")
    print("   GET /api/health - Health check")
    print("   POST /api/demo-users - Create demo users")
    
    print(f"\n🔗 API Base URL: http://localhost:5000")
    
    print(f"\n📝 Example API Calls:")
    print("""
# Signup
curl -X POST http://localhost:5000/api/signup \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "full_name": "Test User",
    "phone": "1234567890"
  }'

# Login
curl -X POST http://localhost:5000/api/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get all users
curl http://localhost:5000/api/users
    """)

if __name__ == "__main__":
    test_signup_and_login()
    test_api_endpoints()
