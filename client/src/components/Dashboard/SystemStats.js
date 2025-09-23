import React from 'react';
import { TrendingUp, Shield, AlertTriangle, Activity } from 'lucide-react';
import './SystemStats.css';

export const SystemStats = ({ transactions, isActive }) => {
  const totalTransactions = transactions.length;
  const fraudDetected = transactions.filter(
    (t) => t.status === 'declined' || t.status === 'flagged'
  ).length;
  const approvedTransactions = transactions.filter(
    (t) => t.status === 'approved'
  ).length;
  const declinedTransactions = transactions.filter(
    (t) => t.status === 'declined'
  ).length;

  const fraudRate =
    totalTransactions > 0 ? (fraudDetected / totalTransactions) * 100 : 0;
  const approvalRate =
    totalTransactions > 0
      ? (approvedTransactions / totalTransactions) * 100
      : 0;

  const avgProcessingTime =
    totalTransactions > 0
      ? transactions.reduce((sum, t) => sum + t.processingTime, 0) /
        totalTransactions
      : 0;

  const avgRiskScore =
    totalTransactions > 0
      ? transactions.reduce((sum, t) => sum + t.riskScore, 0) /
        totalTransactions
      : 0;

  const getApprovalRateClass = (rate) => {
    if (rate > 80) return 'success';
    if (rate > 60) return 'warning';
    return 'danger';
  };

  const getFraudRateClass = (rate) => {
    if (rate < 5) return 'success';
    if (rate < 15) return 'warning';
    return 'danger';
  };

  const getProcessingTimeClass = (time) => {
    if (time < 30) return 'success';
    if (time < 50) return 'warning';
    return 'danger';
  };

  const getProcessingTimeText = (time) => {
    if (time < 30) return 'Excellent';
    if (time < 50) return 'Good';
    return 'Needs optimization';
  };

  const getRiskScoreClass = (score) => {
    if (score < 0.3) return 'success';
    if (score < 0.7) return 'warning';
    return 'danger';
  };

  const getRiskScoreText = (score) => {
    if (score < 0.3) return 'Low risk';
    if (score < 0.7) return 'Medium risk';
    return 'High risk';
  };

  return (
    <div className="system-stats">
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-content">
            <p className="stat-label">Total Transactions</p>
            <p className="stat-value primary">
              {totalTransactions.toLocaleString()}
            </p>
          </div>
          <div
            className={`stat-icon-wrapper ${isActive ? 'info' : 'inactive'}`}
          >
            <TrendingUp
              className={`stat-icon ${isActive ? 'info' : 'inactive'}`}
            />
          </div>
        </div>
        <div className="stat-footer">
          <span
            className={`stat-description ${getApprovalRateClass(approvalRate)}`}
          >
            {approvalRate.toFixed(1)}% approval rate
          </span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-content">
            <p className="stat-label">Fraud Detected</p>
            <p className="stat-value danger">
              {fraudDetected.toLocaleString()}
            </p>
          </div>
          <div className="stat-icon-wrapper danger">
            <AlertTriangle className="stat-icon danger" />
          </div>
        </div>
        <div className="stat-footer">
          <span className={`stat-description ${getFraudRateClass(fraudRate)}`}>
            {fraudRate.toFixed(1)}% fraud rate
          </span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-content">
            <p className="stat-label">Processing Time</p>
            <p className="stat-value info">{avgProcessingTime.toFixed(1)}ms</p>
          </div>
          <div className="stat-icon-wrapper info">
            <Activity className="stat-icon info" />
          </div>
        </div>
        <div className="stat-footer">
          <span
            className={`stat-description ${getProcessingTimeClass(
              avgProcessingTime
            )}`}
          >
            {getProcessingTimeText(avgProcessingTime)}
          </span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-content">
            <p className="stat-label">Avg Risk Score</p>
            <p className={`stat-value ${getRiskScoreClass(avgRiskScore)}`}>
              {(avgRiskScore * 100).toFixed(1)}%
            </p>
          </div>
          <div
            className={`stat-icon-wrapper ${getRiskScoreClass(avgRiskScore)}`}
          >
            <Shield
              className={`stat-icon ${getRiskScoreClass(avgRiskScore)}`}
            />
          </div>
        </div>
        <div className="stat-footer">
          <span
            className={`stat-description ${getRiskScoreClass(avgRiskScore)}`}
          >
            {getRiskScoreText(avgRiskScore)}
          </span>
        </div>
      </div>
    </div>
  );
};
