import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import './TransactionList.css';

export const TransactionsList = ({ transactions }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="status-icon-approved" />;
      case 'flagged':
        return <AlertTriangle className="status-icon-flagged" />;
      case 'blocked':
        return <XCircle className="status-icon-declined" />;
      case 'declined':
        return <XCircle className="status-icon-declined" />;
      default:
        return <Clock className="status-icon-pending" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-badge approved';
      case 'flagged':
        return 'status-badge flagged';
      case 'blocked':
        return 'status-badge declined';
      case 'declined':
        return 'status-badge declined';
      default:
        return 'status-badge';
    }
  };

  const getClassificationClass = (classification) => {
    switch (classification) {
      case 'Safe':
        return 'classification safe';
      case 'Low Risk':
        return 'classification low';
      case 'Medium Risk':
        return 'classification medium';
      case 'High Risk':
        return 'classification high';
      default:
        return 'classification unknown';
    }
  };

  const getRiskScoreClass = (riskScore) => {
    if (riskScore < 0.3) return 'risk-score low';
    if (riskScore < 0.7) return 'risk-score medium';
    return 'risk-score high';
  };

  return (
    <div className="transactions-list">
      <h3 className="transactions-title">Recent Transactions</h3>

      <div className="transactions-container">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <DollarSign className="empty-icon" />
            <p className="empty-text">
              No transactions yet. Start the generator to see transactions here.
            </p>
          </div>
        ) : (
          transactions.slice(0, 50).map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-left">
                <div className="transaction-status-icon">
                  {getStatusIcon(transaction.status)}
                </div>

                <div className="transaction-details">
                  <div className="transaction-header">
                    <p className="merchant-name">{transaction.merchantName}</p>
                    <span className={getStatusBadgeClass(transaction.status)}>
                      {transaction.status}
                    </span>
                  </div>

                  <div className="transaction-meta">
                    <p className="meta-item">
                      ${transaction.amount.toFixed(2)}
                    </p>
                    <p className="meta-item small">{transaction.location}</p>
                    <p className="meta-item small">{transaction.cardNumber}</p>
                  </div>
                </div>
              </div>

              <div className="transaction-right">
                <div className="risk-scores">
                  <p className={getRiskScoreClass(transaction.riskScore)}>
                    Risk: {(transaction.riskScore * 100).toFixed(1)}%
                  </p>
                  <p className="fraud-score">
                    Fraud: {transaction.fraudProbability.toFixed(1)}%
                  </p>
                  {transaction.classification && (
                    <p
                      className={getClassificationClass(
                        transaction.classification
                      )}
                    >
                      {transaction.classification}
                    </p>
                  )}
                </div>

                <div className="transaction-timing">
                  <p className="timestamp">
                    {new Date(transaction.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="processing-time">
                    {transaction.processingTime.toFixed(1)}ms
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {transactions.length > 50 && (
        <div className="transactions-footer">
          <p className="footer-text">
            Showing latest 50 of {transactions.length.toLocaleString()}{' '}
            transactions
          </p>
        </div>
      )}
    </div>
  );
};
export default TransactionsList;
