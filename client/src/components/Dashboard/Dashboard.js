import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BarChart3, Shield, Activity, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TransactionForm from './TransactionForm';
import FraudAnalytics from './FraudAnalytics';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('transactions');
  const [newPrediction, setNewPrediction] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNewPrediction = (prediction) => {
    setNewPrediction(prediction);
    // Switch to analytics tab when a new prediction is made
    setActiveTab('analytics');
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Header */}
      <nav className="dashboard-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <Shield className="brand-icon" />
            <span className="brand-text">FraudGuard</span>
          </div>

          <div className="nav-menu">
            <div
              className={`nav-item ${
                activeTab === 'transactions' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('transactions')}
              style={{ cursor: 'pointer' }}
            >
              <CreditCard className="nav-icon" />
              <span>Transaction Analysis</span>
            </div>
            <div
              className={`nav-item ${
                activeTab === 'analytics' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('analytics')}
              style={{ cursor: 'pointer' }}
            >
              <BarChart3 className="nav-icon" />
              <span>Fraud Analytics</span>
            </div>
            <div
              className="nav-item"
              onClick={() => navigate('/traffic-generator')}
              style={{ cursor: 'pointer' }}
            >
              <Activity className="nav-icon" />
              <span>Traffic Management</span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-button">
            <LogOut className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'transactions' && (
          <TransactionForm onNewPrediction={handleNewPrediction} />
        )}
        {activeTab === 'analytics' && (
          <FraudAnalytics newPrediction={newPrediction} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
