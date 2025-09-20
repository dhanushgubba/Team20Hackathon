import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Only eye icons
import { useAuth } from '../../contexts/AuthContext';
import './SignupForm.css';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  department: yup.string().required('Department is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const departments = [
  'Risk Management',
  'Compliance',
  'Security',
  'Operations',
  'Technology',
  'Finance',
  'Legal',
  'Other',
];

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await signup(data);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        {/* Header */}
        <div className="signup-header">
          <h1 className="signup-title">Join FraudGuard</h1>
          <p className="signup-subtitle">Create your account to get started</p>
        </div>

        {/* Signup Form */}
        <div className="signup-form-container">
          <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
            {/* Name Fields */}
            <div className="name-fields">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  {...register('firstName')}
                  type="text"
                  className={`form-input ${
                    errors.firstName ? 'form-input-error' : ''
                  }`}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="error-message">{errors.firstName.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  {...register('lastName')}
                  type="text"
                  className={`form-input ${
                    errors.lastName ? 'form-input-error' : ''
                  }`}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="error-message">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className={`form-input ${
                  errors.email ? 'form-input-error' : ''
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            {/* Department Field */}
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                {...register('department')}
                className={`form-select ${
                  errors.department ? 'form-input-error' : ''
                }`}
              >
                <option value="">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="error-message">{errors.department.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-container">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${
                    errors.password ? 'form-input-error' : ''
                  }`}
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-container">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-input ${
                    errors.confirmPassword ? 'form-input-error' : ''
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="icon-toggle" />
                  ) : (
                    <Eye className="icon-toggle" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="error-message">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="form-footer">
            <p className="footer-text">
              Already have an account?{' '}
              <Link to="/" className="footer-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <p className="security-text">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
