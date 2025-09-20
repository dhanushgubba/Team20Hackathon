import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Activity, Zap } from 'lucide-react';
import { fraudService } from '../services/fraudService';
import './TrafficGenerator.css';

export const TrafficGenerator = ({
  onTransactionGenerated,
  isActive: propIsActive,
  onToggle,
}) => {
  const [rate, setRate] = useState(5);
  const [burstMode, setBurstMode] = useState(false);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [currentTps, setCurrentTps] = useState(0);
  const [internalIsActive, setInternalIsActive] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [faultCount, setFaultCount] = useState(0);
  const [totalProcessingTime, setTotalProcessingTime] = useState(0);

  // Calculate derived statistics
  const faultRate =
    totalGenerated > 0 ? ((faultCount / totalGenerated) * 100).toFixed(2) : 0;
  const avgProcessingTime =
    totalGenerated > 0 ? (totalProcessingTime / totalGenerated).toFixed(2) : 0;

  // Use prop isActive if provided, otherwise use internal state
  const isActive = propIsActive !== undefined ? propIsActive : internalIsActive;

  useEffect(() => {
    console.log(
      'useEffect triggered with isActive:',
      isActive,
      'rate:',
      rate,
      'burstMode:',
      burstMode
    );
    let interval;

    if (isActive) {
      console.log('Starting transaction generation...');
      const intervalTime = burstMode ? 50 : 1000 / rate;
      let transactionsThisSecond = 0;
      let secondStart = Date.now();

      interval = setInterval(() => {
        console.log('Generating transaction...');
        const startTime = Date.now();
        const transaction = fraudService.generateTransaction();
        const processingTime = Date.now() - startTime;
        console.log('Generated transaction:', transaction);

        // Store recent transactions (keep last 10)
        setRecentTransactions((prev) => {
          const updated = [transaction, ...prev].slice(0, 10);
          return updated;
        });

        // Store all transactions
        setAllTransactions((prev) => [transaction, ...prev]);

        // Track fault rate (flagged or declined transactions)
        if (
          transaction.status === 'flagged' ||
          transaction.status === 'declined'
        ) {
          setFaultCount((prev) => prev + 1);
        }

        // Track processing time
        setTotalProcessingTime((prev) => prev + processingTime);

        if (onTransactionGenerated) {
          onTransactionGenerated(transaction);
        } else {
          console.log('Generated transaction:', transaction);
        }
        setTotalGenerated((prev) => prev + 1);
        transactionsThisSecond++;

        const now = Date.now();
        if (now - secondStart >= 1000) {
          setCurrentTps(transactionsThisSecond);
          transactionsThisSecond = 0;
          secondStart = now;
        }
      }, intervalTime);
    } else {
      console.log('Traffic generator is inactive, setting currentTps to 0');
      setCurrentTps(0);
    }

    return () => {
      if (interval) {
        console.log('Cleaning up interval');
        clearInterval(interval);
      }
    };
  }, [isActive, rate, burstMode, onTransactionGenerated]);

  const handleStart = () => {
    console.log('Starting traffic generator...');
    if (onToggle) {
      onToggle(true);
    } else {
      setInternalIsActive(true);
    }
    console.log(
      'isActive will be:',
      propIsActive !== undefined ? propIsActive : true
    );
  };

  const handlePause = () => {
    if (onToggle) {
      onToggle(false);
    } else {
      setInternalIsActive(false);
    }
  };

  const handleStop = () => {
    if (onToggle) {
      onToggle(false);
    } else {
      setInternalIsActive(false);
    }
    setCurrentTps(0);
  };

  const handleClearAll = () => {
    // First stop the generator
    if (onToggle) {
      onToggle(false);
    } else {
      setInternalIsActive(false);
    }
    // Then clear all data
    setTotalGenerated(0);
    setCurrentTps(0);
    setRecentTransactions([]);
    setAllTransactions([]);
    setFaultCount(0);
    setTotalProcessingTime(0);
  };

  return (
    <div className="traffic-generator">
      <div className="traffic-generator-header">
        <div>
          <h3 className="traffic-generator-title">Traffic Generator</h3>
          <p className="traffic-generator-subtitle">
            Simulate high-volume transaction traffic for testing
          </p>
        </div>
        <div className="status-indicator">
          <div className={`status-icon ${isActive ? 'active' : 'inactive'}`}>
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-value blue">
            {totalGenerated.toLocaleString()}
          </div>
          <div className="stat-label blue">Total Generated</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value green">{currentTps}</div>
          <div className="stat-label green">Current TPS</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-value purple">{rate}</div>
          <div className="stat-label purple">Target TPS</div>
        </div>
      </div>

      <div className="controls-section">
        <div className="rate-control">
          <label className="rate-label">Transaction Rate (TPS)</label>
          <input
            type="range"
            min="1"
            max="100"
            value={rate}
            onChange={(e) => setRate(parseInt(e.target.value))}
            className="rate-slider"
            disabled={isActive}
          />
          <div className="rate-range">
            <span>1 TPS</span>
            <span>100 TPS</span>
          </div>
        </div>

        <div className="burst-control">
          <label className="burst-checkbox-wrapper">
            <input
              type="checkbox"
              checked={burstMode}
              onChange={(e) => setBurstMode(e.target.checked)}
              className="burst-checkbox"
              disabled={isActive}
            />
            <span className="burst-label">Burst Mode</span>
          </label>
          <div className="burst-info">
            <Zap className="w-4 h-4" />
            <span className="burst-info-text">High-intensity testing</span>
          </div>
        </div>

        <div className="button-group">
          {!isActive ? (
            <button onClick={handleStart} className="control-button start">
              <Play className="button-icon" />
              Start Generator
            </button>
          ) : (
            <button onClick={handlePause} className="control-button pause">
              <Pause className="button-icon" />
              Pause
            </button>
          )}
          <button onClick={handleStop} className="control-button stop">
            <Square className="button-icon" />
            Stop
          </button>
          <button onClick={handleClearAll} className="control-button clear">
            <Square className="button-icon" />
            Clear All
          </button>
        </div>
      </div>

      {/* Summary Statistics Section */}
      <div className="summary-stats-section">
        <h4 className="summary-title">Performance Summary</h4>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value">{totalGenerated}</div>
            <div className="summary-label">Generated Transactions</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{faultRate}%</div>
            <div className="summary-label">Fault Rate</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{avgProcessingTime}ms</div>
            <div className="summary-label">Avg Processing Time</div>
          </div>
        </div>
      </div>

      {/* All Transactions Display */}
      <div className="transactions-section">
        <div className="transactions-header">
          <h4 className="transactions-title">All Transactions</h4>
          <div className="transactions-count">
            {allTransactions.length} transaction
            {allTransactions.length !== 1 ? 's' : ''} generated
          </div>
        </div>
        <div className="transactions-container">
          {allTransactions.length === 0 ? (
            <div className="no-transactions">
              {isActive
                ? 'Generating transactions...'
                : 'Click "Start Generator" to begin generating transactions'}
            </div>
          ) : (
            <div className="transactions-list">
              {allTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`transaction-item-simple ${transaction.status.toLowerCase()}`}
                >
                  <div className="transaction-row">
                    <div className="transaction-main-info">
                      <span className="transaction-id-simple">
                        {transaction.id}
                      </span>
                      <span className="merchant-location">
                        {transaction.merchant} • {transaction.location}
                      </span>
                    </div>
                    <div className="transaction-amount">
                      ${transaction.amount}
                    </div>
                    <div className="transaction-risk">
                      <span
                        className={`risk-badge risk-${transaction.status.toLowerCase()}`}
                      >
                        {transaction.riskScore}
                      </span>
                    </div>
                    <div
                      className={`transaction-status-simple status-${transaction.status.toLowerCase()}`}
                    >
                      {transaction.status}
                    </div>
                    <div className="transaction-time-simple">
                      {new Date(transaction.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TrafficGenerator;
