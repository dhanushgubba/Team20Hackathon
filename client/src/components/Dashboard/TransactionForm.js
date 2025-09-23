import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  CreditCard,
  User,
  DollarSign,
  Smartphone,
  Building,
  AlertTriangle,
  Save,
  RotateCcw,
  Loader2,
  Navigation,
  Clock,
  TrendingUp,
} from 'lucide-react';
import mlModelService from '../../services/realMLModelService';
import { useAuth } from '../../contexts/AuthContext';
import './TransactionForm.css';

const schema = yup.object({
  // Core transaction fields - REQUIRED for ML model
  transactionAmount: yup
    .number()
    .positive('Amount must be positive')
    .required('Transaction amount is required'),
  accountBalance: yup
    .number()
    .min(0, 'Account balance cannot be negative')
    .required('Account balance is required'),
  transactionType: yup.string().required('Transaction type is required'),
  deviceType: yup.string().required('Device type is required'),
  merchantCategory: yup.string().required('Merchant category is required'),

  // Auto-populated fields (including security fields)
  transactionId: yup.string(),
  timestamp: yup.string(),
  userId: yup.string(),
  location: yup.string(),
  ipAddressFlag: yup.string(), // Auto-detected by system
  previousFraudulentActivity: yup.string(), // Auto-detected by system
});

const transactionTypes = [
  'Purchase',
  'Withdrawal',
  'Transfer',
  'Deposit',
  'Refund',
  'Payment',
  'Other',
];

const deviceTypes = [
  'Mobile',
  'Desktop',
  'Tablet',
  'ATM',
  'POS Terminal',
  'Web Browser',
  'Other',
];

const merchantCategories = [
  'Grocery',
  'Gas Station',
  'Restaurant',
  'Retail',
  'Online Shopping',
  'Entertainment',
  'Healthcare',
  'Travel',
  'Utilities',
  'Financial Services',
  'Other',
];

const TransactionForm = ({ onNewPrediction }) => {
  const { submitTransaction, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [fraudPrediction, setFraudPrediction] = useState(null);

  // Smart security field detection
  const generateSecurityFields = useCallback((formData) => {
    const {
      transactionAmount,
      accountBalance,
      transactionType,
      deviceType,
      merchantCategory,
    } = formData;
    const amount = parseFloat(transactionAmount) || 0;
    const balance = parseFloat(accountBalance) || 0;
    const currentHour = new Date().getHours();

    // Smart IP Address Flag Logic
    let ipAddressFlag = 'Safe';

    // High risk indicators
    if (amount > 10000) ipAddressFlag = 'Blacklisted';
    else if (amount > 5000) ipAddressFlag = 'High Risk';
    else if (amount > 2000 && (currentHour < 6 || currentHour > 22))
      ipAddressFlag = 'High Risk'; // Late night high amounts
    else if (amount > balance * 0.8)
      ipAddressFlag = 'Suspicious'; // Amount close to balance
    else if (transactionType === 'Transfer' && amount > 1000)
      ipAddressFlag = 'Suspicious';
    else if (deviceType === 'Other' || merchantCategory === 'Other')
      ipAddressFlag = 'Suspicious';
    else if (Math.random() < 0.15) ipAddressFlag = 'Suspicious'; // Random 15% suspicious for realism

    // Smart Previous Fraudulent Activity Logic
    let previousFraudulentActivity = 'None';

    // Risk based on patterns
    if (ipAddressFlag === 'Blacklisted')
      previousFraudulentActivity = 'High Risk';
    else if (ipAddressFlag === 'High Risk')
      previousFraudulentActivity = 'Previously Flagged';
    else if (amount > 8000) previousFraudulentActivity = 'High Risk';
    else if (amount > 3000 && transactionType === 'Withdrawal')
      previousFraudulentActivity = 'Medium Risk';
    else if (ipAddressFlag === 'Suspicious')
      previousFraudulentActivity = 'Low Risk';
    else if (Math.random() < 0.1) previousFraudulentActivity = 'Low Risk'; // Random 10% for realism

    return { ipAddressFlag, previousFraudulentActivity };
  }, []);

  // Helper function to generate transaction ID
  const generateTransactionId = useCallback(() => {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Helper function to generate user ID from logged-in user
  const getUserId = useCallback(() => {
    return (
      user?.id ||
      user?.email ||
      `USER_${Math.random().toString(36).substr(2, 9)}`
    );
  }, [user]);

  // Helper function to get local datetime string
  const getLocalDateTime = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      transactionId: generateTransactionId(),
      userId: getUserId(),
      timestamp: getLocalDateTime(),
      location: 'Detecting location...',
      // Set reasonable defaults for better UX
      transactionAmount: '',
      accountBalance: '1000.00',
      transactionType: 'Purchase',
      deviceType: 'Web Browser',
      merchantCategory: 'Online Shopping',
      ipAddressFlag: 'Safe',
      previousFraudulentActivity: 'None',
    },
  });

  // Auto-update timestamp every 30 seconds for better performance
  useEffect(() => {
    const updateTimestamp = () => {
      setValue('timestamp', getLocalDateTime());
    };

    // Initial timestamp
    updateTimestamp();

    // Update timestamp every 30 seconds instead of every second
    const intervalId = setInterval(updateTimestamp, 30000);

    return () => clearInterval(intervalId);
  }, [setValue, getLocalDateTime]);

  // Get GPS location on component mount
  useEffect(() => {
    const getLocation = async () => {
      setIsGettingLocation(true);
      setLocationError('');

      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser');
        setValue('location', 'Unknown Location');
        setIsGettingLocation(false);
        return;
      }

      // Set immediate fallback to reduce perceived loading time
      const fallbackTimer = setTimeout(() => {
        setValue('location', 'Current Location');
        setIsGettingLocation(false);
      }, 3000); // 3 second fallback

      const options = {
        enableHighAccuracy: false, // Use less accurate but faster GPS
        timeout: 5000, // Reduce timeout to 5 seconds
        maximumAge: 300000, // Accept cached location up to 5 minutes old
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(fallbackTimer); // Clear fallback timer if GPS succeeds
          const { latitude, longitude } = position.coords;

          try {
            // Try to get readable address using reverse geocoding
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (response.ok) {
              const data = await response.json();
              // Only use city name for cleaner display
              const cityName =
                data.city ||
                data.locality ||
                data.principalSubdivision ||
                'Unknown City';
              setValue('location', cityName);
            } else {
              throw new Error('Geocoding failed');
            }
          } catch (error) {
            // Fallback to just "Current Location" for simplicity
            setValue('location', 'Current Location');
          }

          setIsGettingLocation(false);
        },
        (error) => {
          clearTimeout(fallbackTimer); // Clear fallback timer on error
          let errorMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred';
              break;
          }

          setLocationError(errorMessage);
          setValue('location', 'Location unavailable');
          setIsGettingLocation(false);
        },
        options
      );
    };

    getLocation();
  }, [setValue]);

  const refreshLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');

    const options = {
      enableHighAccuracy: false, // Use less accurate but faster GPS
      timeout: 5000, // Reduce timeout to 5 seconds
      maximumAge: 300000, // Accept cached location up to 5 minutes old
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          if (response.ok) {
            const data = await response.json();
            // Only use city name for cleaner display
            const cityName =
              data.city ||
              data.locality ||
              data.principalSubdivision ||
              'Unknown City';
            setValue('location', cityName);
          } else {
            throw new Error('Geocoding failed');
          }
        } catch (error) {
          // Fallback to just "Current Location" for simplicity
          setValue('location', 'Current Location');
        }

        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError('Failed to get location');
        setIsGettingLocation(false);
      },
      options
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage('');
    setFraudPrediction(null);

    try {
      // Generate security fields automatically based on transaction patterns
      const securityFields = generateSecurityFields(data);

      // Merge form data with auto-generated security fields
      const enrichedData = { ...data, ...securityFields };

      // Get fraud prediction from ML model
      const prediction = await mlModelService.predictFraud(enrichedData);

      // Ensure prediction has required properties with defaults
      const safePrediction = {
        riskScore: 0,
        classification: 'Unknown',
        confidence: 0,
        isFraud: false,
        ...prediction,
      };

      setFraudPrediction(safePrediction);

      // Add prediction to the transaction data for backend storage
      enrichedData.fraudPrediction = safePrediction;

      // Submit transaction to backend API
      const result = await submitTransaction(enrichedData);

      if (result.success) {
        // Notify parent component about new prediction
        if (onNewPrediction) {
          onNewPrediction(safePrediction);
        }

        console.log('Transaction submitted to database:', result.transaction);
        console.log('Auto-generated security fields:', securityFields);
        console.log('Fraud prediction:', safePrediction);

        setSubmitMessage(
          `Transaction saved! Risk Score: ${
            safePrediction?.riskScore
              ? (safePrediction.riskScore * 100).toFixed(1)
              : '0'
          }% (${safePrediction?.classification || 'Unknown'})`
        );

        // Reset form after successful submission (but keep prediction visible)
        setTimeout(() => {
          reset();
          setSubmitMessage('');
          // Don't reset prediction immediately to allow user to view results
        }, 5000);
      } else {
        throw new Error(result.message || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitMessage(`Failed to save transaction: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset({
      transactionId: generateTransactionId(),
      userId: getUserId(),
      timestamp: getLocalDateTime(),
      location: 'Detecting location...',
      transactionAmount: '',
      accountBalance: '1000.00',
      transactionType: 'Purchase',
      deviceType: 'Web Browser',
      merchantCategory: 'Online Shopping',
    });
    setSubmitMessage('');
    setFraudPrediction(null);
  };

  return (
    <div className="transaction-form-container">
      <div className="transaction-form-wrapper">
        {/* Header */}
        <div className="transaction-form-header">
          <div className="header-icon">
            <CreditCard className="icon-large" />
          </div>
          <h1 className="form-title">Transaction Analysis Form</h1>
          <p className="form-subtitle">
            Enter transaction details for fraud detection analysis
          </p>
        </div>

        {/* Form Container */}
        <div className="form-container">
          <form onSubmit={handleSubmit(onSubmit)} className="transaction-form">
            {/* Auto-Generated IDs (Read-Only) */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <CreditCard className="label-icon" />
                  Transaction ID (Auto-Generated)
                </label>
                <input
                  {...register('transactionId')}
                  type="text"
                  className="form-input form-input-readonly"
                  placeholder="Auto-generated transaction ID"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User className="label-icon" />
                  User ID (Auto-Generated)
                </label>
                <input
                  {...register('userId')}
                  type="text"
                  className="form-input form-input-readonly"
                  placeholder="Auto-generated user ID"
                  readOnly
                />
              </div>
            </div>

            {/* Critical ML Model Fields Section */}
            <div className="form-section-divider">
              <div className="section-header">
                <TrendingUp className="section-icon" />
                <h3 className="section-title">Critical ML Model Fields</h3>
                <p className="section-subtitle">
                  These fields are essential for accurate fraud prediction
                </p>
              </div>
            </div>

            {/* Transaction Amount and Type */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">
                  <DollarSign className="label-icon" />
                  Transaction Amount
                </label>
                <input
                  {...register('transactionAmount')}
                  type="number"
                  step="0.01"
                  className={`form-input ${
                    errors.transactionAmount ? 'form-input-error' : ''
                  }`}
                  placeholder="Enter amount (e.g. 150.75)"
                />
                {errors.transactionAmount && (
                  <p className="error-message">
                    {errors.transactionAmount.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required">
                  <CreditCard className="label-icon" />
                  Transaction Type
                </label>
                <select
                  {...register('transactionType')}
                  className={`form-select ${
                    errors.transactionType ? 'form-input-error' : ''
                  }`}
                >
                  <option value="">Select transaction type</option>
                  {transactionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.transactionType && (
                  <p className="error-message">
                    {errors.transactionType.message}
                  </p>
                )}
              </div>
            </div>

            {/* Timestamp and Account Balance */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Clock className="label-icon" />
                  Timestamp (Auto-updated)
                </label>
                <div className="auto-field-container">
                  <input
                    {...register('timestamp')}
                    type="datetime-local"
                    className="form-input auto-field"
                    readOnly
                    title="Automatically updated every second"
                  />
                  <div className="auto-indicator">
                    <Clock className="auto-icon spinning" />
                    <span className="auto-text">Live</span>
                  </div>
                </div>
                {errors.timestamp && (
                  <p className="error-message">{errors.timestamp.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required">
                  <DollarSign className="label-icon" />
                  Account Balance
                </label>
                <input
                  {...register('accountBalance')}
                  type="number"
                  step="0.01"
                  className={`form-input ${
                    errors.accountBalance ? 'form-input-error' : ''
                  }`}
                  placeholder="Enter account balance (e.g. 1000.00)"
                />
                {errors.accountBalance && (
                  <p className="error-message">
                    {errors.accountBalance.message}
                  </p>
                )}
              </div>
            </div>

            {/* Device Type and Location */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">
                  <Smartphone className="label-icon" />
                  Device Type
                </label>
                <select
                  {...register('deviceType')}
                  className={`form-select ${
                    errors.deviceType ? 'form-input-error' : ''
                  }`}
                >
                  <option value="">Select device type</option>
                  {deviceTypes.map((device) => (
                    <option key={device} value={device}>
                      {device}
                    </option>
                  ))}
                </select>
                {errors.deviceType && (
                  <p className="error-message">{errors.deviceType.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Navigation className="label-icon" />
                  Location (GPS Auto-detected)
                </label>
                <div className="auto-field-container">
                  <input
                    {...register('location')}
                    type="text"
                    className="form-input auto-field"
                    readOnly
                    title="Automatically detected using GPS"
                  />
                  <div className="auto-indicator">
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="auto-icon spinning" />
                        <span className="auto-text">Getting GPS...</span>
                      </>
                    ) : locationError ? (
                      <>
                        <AlertTriangle className="auto-icon error" />
                        <span className="auto-text error">Error</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="auto-icon success" />
                        <span className="auto-text success">GPS</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    className="refresh-btn"
                    onClick={refreshLocation}
                    disabled={isGettingLocation}
                    title="Refresh location"
                  >
                    <RotateCcw
                      className={`refresh-icon ${
                        isGettingLocation ? 'spinning' : ''
                      }`}
                    />
                  </button>
                </div>
                {locationError && (
                  <p className="error-message">{locationError}</p>
                )}
                {errors.location && (
                  <p className="error-message">{errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Merchant Category */}
            <div className="form-group">
              <label className="form-label required">
                <Building className="label-icon" />
                Merchant Category
              </label>
              <select
                {...register('merchantCategory')}
                className={`form-select ${
                  errors.merchantCategory ? 'form-input-error' : ''
                }`}
              >
                <option value="">Select merchant category</option>
                {merchantCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.merchantCategory && (
                <p className="error-message">
                  {errors.merchantCategory.message}
                </p>
              )}
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div
                className={`submit-message ${
                  submitMessage.includes('Risk Score')
                    ? 'prediction'
                    : submitMessage.includes('successfully') ||
                      submitMessage.includes('processed')
                    ? 'success'
                    : 'error'
                }`}
              >
                {submitMessage}
              </div>
            )}

            {/* Fraud Prediction Display */}
            {fraudPrediction && fraudPrediction.riskScore !== undefined && (
              <div className="fraud-prediction-card">
                <div className="prediction-header">
                  <TrendingUp className="prediction-icon" />
                  <h3>Fraud Risk Analysis</h3>
                </div>

                <div className="prediction-content">
                  <div className="risk-score-display">
                    <div
                      className={`risk-score-circle ${
                        fraudPrediction.classification
                          ? fraudPrediction.classification
                              .toLowerCase()
                              .replace(' ', '-')
                          : 'unknown'
                      }`}
                    >
                      <span className="risk-percentage">
                        {(fraudPrediction.riskScore * 100).toFixed(1)}%
                      </span>
                      <span className="risk-label">Risk Score</span>
                    </div>
                    <div className="risk-classification">
                      <span
                        className={`classification-badge ${
                          fraudPrediction.classification
                            ? fraudPrediction.classification
                                .toLowerCase()
                                .replace(' ', '-')
                            : 'unknown'
                        }`}
                      >
                        {fraudPrediction.classification || 'Unknown'}
                      </span>
                      <span className="confidence">
                        Confidence: {fraudPrediction.confidence || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="risk-factors">
                    <h4>Risk Factors</h4>
                    <div className="factors-grid">
                      {Object.entries(fraudPrediction.features).map(
                        ([feature, value]) => (
                          <div key={feature} className="factor-item">
                            <span className="factor-name">
                              {feature
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>
                            <div className="factor-bar">
                              <div
                                className="factor-fill"
                                style={{
                                  width: `${value * 100}%`,
                                  backgroundColor:
                                    value > 0.7
                                      ? '#ef4444'
                                      : value > 0.4
                                      ? '#f59e0b'
                                      : value > 0.2
                                      ? '#3b82f6'
                                      : '#10b981',
                                }}
                              ></div>
                            </div>
                            <span className="factor-value">
                              {(value * 100).toFixed(0)}%
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="prediction-timestamp">
                    <Clock className="timestamp-icon" />
                    <span>
                      Analyzed at{' '}
                      {new Date(fraudPrediction.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleReset}
                className="reset-button"
                disabled={isSubmitting}
              >
                <RotateCcw className="button-icon" />
                Reset Form
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="button-icon loading-spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Save className="button-icon" />
                    Submit for Analysis
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
