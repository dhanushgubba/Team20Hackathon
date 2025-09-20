import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import { AuthProvider } from './contexts/AuthContext';
import SignupForm from './components/Auth/SignupForm';
import { TransactionList } from './components/Dashboard/TransactionList';
import { KPICard } from './components/Dashboard/KPICard';
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path='/dashboard' element={<KPICard />} />
      </Routes>
    </div>
  );
};

const Main = () => {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
};
export default Main;
