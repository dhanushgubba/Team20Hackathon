# 🔐 User Authentication System Setup Guide

## Overview
Complete user authentication system with JSON file storage that handles:
- ✅ User registration (signup)
- ✅ User login with password verification
- ✅ Password hashing with salt
- ✅ Duplicate email/username checking
- ✅ User data management
- ✅ REST API endpoints
- ✅ JSON file storage
- ✅ Redirect functionality after signup

## 📁 Files Created

1. **`user_manager.py`** - Core user management logic
2. **`app.py`** - Flask REST API endpoints
3. **`requirements.txt`** - Python dependencies
4. **`test_system.py`** - Test script and examples
5. **`SETUP_GUIDE.md`** - This setup guide

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd Team20Hackathon/backend
pip install -r requirements.txt
```

### Step 2: Test the System
```bash
python test_system.py
```

### Step 3: Start the API Server
```bash
python app.py
```

The API will be available at: **http://localhost:5000**

## 🔧 Core Features

### UserManager Class
```python
from user_manager import UserManager

# Initialize
user_manager = UserManager("users.json")

# Signup
success, message, user = user_manager.signup(
    email="user@example.com",
    password="password123",
    username="username",
    full_name="Full Name",
    phone="1234567890",
    role="user"
)

# Login
success, message, user = user_manager.login("user@example.com", "password123")

# Get user
user = user_manager.get_user_by_email("user@example.com")
user = user_manager.get_user_by_id("user-id")

# Update user
success, message = user_manager.update_user(user_id, full_name="New Name")

# Get all users
users = user_manager.get_all_users()
```

## 🌐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup` | Register new user |
| POST | `/api/login` | User login |
| GET | `/api/users` | Get all users |
| GET | `/api/user/<user_id>` | Get user by ID |
| GET | `/api/user/email/<email>` | Get user by email |
| PUT | `/api/user/<user_id>` | Update user |
| DELETE | `/api/user/<user_id>` | Delete user |
| GET | `/api/health` | Health check |
| POST | `/api/demo-users` | Create demo users |

### Example API Calls

#### Signup
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "username": "newuser",
    "full_name": "New User",
    "phone": "1234567890",
    "role": "user"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

#### Get All Users
```bash
curl http://localhost:5000/api/users
```

## 🔒 Security Features

### Password Hashing
- Uses SHA-256 with random salt
- Each password has unique salt
- Passwords never stored in plain text

### Data Validation
- Email format validation
- Password minimum length (6 characters)
- Duplicate email/username checking
- Input sanitization

### User Data Structure
```json
{
  "users": [
    {
      "id": "unique-uuid",
      "email": "user@example.com",
      "username": "username",
      "full_name": "Full Name",
      "phone": "1234567890",
      "password_hash": "salt:hashedpassword",
      "role": "user",
      "created_at": "2024-01-15T10:30:00",
      "last_login": "2024-01-15T11:00:00",
      "is_active": true
    }
  ]
}
```

## 🎯 Demo Users

The system automatically creates demo users:

| Email | Password | Username | Role |
|-------|----------|----------|------|
| admin@fraudguard.com | admin123 | admin | admin |
| analyst@fraudguard.com | analyst123 | analyst | analyst |
| demo@fraudguard.com | demo123 | demo | user |

## 🧪 Testing

### Run Tests
```bash
python test_system.py
```

### Test Coverage
- ✅ User signup
- ✅ Duplicate email prevention
- ✅ User login
- ✅ Password verification
- ✅ User retrieval
- ✅ JSON file operations
- ✅ Data persistence

## 🔄 Frontend Integration

### React Integration Example
```javascript
// Signup function
const signup = async (userData) => {
  const response = await fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Redirect to login page
    window.location.href = '/login';
  }
  
  return data;
};

// Login function
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
  
  return data;
};
```

## 🎯 Redirect Functionality

### After Signup
- API returns `redirect: '/login'`
- Frontend should redirect to login page
- User can then login with their credentials

### After Login
- API returns `redirect: '/dashboard'`
- Frontend should redirect to dashboard
- User is now authenticated

## 📊 Performance Notes

- **File-based storage** - Suitable for small to medium applications
- **In-memory caching** - Users loaded once per session
- **JSON format** - Human-readable and easy to debug
- **No database required** - Simple setup and deployment

## 🆘 Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   ```bash
   # Change port in app.py
   app.run(debug=True, host='0.0.0.0', port=5001)
   ```

2. **JSON file permissions**
   ```bash
   # Ensure write permissions
   chmod 644 users.json
   ```

3. **CORS issues**
   ```python
   # Already configured in app.py
   CORS(app)
   ```

## 🎉 What You Get

- ✅ **Working signup system**
- ✅ **User data stored in JSON**
- ✅ **Demo users ready to use**
- ✅ **Full authentication flow**
- ✅ **REST API endpoints**
- ✅ **Redirect functionality**
- ✅ **Password security**

## 🚀 Next Steps

1. **Start the API server**
2. **Test with the frontend**
3. **Customize user fields as needed**
4. **Add additional validation rules**

**The authentication system is ready to use! 🚀**
