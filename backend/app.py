"""
Flask API for User Authentication
Provides REST endpoints for signup, login, and user management
"""

from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
from user_manager import UserManager
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize user manager
user_manager = UserManager()

@app.route('/')
def home():
    """Home page - redirect to login"""
    return jsonify({
        'message': 'User Authentication API',
        'endpoints': {
            'signup': '/api/signup',
            'login': '/api/login',
            'users': '/api/users',
            'health': '/api/health'
        }
    })

@app.route('/api/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        username = data.get('username', '').strip()
        full_name = data.get('full_name', '').strip()
        phone = data.get('phone', '').strip()
        role = data.get('role', 'user')
        
        success, message, user_data = user_manager.signup(
            email=email,
            password=password,
            username=username,
            full_name=full_name,
            phone=phone,
            role=role
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'user': user_data,
                'redirect': '/login'  # Indicate where to redirect
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate user login"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        success, message, user_data = user_manager.login(email, password)
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'user': user_data,
                'redirect': '/dashboard'  # Redirect to dashboard after login
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/users', methods=['GET'])
def get_all_users():
    """Get all users (for admin purposes)"""
    try:
        users = user_manager.get_all_users()
        return jsonify({
            'success': True,
            'users': users,
            'count': len(users)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/user/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID"""
    try:
        user_data = user_manager.get_user_by_id(user_id)
        
        if user_data:
            return jsonify({
                'success': True,
                'user': user_data
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/user/email/<email>', methods=['GET'])
def get_user_by_email(email):
    """Get user by email"""
    try:
        user_data = user_manager.get_user_by_email(email)
        
        if user_data:
            return jsonify({
                'success': True,
                'user': user_data
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/user/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user information"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # Extract allowed fields for update
        update_data = {}
        allowed_fields = ['full_name', 'phone', 'role', 'is_active']
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        success, message = user_manager.update_user(user_id, **update_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete user account"""
    try:
        success, message = user_manager.delete_user(user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'User Authentication API is running',
        'status': 'healthy',
        'users_file': user_manager.users_file,
        'total_users': len(user_manager.get_all_users())
    }), 200

@app.route('/api/demo-users', methods=['POST'])
def create_demo_users():
    """Create demo users for testing"""
    try:
        demo_users = [
            {
                'email': 'admin@fraudguard.com',
                'password': 'admin123',
                'username': 'admin',
                'full_name': 'Admin User',
                'phone': '1234567890',
                'role': 'admin'
            },
            {
                'email': 'analyst@fraudguard.com',
                'password': 'analyst123',
                'username': 'analyst',
                'full_name': 'Analyst User',
                'phone': '1234567891',
                'role': 'analyst'
            },
            {
                'email': 'demo@fraudguard.com',
                'password': 'demo123',
                'username': 'demo',
                'full_name': 'Demo User',
                'phone': '1234567892',
                'role': 'user'
            }
        ]
        
        created_users = []
        for user_data in demo_users:
            success, message, user = user_manager.signup(**user_data)
            if success:
                created_users.append(user)
            else:
                # User might already exist
                user = user_manager.get_user_by_email(user_data['email'])
                if user:
                    created_users.append(user)
        
        return jsonify({
            'success': True,
            'message': f'Created {len(created_users)} demo users',
            'users': created_users
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Create demo users on startup
    print("🚀 Starting User Authentication API...")
    print("Creating demo users...")
    
    demo_users = [
        {
            'email': 'admin@fraudguard.com',
            'password': 'admin123',
            'username': 'admin',
            'full_name': 'Admin User',
            'phone': '1234567890',
            'role': 'admin'
        },
        {
            'email': 'analyst@fraudguard.com',
            'password': 'analyst123',
            'username': 'analyst',
            'full_name': 'Analyst User',
            'phone': '1234567891',
            'role': 'analyst'
        },
        {
            'email': 'demo@fraudguard.com',
            'password': 'demo123',
            'username': 'demo',
            'full_name': 'Demo User',
            'phone': '1234567892',
            'role': 'user'
        }
    ]
    
    for user_data in demo_users:
        success, message, user = user_manager.signup(**user_data)
        if success:
            print(f"✅ Created user: {user['username']}")
        else:
            print(f"ℹ️  User {user_data['username']} already exists or error: {message}")
    
    print("🌐 API will be available at: http://localhost:5000")
    print("📱 Frontend should connect to: http://localhost:5000")
    print("\n🔑 Demo Login Credentials:")
    print("   Admin: admin@fraudguard.com / admin123")
    print("   Analyst: analyst@fraudguard.com / analyst123")
    print("   Demo: demo@fraudguard.com / demo123")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
