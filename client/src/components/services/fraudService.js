// Fraud detection service with synthetic data generation
export class FraudService {
  constructor() {
    this.transactionId = 1;
    this.merchants = [
      'Amazon',
      'Walmart',
      'Target',
      'Best Buy',
      'Home Depot',
      'Starbucks',
      "McDonald's",
      'Shell',
      'Exxon',
      'CVS',
      'Walgreens',
      'Costco',
      'Apple Store',
      'Netflix',
      'Spotify',
    ];

    this.locations = [
      { city: 'New York', state: 'NY', country: 'USA' },
      { city: 'Los Angeles', state: 'CA', country: 'USA' },
      { city: 'Chicago', state: 'IL', country: 'USA' },
      { city: 'Houston', state: 'TX', country: 'USA' },
      { city: 'Phoenix', state: 'AZ', country: 'USA' },
      { city: 'Philadelphia', state: 'PA', country: 'USA' },
      { city: 'San Antonio', state: 'TX', country: 'USA' },
      { city: 'San Diego', state: 'CA', country: 'USA' },
      { city: 'Dallas', state: 'TX', country: 'USA' },
      { city: 'San Jose', state: 'CA', country: 'USA' },
    ];

    this.cardTypes = ['Visa', 'Mastercard', 'American Express', 'Discover'];
    this.transactionTypes = ['purchase', 'withdrawal', 'transfer', 'payment'];
  }

  generateCardNumber() {
    const prefixes = {
      Visa: '4',
      Mastercard: '5',
      'American Express': '3',
      Discover: '6',
    };

    const cardType =
      this.cardTypes[Math.floor(Math.random() * this.cardTypes.length)];
    const prefix = prefixes[cardType];
    const remaining = Array.from({ length: 15 }, () =>
      Math.floor(Math.random() * 10)
    ).join('');

    return `${prefix}${remaining}`;
  }

  generateUserId() {
    return `user_${Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0')}`;
  }

  async calculateRiskScore(transaction) {
    try {
      // Try to use the server's ML model first
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionAmount: transaction.amount,
          accountBalance: 5000, // Default balance for generated transactions
          transactionType: transaction.transactionType,
          deviceType: 'Web Browser',
          merchantCategory: transaction.merchant,
          location: transaction.location,
          ipAddressFlag: this.determineIpFlag(transaction),
          previousFraudulentActivity: 'None',
          transactionId: transaction.id,
          timestamp: transaction.timestamp,
          userId: transaction.userId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Server ML prediction:', result);
        return {
          riskScore: result.riskScore || result.risk_score || 0,
          classification: result.classification || 'Unknown',
          isFraud: result.isFraud || result.is_fraud || false,
          confidence: result.confidence || 0,
          source: 'server_ml_model',
        };
      }
    } catch (error) {
      console.warn('Server ML model unavailable, using fallback:', error);
    }

    // Fallback to local calculation
    return this.fallbackRiskScore(transaction);
  }

  determineIpFlag(transaction) {
    const hour = new Date(transaction.timestamp).getHours();
    if (transaction.amount > 5000) return 'Blacklisted';
    if (transaction.amount > 1000) return 'High Risk';
    if (hour >= 23 || hour <= 5) return 'Suspicious';
    return 'Safe';
  }

  fallbackRiskScore(transaction) {
    let riskScore = 0;

    // Amount-based risk
    if (transaction.amount > 5000) riskScore += 30;
    else if (transaction.amount > 1000) riskScore += 15;
    else if (transaction.amount < 1) riskScore += 10;

    // Time-based risk (late night transactions)
    const hour = new Date(transaction.timestamp).getHours();
    if (hour >= 23 || hour <= 5) riskScore += 20;

    // Location-based risk (random high-risk locations)
    if (Math.random() < 0.1) riskScore += 25; // 10% chance of high-risk location

    // Card type risk
    if (transaction.cardType === 'American Express') riskScore += 5;

    // Transaction type risk
    if (
      transaction.transactionType === 'withdrawal' &&
      transaction.amount > 500
    ) {
      riskScore += 15;
    }

    // Random anomaly detection
    if (Math.random() < 0.05) riskScore += 40; // 5% chance of anomaly

    const finalScore = Math.min(riskScore, 100) / 100; // Convert to 0-1 scale

    return {
      riskScore: finalScore,
      classification: this.classifyRisk(finalScore),
      isFraud: finalScore >= 0.7,
      confidence: Math.random() * 30 + 70, // 70-100% confidence
      source: 'fallback_calculation',
    };
  }

  classifyRisk(riskScore) {
    if (riskScore >= 0.8) return 'High Risk';
    if (riskScore >= 0.6) return 'Medium Risk';
    if (riskScore >= 0.3) return 'Low Risk';
    return 'Safe';
  }

  determineStatus(riskScore) {
    // riskScore is now 0-1 scale
    // Match the ML model classification thresholds
    if (riskScore >= 0.7) return 'blocked'; // High Risk
    if (riskScore >= 0.4) return 'flagged'; // Medium Risk
    if (riskScore >= 0.2) return 'flagged'; // Low Risk (still flagged for review)
    return 'approved'; // Safe
  }

  async generateTransaction() {
    const amount = this.generateAmount();
    const location =
      this.locations[Math.floor(Math.random() * this.locations.length)];
    const merchant =
      this.merchants[Math.floor(Math.random() * this.merchants.length)];
    const cardType =
      this.cardTypes[Math.floor(Math.random() * this.cardTypes.length)];
    const transactionType =
      this.transactionTypes[
        Math.floor(Math.random() * this.transactionTypes.length)
      ];

    const transaction = {
      id: `txn_${this.transactionId.toString().padStart(8, '0')}`,
      userId: this.generateUserId(),
      amount: amount,
      merchant: merchant,
      location: `${location.city}, ${location.state}`,
      country: location.country,
      cardNumber: this.generateCardNumber(),
      cardType: cardType,
      transactionType: transactionType,
      timestamp: new Date().toISOString(),
      ipAddress: this.generateIpAddress(),
      deviceId: this.generateDeviceId(),
      userAgent: this.generateUserAgent(),
    };

    // Calculate risk score using ML model or fallback
    const prediction = await this.calculateRiskScore(transaction);
    const status = this.determineStatus(prediction.riskScore);

    transaction.riskScore = prediction.riskScore;
    transaction.status = status;
    transaction.fraudProbability = prediction.riskScore;
    transaction.classification = prediction.classification;
    transaction.prediction = prediction;

    this.transactionId++;
    return transaction;
  }

  generateAmount() {
    const rand = Math.random();

    // 70% normal transactions ($1-$500)
    if (rand < 0.7) {
      return parseFloat((Math.random() * 500 + 1).toFixed(2));
    }
    // 20% medium transactions ($500-$2000)
    else if (rand < 0.9) {
      return parseFloat((Math.random() * 1500 + 500).toFixed(2));
    }
    // 10% high-value transactions ($2000-$10000)
    else {
      return parseFloat((Math.random() * 8000 + 2000).toFixed(2));
    }
  }

  generateIpAddress() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(
      Math.random() * 256
    )}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  generateDeviceId() {
    const chars = 'abcdef0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateUserAgent() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  // Batch generation for testing
  generateBatch(count = 100) {
    const transactions = [];
    for (let i = 0; i < count; i++) {
      transactions.push(this.generateTransaction());
    }
    return transactions;
  }

  // Analytics methods
  getTransactionStats(transactions) {
    const total = transactions.length;
    const approved = transactions.filter((t) => t.status === 'approved').length;
    const flagged = transactions.filter((t) => t.status === 'flagged').length;
    const blocked = transactions.filter((t) => t.status === 'blocked').length;

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    const avgRiskScore =
      total > 0
        ? transactions.reduce((sum, t) => sum + t.riskScore, 0) / total
        : 0;

    return {
      total,
      approved,
      flagged,
      blocked,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0',
      flaggedRate: total > 0 ? ((flagged / total) * 100).toFixed(1) : '0.0',
      blockedRate: total > 0 ? ((blocked / total) * 100).toFixed(1) : '0.0',
      totalAmount: totalAmount.toFixed(2),
      avgAmount: avgAmount.toFixed(2),
      avgRiskScore: avgRiskScore.toFixed(1),
    };
  }
}

// Create singleton instance
export const fraudService = new FraudService();
