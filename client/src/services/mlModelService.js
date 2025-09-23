// ML Model Service - Simulates fraud detection predictions
// This service mimics the behavior of a trained ML model (.pkl file)

class MLModelService {
  constructor() {
    this.modelWeights = {
      transactionAmount: 0.25,
      accountBalance: 0.15,
      deviceType: 0.2,
      merchantCategory: 0.15,
      ipAddressFlag: 0.25,
    };

    // Historical data for analytics
    this.predictionHistory = [];
    this.fraudPatterns = {
      highRiskHours: [22, 23, 0, 1, 2, 3], // Late night hours
      suspiciousAmounts: [1000, 5000, 10000], // Common fraud amounts
      riskDevices: ['Mobile', 'Unknown'],
      riskMerchants: ['Online Shopping', 'Entertainment', 'Other'],
    };
  }

  // Simulate fraud prediction based on transaction features
  predictFraud(transactionData) {
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
    riskScore += amountRisk * this.modelWeights.transactionAmount;
    features.amountRisk = amountRisk;

    // Device risk calculation
    const deviceRisk = this.calculateDeviceRisk(deviceType);
    riskScore += deviceRisk * this.modelWeights.deviceType;
    features.deviceRisk = deviceRisk;

    // Merchant risk calculation
    const merchantRisk = this.calculateMerchantRisk(merchantCategory);
    riskScore += merchantRisk * this.modelWeights.merchantCategory;
    features.merchantRisk = merchantRisk;

    // IP risk calculation
    const ipRisk = this.calculateIPRisk(ipAddressFlag);
    riskScore += ipRisk * this.modelWeights.ipAddressFlag;
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

    const prediction = {
      riskScore: riskScore,
      fraudProbability: riskScore * 100,
      classification: this.classifyRisk(riskScore),
      confidence: this.calculateConfidence(riskScore, features),
      features: features,
      timestamp: new Date().toISOString(),
      transactionId: transactionData.transactionId || `TXN_${Date.now()}`,
    };

    // Store prediction for analytics
    this.predictionHistory.push(prediction);

    return prediction;
  }

  calculateAmountRisk(amount, balance) {
    // Higher risk for large amounts or amounts exceeding balance
    const amountToBalanceRatio = amount / (balance + 1);
    let risk = 0;

    if (amount > 10000) risk += 0.4;
    else if (amount > 5000) risk += 0.3;
    else if (amount > 1000) risk += 0.2;

    if (amountToBalanceRatio > 0.5) risk += 0.3;
    if (amountToBalanceRatio > 0.8) risk += 0.3;

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
    return this.fraudPatterns.highRiskHours.includes(hour) ? 0.3 : 0.1;
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

  calculateConfidence(riskScore, features) {
    // Calculate confidence based on feature consistency
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

  // Analytics methods for dashboard visualizations
  getFraudAnalytics() {
    const recentPredictions = this.predictionHistory.slice(-100); // Last 100 predictions

    return {
      totalPredictions: this.predictionHistory.length,
      recentPredictions: recentPredictions,
      fraudDistribution: this.getFraudDistribution(recentPredictions),
      riskTrends: this.getRiskTrends(recentPredictions),
      featureImportance: this.getFeatureImportance(),
      hourlyPattern: this.getHourlyPattern(recentPredictions),
      deviceAnalysis: this.getDeviceAnalysis(recentPredictions),
      merchantAnalysis: this.getMerchantAnalysis(recentPredictions),
    };
  }

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

  getFeatureImportance() {
    return [
      { feature: 'Transaction Amount', importance: 25 },
      { feature: 'IP Address Flag', importance: 25 },
      { feature: 'Device Type', importance: 20 },
      { feature: 'Merchant Category', importance: 15 },
      { feature: 'Account Balance', importance: 15 },
    ];
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
      // Extract device from transaction data (would need to store this)
      const device = 'Mobile'; // Placeholder
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
      // Extract merchant from transaction data (would need to store this)
      const merchant = 'Online Shopping'; // Placeholder
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

  // Generate sample data for testing
  generateSampleData(count = 50) {
    const sampleTransactions = [];
    const devices = ['Mobile', 'Desktop', 'Tablet', 'ATM'];
    const merchants = [
      'Grocery',
      'Gas Station',
      'Restaurant',
      'Online Shopping',
      'Entertainment',
    ];
    const ipFlags = ['Safe', 'Suspicious', 'High Risk'];
    const fraudHistory = ['None', 'Low Risk', 'Medium Risk', 'High Risk'];

    for (let i = 0; i < count; i++) {
      const transaction = {
        transactionId: `TXN_${1000 + i}`,
        userId: `USER_${100 + (i % 20)}`,
        transactionAmount: Math.random() * 15000 + 10,
        accountBalance: Math.random() * 50000 + 1000,
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

      const prediction = this.predictFraud(transaction);
      sampleTransactions.push({ transaction, prediction });
    }

    return sampleTransactions;
  }

  clearHistory() {
    this.predictionHistory = [];
  }
}

// Export singleton instance
const mlModelService = new MLModelService();
export default mlModelService;
