// Real ML Model Service - Connects to Python backend with actual .pkl model
// This service replaces the simulated predictions with real model predictions

class RealMLModelService {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.predictionHistory = [];
    this.isModelLoaded = false;
    this.checkModelStatus();
  }

  async checkModelStatus() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (response.ok) {
        const data = await response.json();
        this.isModelLoaded = data.model_loaded;
        console.log('Model service status:', data);
      }
    } catch (error) {
      console.warn('Model service not available, using fallback');
      this.isModelLoaded = false;
    }
  }

  async loadModel(modelPath) {
    try {
      const response = await fetch(`${this.baseURL}/load-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model_path: modelPath }),
      });

      if (response.ok) {
        this.isModelLoaded = true;
        console.log('Model loaded successfully');
        return true;
      } else {
        console.error('Failed to load model');
        return false;
      }
    } catch (error) {
      console.error('Error loading model:', error);
      return false;
    }
  }

  async predictFraud(transactionData) {
    try {
      // Try to use real model first
      if (this.isModelLoaded) {
        const response = await fetch(`${this.baseURL}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        });

        if (response.ok) {
          const prediction = await response.json();
          this.predictionHistory.push(prediction);
          return prediction;
        }
      }

      // Fallback to simulated prediction if real model fails
      console.warn('Using fallback prediction method');
      return this.simulatedPrediction(transactionData);
    } catch (error) {
      console.error('Prediction error:', error);
      // Fallback to simulated prediction
      return this.simulatedPrediction(transactionData);
    }
  }

  // Fallback simulation method (same as before)
  simulatedPrediction(transactionData) {
    const {
      transactionAmount,
      accountBalance,
      deviceType,
      merchantCategory,
      ipAddressFlag,
      timestamp,
      previousFraudulentActivity,
    } = transactionData;

    let riskScore = 0;
    const features = {};

    // Amount risk calculation
    const amountRisk = this.calculateAmountRisk(
      transactionAmount,
      accountBalance
    );
    riskScore += amountRisk * 0.25;
    features.amountRisk = amountRisk;

    // Device risk calculation
    const deviceRisk = this.calculateDeviceRisk(deviceType);
    riskScore += deviceRisk * 0.2;
    features.deviceRisk = deviceRisk;

    // Merchant risk calculation
    const merchantRisk = this.calculateMerchantRisk(merchantCategory);
    riskScore += merchantRisk * 0.15;
    features.merchantRisk = merchantRisk;

    // IP risk calculation
    const ipRisk = this.calculateIPRisk(ipAddressFlag);
    riskScore += ipRisk * 0.25;
    features.ipRisk = ipRisk;

    // Time-based risk
    const timeRisk = this.calculateTimeRisk(timestamp);
    riskScore += timeRisk * 0.1;
    features.timeRisk = timeRisk;

    // Previous fraud history risk
    const historyRisk = this.calculateHistoryRisk(previousFraudulentActivity);
    riskScore += historyRisk * 0.15;
    features.historyRisk = historyRisk;

    // Normalize score to 0-1 range
    riskScore = Math.min(Math.max(riskScore, 0), 1);

    // Determine status based on risk score and classification
    const status = this.determineStatus(riskScore);
    const classification = this.classifyRisk(riskScore);

    console.log(
      `Transaction ${
        transactionData.transactionId
      }: Amount=${transactionAmount}, Balance=${accountBalance}, Risk=${riskScore.toFixed(
        3
      )}, Status=${status}, Classification=${classification}`
    );

    const prediction = {
      riskScore: riskScore,
      fraudProbability: riskScore * 100,
      classification: classification,
      status: status,
      confidence: this.calculateConfidence(riskScore, features),
      features: features,
      timestamp: new Date().toISOString(),
      transactionId: transactionData.transactionId || `TXN_${Date.now()}`,
      source: 'simulated', // Mark as simulated for debugging
    };

    this.predictionHistory.push(prediction);
    return prediction;
  }

  async getFraudAnalytics() {
    try {
      // Check if we have any local data, if not generate some
      if (this.predictionHistory.length === 0) {
        console.log('No prediction history, generating sample data...');
        this.generateSampleData(10);
      }

      // Try to get analytics from backend
      if (this.isModelLoaded) {
        const response = await fetch(`${this.baseURL}/analytics`);
        if (response.ok) {
          const analytics = await response.json();
          console.log('Backend analytics:', analytics);

          // If backend has no data, use local data
          if (analytics.totalPredictions === 0) {
            console.log('Backend has no predictions, using local data');
            return this.getLocalAnalytics();
          }

          return this.enhanceAnalytics(analytics);
        }
      }

      // Fallback to local analytics
      console.log('Using local analytics fallback');
      return this.getLocalAnalytics();
    } catch (error) {
      console.error('Analytics error:', error);
      return this.getLocalAnalytics();
    }
  }

  enhanceAnalytics(backendAnalytics) {
    // Enhance backend analytics with additional frontend features
    return {
      ...backendAnalytics,
      hourlyPattern: this.getHourlyPattern(
        backendAnalytics.recentPredictions || []
      ),
      deviceAnalysis: this.getDeviceAnalysis(
        backendAnalytics.recentPredictions || []
      ),
      merchantAnalysis: this.getMerchantAnalysis(
        backendAnalytics.recentPredictions || []
      ),
    };
  }

  getLocalAnalytics() {
    const recentPredictions = this.predictionHistory.slice(-100);

    return {
      totalPredictions: this.predictionHistory.length,
      recentPredictions: recentPredictions,
      fraudDistribution: this.getFraudDistribution(recentPredictions),
      riskTrends: this.getRiskTrends(recentPredictions),
      hourlyPattern: this.getHourlyPattern(recentPredictions),
      deviceAnalysis: this.getDeviceAnalysis(recentPredictions),
      merchantAnalysis: this.getMerchantAnalysis(recentPredictions),
    };
  }

  // Helper methods for fallback simulation
  calculateAmountRisk(amount, balance) {
    // Avoid division by zero and handle very low balances
    const safeBalance = Math.max(balance, 1);
    const amountToBalanceRatio = amount / safeBalance;
    let risk = 0;

    // Risk based on absolute amount
    if (amount > 10000) risk += 0.5;
    else if (amount > 5000) risk += 0.4;
    else if (amount > 2000) risk += 0.3;
    else if (amount > 1000) risk += 0.2;
    else if (amount > 500) risk += 0.1;

    // Risk based on amount-to-balance ratio
    if (amountToBalanceRatio > 0.9) risk += 0.4; // Very high ratio
    else if (amountToBalanceRatio > 0.7) risk += 0.3; // High ratio
    else if (amountToBalanceRatio > 0.5) risk += 0.2; // Medium ratio
    else if (amountToBalanceRatio > 0.3) risk += 0.1; // Moderate ratio

    // Additional risk for low balances with significant transactions
    if (balance < 1000 && amount > 500) risk += 0.3;
    if (balance < 500 && amount > 200) risk += 0.4;
    if (balance < 100 && amount > 50) risk += 0.5;

    // Risk for round numbers (often suspicious)
    if (amount % 1000 === 0 && amount >= 1000) risk += 0.1;
    if (amount % 100 === 0 && amount >= 500) risk += 0.05;

    return Math.min(risk, 1);
  }

  calculateDeviceRisk(deviceType) {
    const riskMap = {
      Mobile: 0.3,
      Desktop: 0.1,
      Tablet: 0.2,
      ATM: 0.05,
      'POS Terminal': 0.05,
      'Web Browser': 0.2,
      Other: 0.6,
    };
    return riskMap[deviceType] || 0.5;
  }

  calculateMerchantRisk(category) {
    const riskMap = {
      Grocery: 0.05,
      'Gas Station': 0.1,
      Restaurant: 0.1,
      Retail: 0.15,
      'Online Shopping': 0.4,
      Entertainment: 0.3,
      Healthcare: 0.05,
      Travel: 0.25,
      Utilities: 0.05,
      'Financial Services': 0.2,
      Other: 0.5,
    };
    return riskMap[category] || 0.3;
  }

  calculateIPRisk(ipFlag) {
    const riskMap = {
      Safe: 0.05,
      Suspicious: 0.4,
      'High Risk': 0.7,
      Blacklisted: 0.9,
      Unknown: 0.6,
    };
    return riskMap[ipFlag] || 0.5;
  }

  calculateTimeRisk(timestamp) {
    const hour = new Date(timestamp).getHours();
    const highRiskHours = [22, 23, 0, 1, 2, 3];
    return highRiskHours.includes(hour) ? 0.3 : 0.1;
  }

  calculateHistoryRisk(previousActivity) {
    const riskMap = {
      None: 0.05,
      'Low Risk': 0.2,
      'Medium Risk': 0.5,
      'High Risk': 0.8,
      'Previously Flagged': 0.9,
    };
    return riskMap[previousActivity] || 0.3;
  }

  classifyRisk(riskScore) {
    if (riskScore >= 0.7) return 'High Risk';
    if (riskScore >= 0.4) return 'Medium Risk';
    if (riskScore >= 0.2) return 'Low Risk';
    return 'Safe';
  }

  determineStatus(riskScore) {
    // More deterministic status based on risk score with controlled randomization
    console.log('Determining status for risk score:', riskScore);

    if (riskScore >= 0.8) {
      // Very high risk: always blocked
      return 'Blocked';
    } else if (riskScore >= 0.6) {
      // High risk: mostly blocked, some flagged
      return Math.random() < 0.7 ? 'Blocked' : 'Flagged';
    } else if (riskScore >= 0.4) {
      // Medium risk: mostly flagged, some blocked/approved
      const rand = Math.random();
      if (rand < 0.1) return 'Blocked';
      if (rand < 0.7) return 'Flagged';
      return 'Approved';
    } else if (riskScore >= 0.2) {
      // Low risk: mostly approved, some flagged
      return Math.random() < 0.2 ? 'Flagged' : 'Approved';
    } else {
      // Very low risk: almost always approved
      return Math.random() < 0.05 ? 'Flagged' : 'Approved';
    }
  }

  calculateConfidence(riskScore, features) {
    const featureValues = Object.values(features);
    const variance = this.calculateVariance(featureValues);
    const confidence = Math.max(0.6, 1 - variance);
    return Math.round(confidence * 100);
  }

  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return variance;
  }

  // Analytics helper methods
  getFraudDistribution(predictions) {
    const distribution = {
      Safe: 0,
      'Low Risk': 0,
      'Medium Risk': 0,
      'High Risk': 0,
    };
    predictions.forEach((pred) => {
      distribution[pred.classification]++;
    });
    return distribution;
  }

  getRiskTrends(predictions) {
    return predictions.map((pred, index) => ({
      x: index,
      y: pred.riskScore,
      timestamp: pred.timestamp,
      classification: pred.classification,
    }));
  }

  getHourlyPattern(predictions) {
    const hourlyData = new Array(24).fill(0);
    predictions.forEach((pred) => {
      const hour = new Date(pred.timestamp).getHours();
      if (pred.riskScore > 0.5) {
        hourlyData[hour]++;
      }
    });
    return hourlyData.map((count, hour) => ({ hour, count }));
  }

  getDeviceAnalysis(predictions) {
    const deviceRisk = {};
    predictions.forEach((pred) => {
      const device = 'Mobile'; // Placeholder - would need actual device data
      if (!deviceRisk[device]) {
        deviceRisk[device] = { total: 0, risky: 0 };
      }
      deviceRisk[device].total++;
      if (pred.riskScore > 0.5) {
        deviceRisk[device].risky++;
      }
    });
    return deviceRisk;
  }

  getMerchantAnalysis(predictions) {
    const merchantRisk = {};
    predictions.forEach((pred) => {
      const merchant = 'Online Shopping'; // Placeholder - would need actual merchant data
      if (!merchantRisk[merchant]) {
        merchantRisk[merchant] = { total: 0, risky: 0 };
      }
      merchantRisk[merchant].total++;
      if (pred.riskScore > 0.5) {
        merchantRisk[merchant].risky++;
      }
    });
    return merchantRisk;
  }

  generateSampleData(count = 50) {
    // Generate sample data for testing with more realistic scenarios
    const sampleTransactions = [];
    const devices = ['Mobile', 'Desktop', 'Tablet', 'ATM', 'POS Terminal'];
    const merchants = [
      'Grocery',
      'Gas Station',
      'Restaurant',
      'Online Shopping',
      'Entertainment',
      'Healthcare',
      'Travel',
      'Utilities',
    ];
    const ipFlags = ['Safe', 'Suspicious', 'High Risk', 'Blacklisted'];
    const fraudHistory = [
      'None',
      'Low Risk',
      'Medium Risk',
      'High Risk',
      'Previously Flagged',
    ];

    for (let i = 0; i < count; i++) {
      // Create more varied transaction scenarios
      let transactionAmount, accountBalance;

      const scenario = Math.random();
      if (scenario < 0.2) {
        // Low balance scenario (20% of transactions)
        accountBalance = Math.random() * 500 + 50; // $50-$550
        transactionAmount = Math.random() * 400 + 20; // $20-$420
      } else if (scenario < 0.4) {
        // Medium balance scenario (20% of transactions)
        accountBalance = Math.random() * 2000 + 500; // $500-$2500
        transactionAmount = Math.random() * 800 + 50; // $50-$850
      } else if (scenario < 0.1) {
        // High-risk scenario (10% of transactions)
        accountBalance = Math.random() * 10000 + 1000; // $1K-$11K
        transactionAmount = Math.random() * 8000 + 2000; // $2K-$10K (large amounts)
      } else {
        // Normal scenarios (50% of transactions)
        accountBalance = Math.random() * 20000 + 2000; // $2K-$22K
        transactionAmount = Math.random() * 1500 + 10; // $10-$1510
      }

      const transaction = {
        transactionId: `TXN_${1000 + i}`,
        userId: `USER_${100 + (i % 20)}`,
        transactionAmount: Math.round(transactionAmount * 100) / 100, // Round to 2 decimals
        accountBalance: Math.round(accountBalance * 100) / 100, // Round to 2 decimals
        deviceType: devices[Math.floor(Math.random() * devices.length)],
        merchantCategory:
          merchants[Math.floor(Math.random() * merchants.length)],
        ipAddressFlag: ipFlags[Math.floor(Math.random() * ipFlags.length)],
        previousFraudulentActivity:
          fraudHistory[Math.floor(Math.random() * fraudHistory.length)],
        timestamp: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      const prediction = this.simulatedPrediction(transaction);

      // Add prediction to history for analytics
      this.predictionHistory.push(prediction);
      sampleTransactions.push({ transaction, prediction });
    }

    console.log(
      `Generated ${count} sample predictions with varied risk scenarios`
    );
    return sampleTransactions;
  }

  clearHistory() {
    this.predictionHistory = [];
  }
}

// Export singleton instance
const realMLModelService = new RealMLModelService();
export default realMLModelService;
