import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  BarChart3,
  Activity,
  RotateCcw,
} from 'lucide-react';
import FraudTrendChart from './FraudTrendChart';
import FraudDistributionChart from './FraudDistributionChart';
import TransactionsList from './TransactionList';
import { useAuth } from '../../contexts/AuthContext';
import mlModelService from '../../services/realMLModelService';
import './FraudAnalytics.css';

const FraudAnalytics = ({ newPrediction = null }) => {
  const { getTransactions, getTransactionStats } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [refreshKey, newPrediction]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      console.log('Loading analytics from API...');

      // Fetch transactions and stats from the API
      const [transactionsResult, statsResult] = await Promise.all([
        getTransactions(50), // Get latest 50 transactions
        getTransactionStats(),
      ]);

      if (transactionsResult.success && statsResult.success) {
        const userTransactions = transactionsResult.transactions;
        const userStats = statsResult.stats;

        setTransactions(userTransactions);

        // Process transactions for analytics
        const processedAnalytics = processTransactionsForAnalytics(
          userTransactions,
          userStats
        );
        setAnalytics(processedAnalytics);

        console.log('Analytics loaded:', processedAnalytics);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);

      // Fallback to sample data for demo
      console.log('Falling back to sample data...');
      if (mlModelService.predictionHistory.length === 0) {
        mlModelService.generateSampleData(10);
      }

      const fallbackData = await mlModelService.getFraudAnalytics();
      setAnalytics(fallbackData);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const processTransactionsForAnalytics = (userTransactions, userStats) => {
    // Convert API transactions to analytics format
    const fraudDistribution = {
      Safe: 0,
      'Low Risk': 0,
      'Medium Risk': 0,
      'High Risk': 0,
    };

    const riskTrends = [];

    // Add data validation and error handling
    if (!Array.isArray(userTransactions)) {
      console.warn('userTransactions is not an array:', userTransactions);
      return {
        totalPredictions: 0,
        fraudCount: 0,
        fraudRate: 0,
        avgAmount: 0,
        totalAmount: 0,
        fraudDistribution,
        riskTrends: [],
      };
    }

    userTransactions.forEach((transaction, index) => {
      try {
        const prediction = transaction.fraud_prediction || {};
        const riskScore = prediction.risk_score || 0;

        // Categorize by risk score - match ML model classification
        if (riskScore >= 0.7) {
          fraudDistribution['High Risk']++;
        } else if (riskScore >= 0.4) {
          fraudDistribution['Medium Risk']++;
        } else if (riskScore >= 0.2) {
          fraudDistribution['Low Risk']++;
        } else {
          fraudDistribution['Safe']++;
        }

        // Add to trends (last 20 transactions)
        if (index < 20) {
          riskTrends.push({
            time: new Date(transaction.timestamp).toLocaleTimeString(),
            riskScore: riskScore,
            isFraud: prediction.is_fraud || riskScore >= 0.7,
            status: transaction.status || 'unknown',
            classification: prediction.classification || 'Unknown',
          });
        }
      } catch (error) {
        console.warn('Error processing transaction:', transaction, error);
      }
    });

    // Safe stats processing with defaults
    const safeStats = userStats || {};

    return {
      totalPredictions: safeStats.total_transactions || 0,
      fraudCount: safeStats.fraud_count || 0,
      fraudRate: safeStats.fraud_rate || 0,
      avgAmount: safeStats.avg_amount || 0,
      totalAmount: safeStats.total_amount || 0,
      fraudDistribution,
      riskTrends: riskTrends.reverse(), // Oldest first for chart
    };
  };

  const refreshAnalytics = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const clearData = () => {
    mlModelService.clearHistory();
    mlModelService.generateSampleData(10); // Generate fewer sample predictions for clarity
    refreshAnalytics();
  };

  if (loading) {
    return (
      <div className="fraud-analytics-container">
        <div className="loading-state">
          <Activity className="loading-icon" />
          <p>Loading fraud analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="fraud-analytics-container">
        <div className="error-state">
          <AlertTriangle className="error-icon" />
          <p>Failed to load analytics data</p>
          <button onClick={refreshAnalytics} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    totalPredictions = 0,
    fraudDistribution = {},
    riskTrends = [],
  } = analytics || {};

  // Calculate summary stats with safe defaults
  const safeDistribution = {
    Safe: 0,
    'Low Risk': 0,
    'Medium Risk': 0,
    'High Risk': 0,
    ...fraudDistribution,
  };

  const highRiskCount = safeDistribution['High Risk'] || 0;
  const mediumRiskCount = safeDistribution['Medium Risk'] || 0;
  const totalRiskyTransactions = highRiskCount + mediumRiskCount;
  const riskPercentage =
    totalPredictions > 0
      ? ((totalRiskyTransactions / totalPredictions) * 100).toFixed(1)
      : 0;

  return (
    <div className="fraud-analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-title">
          <BarChart3 className="header-icon" />
          <h2>Fraud Detection Analytics</h2>
        </div>
        <div className="header-actions">
          <button onClick={refreshAnalytics} className="action-button">
            <Activity size={16} />
            Refresh
          </button>
          <button onClick={clearData} className="action-button secondary">
            <RotateCcw size={16} />
            Reset Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <Shield className="icon safe" />
          </div>
          <div className="card-content">
            <h3>Total Transactions</h3>
            <p className="metric">{totalPredictions}</p>
            <span className="subtitle">Analyzed</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <AlertTriangle className="icon warning" />
          </div>
          <div className="card-content">
            <h3>Risky Transactions</h3>
            <p className="metric">{totalRiskyTransactions}</p>
            <span className="subtitle">{riskPercentage}% of total</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <TrendingUp className="icon danger" />
          </div>
          <div className="card-content">
            <h3>High Risk</h3>
            <p className="metric">{highRiskCount}</p>
            <span className="subtitle">Immediate attention</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <Activity className="icon info" />
          </div>
          <div className="card-content">
            <h3>Model Status</h3>
            <p className="metric">Active</p>
            <span className="subtitle">Random Forest ML</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Risk Trends Line Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>Risk Score Trends</h3>
            <p>Transaction risk scores over time</p>
          </div>
          <FraudTrendChart data={riskTrends} />
        </div>

        {/* Fraud Distribution Pie Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>Risk Distribution</h3>
            <p>Breakdown of transaction risk levels</p>
          </div>
          <FraudDistributionChart data={analytics.fraudDistribution} />
        </div>
      </div>

      {/* User's Transactions List */}
      {transactions && transactions.length > 0 && (
        <div className="user-transactions-section">
          <TransactionsList
            transactions={transactions.map((transaction) => ({
              id: transaction.transaction_id,
              merchantName: transaction.merchant_category,
              amount: transaction.amount,
              location: transaction.location,
              cardNumber: `****${transaction.transaction_id.slice(-4)}`,
              status: transaction.status || 'unknown', // Use actual status from database
              riskScore: transaction.fraud_prediction?.risk_score || 0,
              fraudProbability:
                (transaction.fraud_prediction?.risk_score || 0) * 100,
              classification:
                transaction.fraud_prediction?.classification || 'Unknown',
              timestamp: transaction.timestamp,
              processingTime: Math.random() * 100 + 50, // Simulated processing time
            }))}
          />
        </div>
      )}
    </div>
  );
};

export default FraudAnalytics;
