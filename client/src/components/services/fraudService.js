// Fraud detection service with synthetic data generation
export class FraudService {
  constructor() {
    this.transactionId = 1;
    this.merchants = [
      'Amazon India', 'Flipkart', 'Reliance', 'Big Bazaar', 'Tata Cliq',
      'Paytm', 'Zomato', 'Swiggy', 'Ola', 'Uber', 'IRCTC', 'BookMyShow',
      'Airtel', 'Jio', 'Vodafone', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
      'SBI', 'Croma', 'Myntra', 'Snapdeal', 'RedBus', 'MakeMyTrip', 'Indigo',
      'SpiceJet', 'GoAir', 'Vistara', 'Tanishq', 'Titan', 'Dominos', 'Pizza Hut'
    ];

    this.locations = [
      { city: 'Mumbai', state: 'MH', country: 'India' },
      { city: 'Delhi', state: 'DL', country: 'India' },
      { city: 'Bengaluru', state: 'KA', country: 'India' },
      { city: 'Hyderabad', state: 'TG', country: 'India' },
      { city: 'Ahmedabad', state: 'GJ', country: 'India' },
      { city: 'Chennai', state: 'TN', country: 'India' },
      { city: 'Kolkata', state: 'WB', country: 'India' },
      { city: 'Pune', state: 'MH', country: 'India' },
      { city: 'Jaipur', state: 'RJ', country: 'India' },
      { city: 'Lucknow', state: 'UP', country: 'India' },
      { city: 'Kanpur', state: 'UP', country: 'India' },
      { city: 'Nagpur', state: 'MH', country: 'India' },
      { city: 'Indore', state: 'MP', country: 'India' },
      { city: 'Thane', state: 'MH', country: 'India' },
      { city: 'Bhopal', state: 'MP', country: 'India' },
      { city: 'Visakhapatnam', state: 'AP', country: 'India' },
      { city: 'Patna', state: 'BR', country: 'India' },
      { city: 'Vadodara', state: 'GJ', country: 'India' },
      { city: 'Ghaziabad', state: 'UP', country: 'India' },
      { city: 'Ludhiana', state: 'PB', country: 'India' },
      { city: 'Agra', state: 'UP', country: 'India' },
      { city: 'Nashik', state: 'MH', country: 'India' },
      { city: 'Faridabad', state: 'HR', country: 'India' },
      { city: 'Meerut', state: 'UP', country: 'India' },
      { city: 'Rajkot', state: 'GJ', country: 'India' },
      { city: 'Kalyan-Dombivali', state: 'MH', country: 'India' },
      { city: 'Vasai-Virar', state: 'MH', country: 'India' },
      { city: 'Varanasi', state: 'UP', country: 'India' },
      { city: 'Srinagar', state: 'JK', country: 'India' },
      { city: 'Aurangabad', state: 'MH', country: 'India' },
      { city: 'Dhanbad', state: 'JH', country: 'India' },
      { city: 'Amritsar', state: 'PB', country: 'India' },
      { city: 'Navi Mumbai', state: 'MH', country: 'India' },
      { city: 'Allahabad', state: 'UP', country: 'India' },
      { city: 'Ranchi', state: 'JH', country: 'India' },
      { city: 'Howrah', state: 'WB', country: 'India' },
      { city: 'Coimbatore', state: 'TN', country: 'India' },
      { city: 'Jabalpur', state: 'MP', country: 'India' },
      { city: 'Gwalior', state: 'MP', country: 'India' },
      { city: 'Vijayawada', state: 'AP', country: 'India' },
      { city: 'Jodhpur', state: 'RJ', country: 'India' },
      { city: 'Madurai', state: 'TN', country: 'India' },
      { city: 'Raipur', state: 'CG', country: 'India' },
      { city: 'Kota', state: 'RJ', country: 'India' },
      { city: 'Guwahati', state: 'AS', country: 'India' },
      { city: 'Chandigarh', state: 'CH', country: 'India' },
      { city: 'Solapur', state: 'MH', country: 'India' },
      { city: 'Hubli-Dharwad', state: 'KA', country: 'India' },
      { city: 'Bareilly', state: 'UP', country: 'India' },
      { city: 'Moradabad', state: 'UP', country: 'India' },
      { city: 'Mysore', state: 'KA', country: 'India' },
      { city: 'Gurgaon', state: 'HR', country: 'India' },
      { city: 'Aligarh', state: 'UP', country: 'India' },
      { city: 'Jalandhar', state: 'PB', country: 'India' },
      { city: 'Tiruchirappalli', state: 'TN', country: 'India' },
      { city: 'Bhubaneswar', state: 'OD', country: 'India' },
      { city: 'Salem', state: 'TN', country: 'India' },
      { city: 'Warangal', state: 'TG', country: 'India' },
      { city: 'Mira-Bhayandar', state: 'MH', country: 'India' },
      { city: 'Thiruvananthapuram', state: 'KL', country: 'India' },
      { city: 'Bhiwandi', state: 'MH', country: 'India' },
      { city: 'Saharanpur', state: 'UP', country: 'India' },
      { city: 'Guntur', state: 'AP', country: 'India' },
      { city: 'Amravati', state: 'MH', country: 'India' },
      { city: 'Noida', state: 'UP', country: 'India' },
      { city: 'Jamshedpur', state: 'JH', country: 'India' },
      { city: 'Bhilai', state: 'CG', country: 'India' },
      { city: 'Cuttack', state: 'OD', country: 'India' },
      { city: 'Firozabad', state: 'UP', country: 'India' },
      { city: 'Kochi', state: 'KL', country: 'India' },
      { city: 'Bhavnagar', state: 'GJ', country: 'India' },
      { city: 'Dehradun', state: 'UK', country: 'India' },
      { city: 'Durgapur', state: 'WB', country: 'India' },
      { city: 'Asansol', state: 'WB', country: 'India' },
      { city: 'Nanded', state: 'MH', country: 'India' },
      { city: 'Kolhapur', state: 'MH', country: 'India' },
      { city: 'Ajmer', state: 'RJ', country: 'India' },
      { city: 'Gulbarga', state: 'KA', country: 'India' },
      { city: 'Jamnagar', state: 'GJ', country: 'India' },
      { city: 'Ujjain', state: 'MP', country: 'India' },
      { city: 'Loni', state: 'UP', country: 'India' },
      { city: 'Siliguri', state: 'WB', country: 'India' },
      { city: 'Jhansi', state: 'UP', country: 'India' },
      { city: 'Ulhasnagar', state: 'MH', country: 'India' },
      { city: 'Nellore', state: 'AP', country: 'India' },
      { city: 'Jammu', state: 'JK', country: 'India' },
      { city: 'Belgaum', state: 'KA', country: 'India' },
      { city: 'Mangalore', state: 'KA', country: 'India' },
      { city: 'Ambattur', state: 'TN', country: 'India' },
      { city: 'Tirunelveli', state: 'TN', country: 'India' },
      { city: 'Malegaon', state: 'MH', country: 'India' },
      { city: 'Gaya', state: 'BR', country: 'India' },
      { city: 'Udaipur', state: 'RJ', country: 'India' },
      { city: 'Maheshtala', state: 'WB', country: 'India' },
      { city: 'Davanagere', state: 'KA', country: 'India' },
      { city: 'Kozhikode', state: 'KL', country: 'India' },
      { city: 'Kurnool', state: 'AP', country: 'India' },
      { city: 'Rajpur Sonarpur', state: 'WB', country: 'India' },
      { city: 'Bokaro', state: 'JH', country: 'India' },
      { city: 'South Dumdum', state: 'WB', country: 'India' }
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

  calculateRiskScore(transaction) {
    let riskScore = 0;

    // Amount-based risk
    if (transaction.amount > 5000) riskScore += 30;
    else if (transaction.amount > 1000) riskScore += 15;
    else if (transaction.amount < 1) riskScore += 10;

    // Time-based risk (late night transactions)
    const hour = new Date(transaction.timestamp).getHours();
    if (hour >= 23 || hour <= 5) riskScore += 20;

    // Card type risk
    if (transaction.cardType === 'American Express') riskScore += 5;

    // Transaction type risk
    if (
      transaction.transactionType === 'withdrawal' &&
      transaction.amount > 500
    ) {
      riskScore += 15;
    }

    // Deterministic fraud rate: based on transactionId
    // Every 10th transaction is flagged, every 25th is blocked
    if (this.transactionId % 25 === 0) riskScore += 70;
    else if (this.transactionId % 10 === 0) riskScore += 45;

    return Math.min(riskScore, 100);
  }

  determineStatus(riskScore) {
    if (riskScore >= 70) return 'blocked';
    if (riskScore >= 40) return 'flagged';
    return 'approved';
  }

  generateTransaction() {
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

    // Calculate risk score based on transaction details
    const riskScore = this.calculateRiskScore(transaction);
    const status = this.determineStatus(riskScore);

    transaction.riskScore = riskScore;
    transaction.status = status;
    transaction.fraudProbability = (riskScore / 100).toFixed(3);

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
