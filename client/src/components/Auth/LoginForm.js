import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data);

      if (result && result.user) {
        const userRole = result.user.role?.toLowerCase();

        switch (userRole) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'analyst':
            navigate('/analyst/dashboard');
            break;
          case 'demo':
          default:
            navigate('/dashboard');
            break;
        }
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon">
            <Shield className="shield-icon" />
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your FraudGuard account</p>
        </div>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <h3 className="demo-title">Demo Credentials:</h3>
          <div className="demo-list">
            <div className="demo-item">
              <strong>Admin:</strong> admin@fraudguard.com / admin123
            </div>
            <div className="demo-item">
              <strong>Analyst:</strong> analyst@fraudguard.com / analyst123
            </div>
            <div className="demo-item">
              <strong>Demo:</strong> demo@fraudguard.com / demo123
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="login-form-container">
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-container">
                <div className="input-icon">
                  <Mail className="icon" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className={`form-input ${
                    errors.email ? 'form-input-error' : ''
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-container">
                <div className="input-icon">
                  <Lock className="icon" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${
                    errors.password ? 'form-input-error' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="icon-toggle" />
                  ) : (
                    <Eye className="icon-toggle" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="loading-spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="form-footer">
            <p className="footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="footer-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <p className="security-text">
            Protected by enterprise-grade security. Your data is encrypted and
            secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
