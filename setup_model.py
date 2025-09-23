"""
Setup script for integrating your team's .pkl model file
Run this script to copy your model and set up the service
"""

import os
import shutil
import subprocess
import sys

def setup_model_service():
    print("🚀 Setting up Fraud Detection Model Service...")
    
    # Check Python version
    python_version = sys.version_info
    print(f"🐍 Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version < (3, 7):
        print("❌ Python 3.7+ is required. Please upgrade your Python version.")
        return False
    
    # Check if running in the correct directory
    if not os.path.exists('server'):
        print("❌ Please run this script from the frauddetection root directory")
        return False
    
    # Install Python dependencies
    print("\n📦 Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "server/requirements.txt"])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False
    
    # Copy model file from Downloads
    downloads_path = os.path.expanduser("~/Downloads")
    models_dir = "models"
    
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)
        print(f"✅ Created {models_dir} directory")
    
    print(f"\n🔍 Looking for .pkl files in {downloads_path}...")
    pkl_files = []
    for file in os.listdir(downloads_path):
        if file.endswith('.pkl'):
            pkl_files.append(file)
    
    if not pkl_files:
        print(f"❌ No .pkl files found in {downloads_path}")
        print("📝 Please manually copy your .pkl file to the 'models' folder")
        return False
    
    print(f"🎯 Found .pkl files: {pkl_files}")
    
    # If multiple files, let user choose
    if len(pkl_files) == 1:
        selected_file = pkl_files[0]
    else:
        print("\n📋 Multiple .pkl files found. Please select one:")
        for i, file in enumerate(pkl_files):
            print(f"  {i+1}. {file}")
        
        try:
            choice = int(input("Enter your choice (1-{}): ".format(len(pkl_files)))) - 1
            selected_file = pkl_files[choice]
        except (ValueError, IndexError):
            print("❌ Invalid choice")
            return False
    
    # Copy the selected file
    source_path = os.path.join(downloads_path, selected_file)
    dest_path = os.path.join(models_dir, "fraud_model.pkl")
    
    try:
        shutil.copy2(source_path, dest_path)
        print(f"✅ Copied {selected_file} to {dest_path}")
    except Exception as e:
        print(f"❌ Error copying file: {e}")
        return False
    
    # Create a configuration file
    config = f'''# Model Configuration
MODEL_PATH = "{os.path.abspath(dest_path)}"
MODEL_NAME = "{selected_file}"
SERVER_HOST = "localhost"
SERVER_PORT = 5000
'''
    
    with open('server/config.py', 'w') as f:
        f.write(config)
    
    print("✅ Configuration file created")
    
    print(f"""
🎉 Setup Complete! 

Your model has been set up successfully:
📁 Model file: {dest_path}
🔧 Config: server/config.py

Next steps:
1. Start the Python model service:
   cd server
   python model_service.py

2. In another terminal, start the React frontend:
   cd client
   npm start

3. The system will automatically load your .pkl model!

🌐 Frontend: http://localhost:3000
🔗 API: http://localhost:5000
""")
    
    return True

if __name__ == "__main__":
    setup_model_service()