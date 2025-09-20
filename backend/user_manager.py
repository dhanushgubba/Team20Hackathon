"""
User Management System
Handles user registration, login, and data storage in JSON file
"""

import json
import hashlib
import os
from datetime import datetime
from typing import Dict, Optional, Tuple
import uuid


class UserManager:
    def __init__(self, users_file: str = "users.json"):
        """
        Initialize the user management system
        
        Args:
            users_file: Path to the JSON file storing user data
        """
        self.users_file = users_file
        self.users_data = self._load_users()
    
    def _load_users(self) -> Dict:
        """Load users from JSON file"""
        if os.path.exists(self.users_file):
            try:
                with open(self.users_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                return {"users": []}
        return {"users": []}
    
    def _save_users(self) -> bool:
        """Save users to JSON file"""
        try:
            with open(self.users_file, 'w', encoding='utf-8') as f:
                json.dump(self.users_data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving users: {e}")
            return False
    
    def _hash_password(self, password: str) -> str:
        """Hash password using SHA-256 with salt"""
        salt = os.urandom(32).hex()
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return f"{salt}:{password_hash}"
    
    def _verify_password(self, password: str, stored_hash: str) -> bool:
        """Verify password against stored hash"""
        try:
            salt, password_hash = stored_hash.split(':')
            test_hash = hashlib.sha256((password + salt).encode()).hexdigest()
            return test_hash == password_hash
        except ValueError:
            return False
    
    def _generate_user_id(self) -> str:
        """Generate unique user ID"""
        return str(uuid.uuid4())
    
    def _check_email_exists(self, email: str) -> bool:
        """Check if email already exists"""
        for user in self.users_data["users"]:
            if user["email"].lower() == email.lower():
                return True
        return False
    
    def _check_username_exists(self, username: str) -> bool:
        """Check if username already exists"""
        for user in self.users_data["users"]:
            if user["username"].lower() == username.lower():
                return True
        return False
    
    def signup(self, email: str, password: str, username: str, 
               full_name: str = "", phone: str = "", role: str = "user") -> Tuple[bool, str, Optional[Dict]]:
        """
        Register a new user
        
        Args:
            email: User's email address
            password: User's password
            username: User's username
            full_name: User's full name
            phone: User's phone number
            role: User's role (admin, analyst, user)
        
        Returns:
            Tuple of (success, message, user_data)
        """
        # Validation
        if not email or not password or not username:
            return False, "Email, password, and username are required", None
        
        if len(password) < 6:
            return False, "Password must be at least 6 characters long", None
        
        if "@" not in email:
            return False, "Invalid email format", None
        
        # Check for duplicates
        if self._check_email_exists(email):
            return False, "Email already exists", None
        
        if self._check_username_exists(username):
            return False, "Username already exists", None
        
        # Create new user
        user_id = self._generate_user_id()
        hashed_password = self._hash_password(password)
        
        new_user = {
            "id": user_id,
            "email": email.lower(),
            "username": username,
            "full_name": full_name,
            "phone": phone,
            "password_hash": hashed_password,
            "role": role,
            "created_at": datetime.now().isoformat(),
            "last_login": None,
            "is_active": True
        }
        
        # Add user to data
        self.users_data["users"].append(new_user)
        
        # Save to file
        if self._save_users():
            # Return user data without password
            user_data = new_user.copy()
            del user_data["password_hash"]
            return True, "User registered successfully", user_data
        else:
            return False, "Failed to save user data", None
    
    def login(self, email: str, password: str) -> Tuple[bool, str, Optional[Dict]]:
        """
        Authenticate user login
        
        Args:
            email: User's email address
            password: User's password
        
        Returns:
            Tuple of (success, message, user_data)
        """
        if not email or not password:
            return False, "Email and password are required", None
        
        # Find user by email
        user = None
        for u in self.users_data["users"]:
            if u["email"].lower() == email.lower():
                user = u
                break
        
        if not user:
            return False, "Invalid email or password", None
        
        if not user["is_active"]:
            return False, "Account is deactivated", None
        
        # Verify password
        if not self._verify_password(password, user["password_hash"]):
            return False, "Invalid email or password", None
        
        # Update last login
        user["last_login"] = datetime.now().isoformat()
        self._save_users()
        
        # Return user data without password
        user_data = user.copy()
        del user_data["password_hash"]
        return True, "Login successful", user_data
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        for user in self.users_data["users"]:
            if user["id"] == user_id:
                user_data = user.copy()
                del user_data["password_hash"]
                return user_data
        return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        for user in self.users_data["users"]:
            if user["email"].lower() == email.lower():
                user_data = user.copy()
                del user_data["password_hash"]
                return user_data
        return None
    
    def get_all_users(self) -> list:
        """Get all users (without passwords)"""
        users = []
        for user in self.users_data["users"]:
            user_data = user.copy()
            del user_data["password_hash"]
            users.append(user_data)
        return users
    
    def update_user(self, user_id: str, **kwargs) -> Tuple[bool, str]:
        """Update user information"""
        user = None
        for u in self.users_data["users"]:
            if u["id"] == user_id:
                user = u
                break
        
        if not user:
            return False, "User not found"
        
        # Update allowed fields
        allowed_fields = ["full_name", "phone", "role", "is_active"]
        for field, value in kwargs.items():
            if field in allowed_fields:
                user[field] = value
        
        if self._save_users():
            return True, "User updated successfully"
        else:
            return False, "Failed to update user"
    
    def delete_user(self, user_id: str) -> Tuple[bool, str]:
        """Delete user account"""
        for i, user in enumerate(self.users_data["users"]):
            if user["id"] == user_id:
                del self.users_data["users"][i]
                if self._save_users():
                    return True, "User deleted successfully"
                else:
                    return False, "Failed to delete user"
        return False, "User not found"


# Example usage
if __name__ == "__main__":
    # Initialize user manager
    user_manager = UserManager()
    
    # Test signup
    print("=== Testing Signup ===")
    success, message, user = user_manager.signup(
        email="test@example.com",
        password="password123",
        username="testuser",
        full_name="Test User",
        phone="1234567890"
    )
    print(f"Signup: {success} - {message}")
    if user:
        print(f"User created: {user['username']} ({user['email']})")
    
    # Test login
    print("\n=== Testing Login ===")
    success, message, user = user_manager.login("test@example.com", "password123")
    print(f"Login: {success} - {message}")
    if user:
        print(f"Logged in user: {user['username']}")
    
    # Show all users
    print("\n=== All Users ===")
    users = user_manager.get_all_users()
    for user in users:
        print(f"- {user['username']} ({user['email']}) - {user['role']}")
