// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load user and token from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // Helper function to get authorization header
  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const login = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      setIsLoading(false);

      if (response.ok && result.success) {
        console.log('Logged in:', result.user);

        // Store user and token in state and localStorage
        setUser(result.user);
        setToken(result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);

        return {
          success: true,
          user: result.user,
          token: result.token,
          message: result.message,
          redirect: result.redirect,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Login failed',
        };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      return {
        success: false,
        message:
          'Network error. Please check if the backend server is running.',
      };
    }
  };

  const signup = async (data) => {
    setIsLoading(true);
    try {
      // Map frontend form data to backend API format
      const signupData = {
        email: data.email,
        password: data.password,
        username: data.email.split('@')[0], // Generate username from email
        full_name: `${data.firstName} ${data.lastName}`,
        phone: '', // No phone field in frontend form
        role: 'user', // Default role
      };

      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const result = await response.json();
      setIsLoading(false);

      if (response.ok && result.success) {
        console.log('Signed up:', result.user);

        // Store user and token in state and localStorage if signup includes auto-login
        if (result.token) {
          setUser(result.user);
          setToken(result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('token', result.token);
        }

        return {
          success: true,
          user: result.user,
          token: result.token,
          message: result.message,
          redirect: result.redirect,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Signup failed',
        };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Signup error:', error);
      return {
        success: false,
        message:
          'Network error. Please check if the backend server is running.',
      };
    }
  };

  const logout = () => {
    // Clear user data and token
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Transaction API functions
  const submitTransaction = async (transactionData) => {
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(transactionData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          transaction: result.transaction,
          message: result.message,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to submit transaction',
        };
      }
    } catch (error) {
      console.error('Transaction submission error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  };

  const getTransactions = async (limit = 100, skip = 0) => {
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/transactions?limit=${limit}&skip=${skip}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          transactions: result.transactions,
          totalCount: result.total_count,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch transactions',
          transactions: [],
        };
      }
    } catch (error) {
      console.error('Transaction fetch error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        transactions: [],
      };
    }
  };

  const getTransactionStats = async () => {
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          stats: result.stats,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch transaction stats',
          stats: {},
        };
      }
    } catch (error) {
      console.error('Transaction stats fetch error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        stats: {},
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        signup,
        logout,
        submitTransaction,
        getTransactions,
        getTransactionStats,
        isLoading,
        user,
        token,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
