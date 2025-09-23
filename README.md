# 🛡️ Fraud Detection Dashboard with Real ML Model

A comprehensive fraud detection system that integrates your team's trained `.pkl` model with an interactive React dashboard featuring real-time analytics, visualizations, and predictions.

## 🚀 Quick Start

### 1. Setup Your Model

```bash
# Run the setup script to automatically configure your .pkl model
python setup_model.py
```

This will:

- Copy your `.pkl` file from Downloads to the project
- Install Python dependencies
- Create configuration files

### 2. Start the Backend (Python Model Service)

```bash
cd server
python model_service.py
```

The backend will start on `http://localhost:5000`

### 3. Start the Frontend (React Dashboard)

```bash
cd client
npm start
```

The dashboard will open at `http://localhost:3000`

## 📊 Features

### Transaction Analysis

- **Real-time Fraud Detection**: Submit transactions and get instant ML predictions
- **Risk Scoring**: 0-100% risk scores with confidence levels
- **Risk Classification**: Safe, Low Risk, Medium Risk, High Risk
- **Feature Analysis**: See which factors contribute to fraud risk

### Analytics Dashboard

- **📈 Trend Chart**: Line chart showing risk scores over time
- **🥧 Distribution Chart**: Pie chart of risk level distribution
- **🔥 Heat Map**: 24-hour fraud activity patterns
- **📊 Feature Importance**: Bar chart of ML model features
- **📋 Recent Predictions**: Table of latest transaction analysis

### Visualizations

- Interactive charts with Chart.js
- Color-coded risk levels
- Real-time updates
- Mobile responsive design

## 🏗️ Architecture

```
Frontend (React)           Backend (Python)          ML Model
     ↓                          ↓                       ↓
Transaction Form    →    Flask API Server    →    Your .pkl Model
     ↓                          ↓                       ↓
Analytics Dashboard ←    Prediction Results  ←    Risk Scores
```

### Components

- **TransactionForm**: Input interface for transaction data
- **FraudAnalytics**: Main dashboard with all visualizations
- **Chart Components**: Reusable visualization components
- **RealMLModelService**: Frontend service that connects to Python backend
- **Flask API**: Backend service that loads and runs your .pkl model

## 🔧 API Endpoints

### Backend API (Port 5000)

| Endpoint      | Method | Description           |
| ------------- | ------ | --------------------- |
| `/health`     | GET    | Check service status  |
| `/predict`    | POST   | Get fraud prediction  |
| `/analytics`  | GET    | Get analytics data    |
| `/load-model` | POST   | Load a specific model |

### Example Prediction Request

```json
{
  "transactionId": "TXN_12345",
  "transactionAmount": 1500.0,
  "accountBalance": 5000.0,
  "deviceType": "Mobile",
  "merchantCategory": "Online Shopping",
  "ipAddressFlag": "Suspicious",
  "previousFraudulentActivity": "None",
  "timestamp": "2025-09-20T10:30:00Z"
}
```

### Example Prediction Response

```json
{
  "riskScore": 0.75,
  "fraudProbability": 75.0,
  "classification": "High Risk",
  "confidence": 87,
  "timestamp": "2025-09-20T10:30:05Z",
  "transactionId": "TXN_12345"
}
```

## 🛠️ Manual Setup (Alternative)

If the automatic setup doesn't work:

### 1. Copy Your Model

```bash
# Copy your .pkl file to the models directory
cp ~/Downloads/your_model.pkl models/fraud_model.pkl
```

### 2. Install Python Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 3. Configure Model Path

Edit `server/config.py`:

```python
MODEL_PATH = "models/fraud_model.pkl"
```

## 📁 Project Structure

```
frauddetection/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Dashboard/
│   │   │       ├── Dashboard.js
│   │   │       ├── TransactionForm.js
│   │   │       ├── FraudAnalytics.js
│   │   │       ├── FraudTrendChart.js
│   │   │       ├── FraudDistributionChart.js
│   │   │       ├── FraudHeatmap.js
│   │   │       └── FeatureImportanceChart.js
│   │   └── services/
│   │       └── realMLModelService.js
├── server/                     # Python backend
│   ├── model_service.py        # Flask API server
│   ├── requirements.txt        # Python dependencies
│   └── config.py              # Configuration
├── models/                     # ML model files
│   └── fraud_model.pkl        # Your trained model
└── setup_model.py             # Automatic setup script
```

## 🎯 How It Works

1. **Model Loading**: Python backend loads your `.pkl` model using pickle/joblib
2. **Data Processing**: Transaction data is preprocessed to match your model's expected format
3. **Prediction**: Real ML model generates fraud probability and risk score
4. **Visualization**: Frontend receives predictions and updates charts in real-time
5. **Analytics**: Historical predictions are stored and analyzed for trends

## 🔄 Fallback System

If the Python backend is unavailable, the system automatically falls back to:

- Simulated predictions based on rule-based algorithms
- Local analytics generation
- All visualizations continue to work

## 🐛 Troubleshooting

### Backend Issues

```bash
# Check if Python backend is running
curl http://localhost:5000/health

# Check model loading
python -c "import pickle; pickle.load(open('models/fraud_model.pkl', 'rb'))"
```

### Frontend Issues

```bash
# Clear cache and restart
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Model Issues

- Ensure your `.pkl` file is compatible with the installed Python version
- Check that all required libraries are installed
- Verify the model file isn't corrupted

## 🚀 Next Steps

1. **Customize Features**: Modify the preprocessing in `model_service.py` to match your model's training features
2. **Add Authentication**: Implement user authentication for production use
3. **Database Integration**: Store predictions in a database for long-term analytics
4. **Deploy**: Deploy to cloud platforms like AWS, Azure, or Heroku

## 🤝 Support

If you encounter any issues:

1. Check the console logs in both frontend and backend
2. Verify your model file is in the correct format
3. Ensure all dependencies are installed correctly

Your fraud detection system is now ready to use your team's real ML model! 🎉
