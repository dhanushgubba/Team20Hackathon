// contexts/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1000));
    console.log('Logged in:', data);
    setIsLoading(false);

    // Return mock user data for role-based navigation
    return {
      user: {
        email: data.email,
        role: data.email.includes('admin')
          ? 'admin'
          : data.email.includes('analyst')
          ? 'analyst'
          : 'demo',
      },
    };
  };

  const signup = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          username: `${data.firstName}${data.lastName}`.replace(/\s+/g, '').toLowerCase(),
          full_name: `${data.firstName} ${data.lastName}`,
          phone: '',
          role: 'user',
        }),
      });
      const result = await response.json();
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'Signup failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ login, signup, isLoading }}>
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
