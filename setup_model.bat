@echo off
echo 🎯 Fraud Detection Model Setup
echo.

echo 📁 Looking for .pkl files in Downloads...
dir "%USERPROFILE%\Downloads\*.pkl" /b 2>nul
if errorlevel 1 (
    echo ❌ No .pkl files found in Downloads folder
    echo.
    echo 📝 Please:
    echo    1. Put your .pkl file in Downloads folder
    echo    2. Or manually copy it to: models\fraud_model.pkl
    pause
    exit /b 1
)

echo.
echo 📋 Available .pkl files:
for %%f in ("%USERPROFILE%\Downloads\*.pkl") do echo    %%~nxf

echo.
set /p modelname="Enter the name of your model file (with .pkl extension): "

if not exist "%USERPROFILE%\Downloads\%modelname%" (
    echo ❌ File not found: %modelname%
    pause
    exit /b 1
)

echo.
echo 📂 Creating models directory...
if not exist models mkdir models

echo 📋 Copying %modelname% to models\fraud_model.pkl...
copy "%USERPROFILE%\Downloads\%modelname%" models\fraud_model.pkl

if errorlevel 1 (
    echo ❌ Failed to copy file
    pause
    exit /b 1
)

echo ✅ Model copied successfully!
echo.
echo 🚀 Next steps:
echo    1. Start backend: cd server ^&^& python model_service.py
echo    2. Start frontend: cd client ^&^& npm start
echo    3. Open: http://localhost:3000
echo.
pause