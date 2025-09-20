import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BarChart3, Shield, Users } from 'lucide-react';
import TransactionForm from './TransactionForm';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored auth data here if needed
    navigate('/');
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
            <div className="nav-item active">
              <BarChart3 className="nav-icon" />
              <span>Transaction Analysis</span>
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
        <TransactionForm />
      </main>
    </div>
  );
};

export default Dashboard;
